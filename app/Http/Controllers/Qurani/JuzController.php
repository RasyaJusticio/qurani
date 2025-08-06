<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\Qurani\Juz;
use App\Models\Qurani\Verses;
use App\Models\Qurani\Word;
use App\Models\Qurani\Chapter;
use App\Traits\ErrorLabel;
use App\Traits\FetchWords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JuzController extends Controller
{
    use FetchWords, ErrorLabel;

    public function show($id, Request $request)
    {
        // Validate Juz ID
        if ($id < 1 || $id > 30) {
            abort(404, 'Juz tidak ditemukan');
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
                ]); // Simpan grup yang dipilih
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

        // Fetch Juz details
        $juz = Juz::findOrFail($id, [
            'id',
            'juz_number',
            'pages',
            'verse_mapping',
            'verses_count'
        ]);

        // Parse verse_mapping to get verse keys and surah IDs
        $verseKeys = [];
        $surahIds = [];
        $errorLabel = $this->ErrorLabelGenerate(Auth::user());
        foreach ($juz->verse_mapping as $surah => $range) {
            $surahIds[] = (int) $surah;
            [$start, $end] = explode('-', $range);
            for ($i = (int) $start; $i <= (int) $end; $i++) {
                $verseKeys[] = "$surah:$i";
            }
        }

        // Fetch chapters for the Surahs
        $chapters = Chapter::whereIn('id', $surahIds)
            ->select([
                'id',
                'name_arabic',
                'name_simple',
                'translated_name',
                'bismillah_pre'
            ])
            ->get()
            ->keyBy('id');

        // Fetch verses for the Juz
        $verses = Verses::whereIn('verse_key', $verseKeys)
            ->select([
                'id',
                'verse_number',
                'verse_key',
                'text_uthmani',
                'page_number',
                'juz_number'
            ])
            ->get();
        $sortedVerses = $verses->sortBy(function ($verse) {
            list($surah, $ayat) = explode(':', $verse->verse_key);
            $surah = (int) $surah;
            $ayat = (int) $ayat;
            return ($surah * 10000) + $ayat;
        })->values();

        // Fetch words and end markers
        if ($sortedVerses->isNotEmpty()) {
            $verseKeys = $sortedVerses->pluck('verse_key')->toArray();
            $wordsGroup = $this->fetchWordsForVerses($verseKeys);
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

            $sortedVerses->transform(function ($verse) use ($wordsGroup, $endMarkers) {
                $verse->words = $wordsGroup->get($verse->verse_key, collect())->map(function ($word) {
                    return [
                        'id' => $word->id,
                        'position' => $word->position,
                        "location" => $word->location,
                        'text_uthmani' => $word->text_uthmani,
                        'text_indopak' => $word->text_indopak,
                        'char_type_name' => $word->char_type_name,
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

        // Render the Inertia view
        return Inertia::render('juz/Index', [
            'juz' => [
                'id' => $juz->id,
                'juz_number' => $juz->juz_number,
                'pages' => $juz->pages,
                'verses_count' => $juz->verses_count
            ],
            'verses' => $sortedVerses,
            'chapters' => $chapters,
            'errorLabels' => $errorLabel,
            'setting' => $settingUser,
        ]);
    }

    public function api($id, Request $request)
    {
        $juz = Juz::findOrFail($id, [
            'id',
            'juz_number',
            'pages',
            'verse_mapping',
            'verses_count'
        ]);

        // Parse verse_mapping to get verse keys and surah IDs
        $verseKeys = [];
        $surahIds = [];
        foreach ($juz->verse_mapping as $surah => $range) {
            $surahIds[] = (int) $surah;
            [$start, $end] = explode('-', $range);
            for ($i = (int) $start; $i <= (int) $end; $i++) {
                $verseKeys[] = "$surah:$i";
            }
        }

        // Fetch chapters for the Surahs
        $chapters = Chapter::whereIn('id', $surahIds)
            ->select([
                'id',
                'name_arabic',
                'name_simple',
                'translated_name',
                'bismillah_pre'
            ])
            ->get()
            ->keyBy('id');

        // Fetch verses for the Juz
        $verses = Verses::whereIn('verse_key', $verseKeys)
            ->select([
                'id',
                'verse_number',
                'verse_key',
                'text_uthmani',
                'page_number',
                'juz_number'
            ])
            ->get();

        // Urutkan koleksi verses menggunakan custom callback
        $sortedVerses = $verses->sortBy(function ($verse) {
            list($surah, $ayat) = explode(':', $verse->verse_key);
            $surah = (int) $surah;
            $ayat = (int) $ayat;
            return ($surah * 10000) + $ayat;
        })->values();

        return response()->json([
            'juz' => [
                'id' => $juz->id,
                'juz_number' => $juz->juz_number,
                'pages' => $juz->pages,
                'verses_count' => $juz->verses_count
            ],
            'verses' => $sortedVerses,
            'chapters' => $chapters,
            // 'errorLabels' => $errorLabel,
        ], 200);
    }
}
