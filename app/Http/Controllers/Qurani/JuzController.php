<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\Qurani\Juz;
use App\Models\Qurani\Verses;
use App\Models\Qurani\Word;
use App\Traits\FetchWords;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JuzController extends Controller
{
    use FetchWords;

    public function show($id, Request $request)
    {
        // Validate Juz ID
        if ($id < 1 || $id > 30) {
            abort(404, 'Juz tidak ditemukan');
        }

        // Fetch Juz details
        $juz = Juz::findOrFail($id, [
            'id',
            'juz_number',
            'pages',
            'verse_mapping',
            'verses_count'
        ]);

        // Fetch verses for the Juz
        $verses = Verses::whereBetween('id', [$juz->first_verse_id, $juz->last_verse_id])
            ->orderBy('verse_key')
            ->select([
                'id',
                'verse_number',
                'verse_key',
                'text_uthmani',
                'page_number',
                'juz_number'
            ])
            ->get();

        // Fetch words and end markers
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

            $verses->transform(function ($verse) use ($wordsGroup, $endMarkers) {
                $verse->words = $wordsGroup->get($verse->verse_key, collect())->map(function ($word) {
                    return [
                        'id' => $word->id,
                        'position' => $word->position,
                        'text_uthmani' => $word->text_uthmani,
                        'char_type_name' => $word->char_type_name
                    ];
                })->filter(function ($word) {
                    return $word['char_type_name'] === 'word';
                })->values();
                $verse->end_marker = $endMarkers->get($verse->verse_key, (object)['text_uthmani' => ''])->text_uthmani;
                return $verse;
            });
        }

        // Render the Inertia view
        return Inertia::render('juz/Index', [
            'juz' => [
                'id' => $juz->id,
                'juz_number' => $juz->juz_number,
                'pages' => $juz->pages,
                'verses_count' => $juz->verses_count
            ],
            'verses' => $verses
        ]);
    }
}
