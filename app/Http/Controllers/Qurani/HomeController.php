<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\LinkID\Group;
use App\Models\Qurani\Chapter;
use App\Models\Qurani\Juz;
use Illuminate\Http\Request;
use App\Models\LinkID\User;
use App\Models\LinkID\QuSetoran;
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

            $groups = Group::select('group_id', 'group_title')->get();

            $chapters = Chapter::select('id', 'name_simple')->get()->map(function ($chapter) {
                return [
                    'id' => (string) $chapter->id,
                    'name' => $chapter->name_simple,
                ];
            });

            $juzs = Juz::select('id')->get();

            $userSettings = $this->getUserSettings(4);

            $setoran = QuSetoran::select(
                'qu_setoran.id',
                'qu_setoran.tgl',
                DB::raw("CONCAT(penyetor.user_firstname, ' ', penyetor.user_lastname) AS reciter_name"),
                DB::raw("CONCAT(penerima.user_firstname, ' ', penerima.user_lastname) AS recipient_name"),
                'qu_setoran.setoran',
                'qu_setoran.tampilan',
                'qu_setoran.nomor',
                'qu_setoran.info',
                'qu_setoran.hasil',
                'qu_setoran.paraf'
            )
                ->join('users AS penyetor', 'qu_setoran.penyetor', '=', 'penyetor.user_id')
                ->join('users AS penerima', 'qu_setoran.penerima', '=', 'penerima.user_id')
                ->orderBy('qu_setoran.tgl', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'time' => \Carbon\Carbon::parse($item->tgl)->toDateTimeString(),
                        'reciter' => $item->reciter_name,
                        'recipient' => $item->recipient_name,
                        'recite' => ucfirst($item->setoran) . ' ' . ucfirst($item->tampilan) . ' ' . $item->nomor . ':' . $item->info,
                        'results' => $item->hasil,
                        'signature' => $item->paraf ? 'Signed' : 'Unsigned',
                    ];
                });
                

            return Inertia::render('index', [
                'friends' => $friends,
                'groups' => $groups,
                'chapters' => $chapters,
                'juzs' => $juzs,
                'userSettings' => $userSettings,
                'setoran' => $setoran,
            ]);

        } catch (Exception $e) {
            return Inertia::render('index', [
                'friends' => [],
                'groups' => [],
                'chapters' => [],
                'juzs' => [],
                'userSettings' => [],
                'setoran' => [],
                'error' => $e->getMessage(),
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
