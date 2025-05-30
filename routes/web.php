<?php

use App\Http\Controllers\Qurani\DashboardController;
use App\Http\Controllers\Qurani\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//backend


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/redirect', function () {
    return Inertia::render('redirect');
})->name('redirect');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/filter', function () {
    return Inertia::render('dashboard/filter');
})->name('filter');
Route::get('/recap', function () {
    return Inertia::render('recap/index');
})->name('recap');
