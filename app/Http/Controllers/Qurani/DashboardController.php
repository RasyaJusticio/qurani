<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LinkID\User;
use App\Models\LinkID\QuSetoran;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $usersCount = User::count();
        $setoranCount = QuSetoran::count();
        $popularSurah = QuSetoran::where('tampilan', 'surah')
        ->select('info', QuSetoran::raw('COUNT(*) as total'))
        ->groupBy('info')
        ->orderByDesc('total')
        ->first();

        return Inertia::render('dashboard/index', [
            'usersCount' => $usersCount,
            'setoranCount'=> $setoranCount,
            'popularSurah'=>$popularSurah
        ]);
    }
}
