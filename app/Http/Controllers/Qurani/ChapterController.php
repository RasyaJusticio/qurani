<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Verses;
use App\Models\Qurani\Word;
use App\Traits\FetchWords;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChapterController extends Controller
{
    use FetchWords;

    public function show($id, Request $request)
    {
        if ($id < 1 || $id > 114) {
            abort(404, 'Surah tidak ditemukan');
        }

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
                        'char_type_name' => $word->char_type_name,
                        'location' => $word->location
                    ];
                })->filter(function ($word) {
                    return $word['char_type_name'] === 'word';
                })->values();
                $verse->end_marker = $endMarkers->get($verse->verse_key, (object)['text_uthmani' => ''])->text_uthmani;
                return $verse;
            });
        }

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
            'verses' => $verses
        ]);
    }
}
