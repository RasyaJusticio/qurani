<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\LinkID\Group;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Juz;
use Illuminate\Http\Request;
use App\Models\LinkID\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $friends = User::select(
            DB::raw("CONCAT(user_firstname, ' ', user_lastname) AS user_fullname"),
            'user_name'
        )->limit(10)->get();

        $groups = Group::select('group_id','group_title')->get();

        $chapters = Chapter::select('id', 'name_simple')->get()->map(function ($chapter) {
            return [
                'id' => (string) $chapter->id,
                'name' => $chapter->name_simple,
            ];
        });

        $juzs = Juz::select('');

        return Inertia::render('index', [
            'friends' => $friends,
            'groups' => $groups,
            'chapters' => $chapters
        ]);
    }
}
