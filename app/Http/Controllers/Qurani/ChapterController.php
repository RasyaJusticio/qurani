<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Verses;
use App\Models\Qurani\Word;
use App\Traits\ErrorLabel;
use App\Traits\FetchWords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChapterController extends Controller
{
    use FetchWords, ErrorLabel;

    public function show($id, Request $request)
    {
        if ($id < 1 || $id > 114) {
            abort(404, 'Surah tidak ditemukan');
        }

        $reciter = $request->input('reciter', 'teman');
        $selectedGroup = $request->input('id_grup', null);
        $anggota = $request->input('anggota', null);

        if ($reciter == "grup") {
            session()->put('reciter_data', [
                'value' => $reciter, // Data reciter yang sebenarnya
                'expires_at' => now()->addDays(7)->timestamp, // Timestamp kapan data ini kedaluwarsa
            ]);
            if ($selectedGroup) {
                session()->put("grup_id", [
                    'value' => $selectedGroup,
                    'expires_at' => now()->addDays(7)->timestamp
                ]);
            }
        } else {
            session()->put('reciter_data', [
                'value' => null, // Data reciter yang sebenarnya
                'expires_at' => now()->addDays(7)->timestamp, // Timestamp kapan data ini kedaluwarsa
            ]);
        }

        session()->put('anggota', [
            'value' => $anggota,
            'expires_at' => now()->addDays(7)->timestamp
        ]);

        $surah = Chapter::findOrFail($id, [
            'id',
            'revelation_place',
            'bismillah_pre',
            'name_simple',
            'name_arabic',
            'verses_count',
            'translated_name'
        ]);

        $verses = Verses::where('verse_key', 'like', $id . ':%')
            ->orderBy('verse_number')
            ->select([
                'id',
                'verse_number',
                'verse_key',
                'text_uthmani',
                'page_number',
                'juz_number'
            ])
            ->get();

        if ($verses->isNotEmpty()) {
            $verseKeys = $verses->pluck('verse_key')->toArray();
            $wordsGroup = $this->fetchWordsForVerses($verseKeys);
            $errorLabel = $this->ErrorLabelGenerate(Auth::user());
            $endMarkers = Word::where(function ($query) use ($verseKeys) {
                foreach ($verseKeys as $key) {
                    $query->orWhere('location', 'like', $key . ':%');
                }
            })
                ->where('char_type_name', 'end')
                ->select(['location', 'text_uthmani'])
                ->get()
                ->keyBy(function ($word) {
                    [$surah, $verse] = explode(':', $word->location);
                    return "$surah:$verse";
                });

            $verses->transform(callback: function ($verse) use ($wordsGroup, $endMarkers) {
                $verse->words = $wordsGroup->get($verse->verse_key, collect())->map(function ($word) {
                    return [
                        'id' => $word->id,
                        'position' => $word->position,
                        'text_uthmani' => $word->text_uthmani,
                        'text_indopak' => $word->text_indopak,
                        'char_type_name' => $word->char_type_name,
                        'location' => $word->location,
                        "line_number" => $word->line_number,
                    ];
                })
                    // ->filter(function ($word) {
                    //     return $word['char_type_name'] === 'word';
                    // })
                    ->values();
                $verse->end_marker = $endMarkers->get($verse->verse_key, (object) ['text_uthmani' => ''])->text_uthmani;
                return $verse;
            });
        }

        $settingUser = false;

        if (session("reciter_data")) {
            $reciterData = session("reciter_data")['value'];
            $settingUser = $reciterData == "grup" ? false : true;
        }

        Log::info($verses->toArray());

        return Inertia::render('surah/Index', [
            'surah' => [
                'id' => $surah->id,
                'revelation_place' => $surah->revelation_place,
                'bismillah_pre' => $surah->bismillah_pre,
                'name_simple' => $surah->name_simple,
                'name_arabic' => $surah->name_arabic,
                'verses_count' => $surah->verses_count,
                'translated_name' => $surah->translated_name
            ],
            'verses' => $verses,
            'errorLabels' => $errorLabel,
            "setting" => $settingUser,
        ]);
    }
}
