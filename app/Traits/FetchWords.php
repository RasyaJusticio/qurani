<?php

namespace App\Traits;

use App\Models\Qurani\Word;

trait FetchWords
{
    protected function fetchWordsForVerses(array $verseKeys)
    {
        return Word::where(function ($query) use ($verseKeys) {
                foreach ($verseKeys as $key) {
                    $query->orWhere('location', 'like', $key . ':%');
                }
            })
            ->orderBy('position')
            ->get()
            ->groupBy(function ($word) {
                [$surah, $ayah] = explode(':', $word->location);
                return "$surah:$ayah";
            });
    }
}
