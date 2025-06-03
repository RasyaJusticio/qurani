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
use Exception;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        try {
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

            $juzs = Juz::select('id')->get();

            $userSettings = $this->getUserSettings(4);

            return Inertia::render('index', [
                'friends' => $friends,
                'groups' => $groups,
                'chapters' => $chapters,
                'juzs' => $juzs,
                'userSettings' => $userSettings,
            ]);

        } catch (Exception $e) {
            return Inertia::render('index', [
                'friends' => [],
                'groups' => [],
                'chapters' => [],
                'juzs' => [],
                'userSettings' => [],
                'parentData' => null,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function getUserSettings($userId)
    {
        try {
            return DB::connection('linkid')->select("
                SELECT
                    g.id,
                    g.`key`,
                    COALESCE(u.`value`, g.`value`) AS `value`,
                    g.color,
                    g.status
                FROM qu_setting_global AS g
                LEFT JOIN qu_setting_user AS u
                  ON u.setting = g.id
                 AND u.user = ?
                ORDER BY g.id
            ", [$userId]);
        } catch (Exception $e) {
            return [];
        }
    }
}
