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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Exception;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $uId = $request->cookie('u_id');
            $friends = $this->getFriends();
            $groups = $this->getGroups();
            $chapters = $this->getChapters();
            $juzs = $this->getJuzs();
            $userSettings = $this->getUserSettings(4);
            $setoran = $this->getSetoran();
            $setoranRekap = $this->getSetoranRekap();
            $setoranRekapTotal = $this->getSetoranRekapTotal();
            $periodes = $this->getPeriodes();

            return Inertia::render('index', [
                'friends' => $friends,
                'groups' => $groups,
                'chapters' => $chapters,
                'juzs' => $juzs,
                'userSettings' => $userSettings,
                'setoran' => $setoran,
                'setoranRekap' => $setoranRekap,
                'setoranRekapTotal' => $setoranRekapTotal,
                'periodes' => $periodes,
                'u_id' => $uId
            ]);
        } catch (Exception $e) {
            Log::error('Error in HomeController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('index', [
                'friends' => [],
                'groups' => [],
                'chapters' => [],
                'juzs' => [],
                'userSettings' => [],
                'setoran' => [],
                'setoranRekap' => [],
                'setoranRekapTotal' => [],
                'periodes' => [],
                'error' => 'Terjadi kesalahan saat memuat data'
            ]);
        }
    }

    private function getFriends()
    {
        try {
            $uId = request()->cookie('u_id');
            if (!$uId) {
                return [];
            }

            $friendsAsUserOne = DB::connection('linkid')
                ->table('friends')
                ->join('users', 'friends.user_two_id', '=', 'users.user_id')
                ->where('friends.user_one_id', $uId)
                ->where('friends.status', 1)
                ->select(
                    'users.user_id',
                    'users.user_name',
                    DB::raw("CONCAT(users.user_firstname, ' ', users.user_lastname) AS user_fullname")
                );

            $friendsAsUserTwo = DB::connection('linkid')
                ->table('friends')
                ->join('users', 'friends.user_one_id', '=', 'users.user_id')
                ->where('friends.user_two_id', $uId)
                ->where('friends.status', 1)
                ->select(
                    'users.user_id',
                    'users.user_name',
                    DB::raw("CONCAT(users.user_firstname, ' ', users.user_lastname) AS user_fullname")
                );

            return $friendsAsUserOne->union($friendsAsUserTwo)
                ->limit(10)
                ->get()
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getFriends', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getGroups()
    {
        try {
            $uId = request()->cookie('u_id');
            if (!$uId) {
                return [];
            }

            return Group::with(['users' => function ($query) use ($uId) {
                $query->where('users.user_id', '!=', $uId);
            }])
                ->whereHas('users', function ($query) use ($uId) {
                    $query->where('users.user_id', $uId);
                })
                ->select('group_id', 'group_title')
                ->get()
                ->map(function ($group) {
                    return [
                        'group_id' => $group->group_id,
                        'group_title' => $group->group_title,
                        'users' => $group->users->map(function ($user) {
                            return [
                                'user_id' => $user->user_id,
                                'user_fullname' => $user->user_fullname,
                                'user_name' => $user->user_name
                            ];
                        })->toArray()
                    ];
                })
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getGroups', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getChapters()
    {
        try {
            return Chapter::select('id', 'name_simple')
                ->get()
                ->map(function ($chapter) {
                    return [
                        'id' => (string) $chapter->id,
                        'name' => $chapter->name_simple,
                    ];
                })
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getChapters', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getJuzs()
    {
        try {
            return Juz::select('id')
                ->get()
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getJuzs', ['message' => $e->getMessage()]);
            return [];
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
            Log::error('Error in getUserSettings', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getSetoran()
{
    try {
        $uId = request()->cookie('u_id');
        if (!$uId) {
            return [];
        }

        return QuSetoran::select(
            'qu_setoran.id',
            'qu_setoran.tgl',
            DB::raw("CONCAT(penyetor.user_firstname, ' ', penyetor.user_lastname) AS reciter_name"),
            'penyetor.user_name AS reciter_username',
            DB::raw("CONCAT(penerima.user_firstname, ' ', penerima.user_lastname) AS recipient_name"),
            'penerima.user_name AS recipient_username',
            'qu_setoran.setoran',
            'qu_setoran.tampilan',
            'qu_setoran.nomor',
            'qu_setoran.info',
            'qu_setoran.hasil',
            'qu_setoran.paraf',
        )
            ->join('users AS penyetor', 'qu_setoran.penyetor', '=', 'penyetor.user_id')
            ->join('users AS penerima', 'qu_setoran.penerima', '=', 'penerima.user_id')
            ->where(function($query) use ($uId) {
                $query->where('qu_setoran.penyetor', $uId) // User sebagai reciter
                    ->orWhere('qu_setoran.penerima', $uId); // User sebagai recipient
            })
            ->orderBy('qu_setoran.tgl', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $surahName = null;
                if ($item->tampilan === 'surah') {
                    $chapter = Chapter::find($item->nomor);
                    $surahName = $chapter ? $chapter->name_simple : null;
                }
                $display = ($item->tampilan === 'surah' && $surahName)
                    ? $surahName
                    : $item->nomor;
                return [
                    'id' => $item->id,
                    'time' => \Carbon\Carbon::parse($item->tgl)->toDateTimeString(),
                    'reciter' => $item->reciter_name,
                    'reciter_username' => $item->reciter_username,
                    'recipient' => $item->recipient_name,
                    'recipient_username' => $item->recipient_username,
                    'recite' => ucfirst($item->setoran) . ' ' . ucfirst($item->tampilan) . ' ' . $display . ' Ayat ' . $item->info,
                    'results' => $item->hasil,
                    'signature' => $item->paraf ? 1 : 0,
                ];
            })
            ->toArray();
    } catch (Exception $e) {
        Log::error('Error in getSetoran', ['message' => $e->getMessage()]);
        return [];
    }
}

    private function getSetoranRekap()
    {
        try {
            return DB::connection('linkid')->table('qu_setoran_rekap')
                ->select(
                    'periode',
                    'kota',
                    'lat',
                    'long',
                    DB::raw('(t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8 + t9 + t10 + t11 + t12 + t13 + t14 + t15 + t16 + t17 + t18 + t19 + t20 + t21 + t22 + t23 + t24 + t25 + t26 + t27 + t28 + t29 + t30 + t31) as total_setoran')
                )
                ->orderBy('periode', 'desc')
                ->orderBy('kota', 'asc')
                ->get()
                ->map(function ($item) {
                    return [
                        'periode' => $item->periode,
                        'kota' => $item->kota,
                        'lat' => (float) $item->lat,
                        'long' => (float) $item->long,
                        'total_setoran' => (int) $item->total_setoran,
                    ];
                })
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getSetoranRekap', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getSetoranRekapTotal()
    {
        try {
            return DB::connection('linkid')->table('qu_setoran_rekap')
                ->select(
                    'kota',
                    'lat',
                    'long',
                    DB::raw('SUM(t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8 + t9 + t10 + t11 + t12 + t13 + t14 + t15 + t16 + t17 + t18 + t19 + t20 + t21 + t22 + t23 + t24 + t25 + t26 + t27 + t28 + t29 + t30 + t31) as total_setoran')
                )
                ->groupBy('kota', 'lat', 'long')
                ->orderBy('total_setoran', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'kota' => $item->kota,
                        'lat' => (float) $item->lat,
                        'long' => (float) $item->long,
                        'total_setoran' => (int) $item->total_setoran,
                    ];
                })
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getSetoranRekapTotal', ['message' => $e->getMessage()]);
            return [];
        }
    }

    private function getPeriodes()
    {
        try {
            return DB::connection('linkid')->table('qu_setoran_rekap')
                ->select('periode')
                ->distinct()
                ->orderBy('periode', 'desc')
                ->get()
                ->map(function ($item) {
                    return $item->periode;
                })
                ->toArray();
        } catch (Exception $e) {
            Log::error('Error in getPeriodes', ['message' => $e->getMessage()]);
            return [];
        }
    }
}
