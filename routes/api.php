<?php

use App\Http\Controllers\LinkID\ResultController;
use App\Http\Controllers\Qurani\HomeController;
use App\Http\Controllers\Qurani\JuzController;
use App\Http\Controllers\Qurani\SettingController;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::post('/result', [ResultController::class, 'store'])->middleware('web');
Route::get('/juz/{id}', [JuzController::class, 'api']);
Route::get('/setoran', [HomeController::class, 'apiSetoran']);
