<?php

namespace App\Http\Controllers\Qurani;

use App\Models\Qurani\Chapter;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ChapterController extends Controller
{
    public function index()
    {
        $chapters = Chapter::select('id', 'name_simple')->get()->map(function ($chapter) {
            return [
                'value' => (string) $chapter->id,
                'name' => $chapter->name_simple,
            ];
        });

        return Inertia::render('index', [
            'chapters' => $chapters,
        ]);
    }
}
