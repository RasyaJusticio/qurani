<?php

use App\Http\Controllers\LinkID\ResultController;
use App\Http\Controllers\LinkID\SettingsController;
use App\Http\Controllers\Qurani\ChapterController;
use App\Http\Controllers\Qurani\DashboardController;
use App\Http\Controllers\Qurani\HomeController;
use App\Http\Controllers\Qurani\JuzController;
use App\Http\Controllers\Qurani\PageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/result', [ResultController::class, 'index'])->name('result');
// Route::post('/result', [ResultController::class, 'store'])->name('result.store');

Route::get('/recap', function () {
    return Inertia::render('recap/index');
})->name('recap');
Route::get('/filter', function () {
    return Inertia::render('dashboard/recap');
})->name('filter');

Route::get('/surah/{surah}', [ChapterController::class, 'show'])->name('surah');
Route::get('/juz/{juz}', [JuzController::class, 'show'])->name('juz');
Route::get('/page/{page}', [PageController::class, 'show'])->name('page');

Route::get('/redirect', function () {
    return Inertia::render('redirect');
})->name('redirect');
