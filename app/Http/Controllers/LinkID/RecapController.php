<?php

namespace App\Http\Controllers\LinkID;

use App\Http\Controllers\Controller;
use App\Models\LinkID\QuSetoran;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Juz;
use App\Models\Qurani\Verses;
use App\Models\Qurani\Word;
use App\Traits\ErrorLabel;
use App\Traits\FetchWords;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RecapController extends Controller
{
    use FetchWords, ErrorLabel;

    public function validateRouteSetoran($id, Request $request)
    {
        $setoran = QuSetoran::findOrFail($id);

        Log::info($setoran);

        switch ($setoran->tampilan) {
            case 'surah':
                # code...
                return $this->chapter($setoran->nomor);
            case 'juz':
                # code...
                return $this->juz($setoran->nomor);
            case 'page':
                return $this->page($setoran->nomor);
        }
    }

    public function chapter($id)
    {
        // Validate chapter ID
        if ($id < 1 || $id > 114) {
            abort(404, 'Surah tidak ditemukan');
        }

        $user = Auth::user();

        // Fetch chapter details
        $surah = Chapter::findOrFail($id, [
            'id',
            'revelation_place',
            'bismillah_pre',
            'name_simple',
            'name_arabic',
            'verses_count',
            'translated_name'
        ]);

        // Fetch all verses for the chapter
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
                        'char_type_name' => $word->char_type_name,
                        'location' => $word->location,
                        "line_number" => $word->line_number
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

        return Inertia::render('surah/History', [
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
        ]);
    }

    public function juz($id)
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

        // Parse verse_mapping to get verse keys and surah IDs
        $verseKeys = [];
        $surahIds = [];
        // $errorLabel = $this->ErrorLabelGenerate(Auth::user());
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
                        'char_type_name' => $word->char_type_name,
                        "line_number" => $word->line_number
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

        return Inertia::render("juz/History", [
            'juz' => [
                'id' => $juz->id,
                'juz_number' => $juz->juz_number,
                'pages' => $juz->pages,
                'verses_count' => $juz->verses_count
            ],
            'verses' => $sortedVerses,
            'chapters' => $chapters,
        ]);
    }

    public function page($id)
    {
        if ($id < 1 || $id > 604) {
            abort(404, 'Halaman tidak ditemukan');
        }

        $verses = Verses::where('page_number', $id)
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

        $surahIds = $verses->map(function ($verse) {
            return (int) explode(':', $verse->verse_key)[0];
        })->unique()->values()->toArray();

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
                        'char_type_name' => $word->char_type_name,
                        'location' => $word->location,
                        "line_number" => $word->line_number
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

        return Inertia::render('page/History', [
            'page' => [
                'page_number' => (int) $id
            ],
            'verses' => $verses,
            'chapters' => $chapters,
        ]);
    }
}
