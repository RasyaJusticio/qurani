<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('index');
})->name('home');
Route::get('/redirect', function () {
    return Inertia::render('redirect');
})->name('redirect');
Route::get('/dashboard', function () {
    return Inertia::render('dashboard/index');
})->name('dashboard');
Route::get('/filter', function () {
    return Inertia::render('dashboard/filter');
})->name('filter');
Route::get('/recap', function () {
    return Inertia::render('recap/index');
})->name('recap');
