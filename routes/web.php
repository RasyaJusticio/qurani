<?php

use App\Http\Controllers\LinkID\RecapController;
use App\Http\Controllers\LinkID\ResultController;
use App\Http\Controllers\LinkID\SettingsController;
use App\Http\Controllers\Qurani\ChapterController;
use App\Http\Controllers\Qurani\DashboardController;
use App\Http\Controllers\Qurani\HomeController;
use App\Http\Controllers\Qurani\InfoSurahController;
use App\Http\Controllers\Qurani\JuzController;
use App\Http\Controllers\Qurani\PageController;
use App\Http\Controllers\Qurani\AppLoadController;
use App\Http\Controllers\Qurani\SettingController;
use App\Models\Qurani\Chapter;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

Route::get('/', AppLoadController::class);
Route::get('/home', [HomeController::class, 'index'])->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/result', [ResultController::class, 'index'])->name('result');
Route::get('/result/juz/{id}', [ResultController::class, 'juz'])->name('result.juz');
Route::get('/result/page/{id}', [ResultController::class, 'page'])->name('result.page');

// Route::get('/recap', function () {
//     $chapter = Chapter::get();
// $chapter = Chapter::select([
//     "id",
//     "name_simple"
// ])->get();
// return Inertia::render('recap/index', [
//     "chapters" => $chapter
// ]);
// })->name('recap');
Route::get('/filter', function () {
    return Inertia::render('dashboard/recap');
})->name('filter');

Route::get('/surah/{surah}', [ChapterController::class, 'show'])->name('surah');
Route::get('/juz/{juz}', [JuzController::class, 'show'])->name('juz');
Route::get('/page/{page}', [PageController::class, 'show'])->name('page');

Route::get('/redirect', function () {
    return Inertia::render('redirect');
})->name('redirect');


Route::post('/set-cookie', function (Request $request) {
    $u_id = $request->input('u_id');

    Cookie::queue('u_id', $u_id, 60);

    Log::info($u_id);

    return redirect()->back();
})->name('set.cookie');

Route::get('/setoran/{id}', [HomeController::class, 'getSetoranById'])->name('setoran.show');
Route::get('/recap', [HomeController::class, 'recap'])->name('recap');
// Route::get('/recap/surah/{id}', [RecapController::class, 'chapter'])->name('recap.surah');
// Route::get('/recap/page/{id}', [RecapController::class, 'page'])->name('recap.page');
Route::get('/recap/{id}', [RecapController::class, 'validateRouteSetoran'])->name('recap.page');
Route::post('/setoran/{id}/sign', [HomeController::class, 'updateSignature']);

Route::get("/info/{id}", [InfoSurahController::class, "index"])->name("info");

// settings
Route::post("/setting", [SettingController::class, 'store']);
Route::post("/setting/reset", [SettingController::class, 'reset']);
