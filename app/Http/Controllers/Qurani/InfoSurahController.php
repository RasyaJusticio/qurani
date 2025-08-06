<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\ChapterInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InfoSurahController extends Controller
{
    public function index($id)
    {
        $chapterInfo = ChapterInfo::where("id", $id)->select([
            "chapter_id",
            "en_us",
            "id_id",

        ])->first();
        $chapter = Chapter::where("id", $id)->select([
            "id",
            "name_simple"
        ])->first();
        Log::info($chapterInfo);
        return Inertia::render(
            "info/index",
            [
                "chapter" => $chapter,
                "id_id" => $chapterInfo->id_id,
                "en_us" => $chapterInfo->en_us,
            ]
        );

    }
}
