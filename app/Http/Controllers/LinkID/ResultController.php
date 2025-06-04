<?php

namespace App\Http\Controllers\LinkID;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultController extends Controller
{
    public function index(){
        return Inertia::render('result/Index');
    }
}
