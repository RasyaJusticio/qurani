<?php

use App\Http\Controllers\Qurani\ChapterController;
use App\Http\Controllers\Qurani\DashboardController;
use App\Http\Controllers\Qurani\HomeController;
use App\Http\Controllers\Qurani\JuzController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//backend


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/surah/{surah}', [ChapterController::class, 'show'])
    ->name('surah');
Route::get('/juz/{juz}', [JuzController::class, 'show'])->name('juz');


Route::get('/redirect', function () {
    return Inertia::render('redirect');
})->name('redirect');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/filter', function () {
    return Inertia::render('dashboard/recap');
})->name('filter');
Route::get('/recap', function () {
    return Inertia::render('recap/index');
})->name('recap');
