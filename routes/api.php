<?php

use App\Http\Controllers\LinkID\ResultController;
use App\Http\Controllers\Qurani\JuzController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::post('/result',[ResultController::class,'store']);
Route::get('/jus/{id}',[JuzController::class,'api']);
