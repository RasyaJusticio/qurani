<?php

namespace App\Http\Controllers\LinkID;

use App\Models\LinkID\Group;
use App\Http\Controllers\Controller;
use Inertia\Inertia;


class RecapController extends controller{
    public function index($id) {
        return Inertia::render('surah/History');
    }
}
