<?php

namespace App\Http\Controllers\Qurani;

use Illuminate\Http\Request;
use app\Http\Controllers\Controller;
use App\Models\LinkID\User;
use Inertia\Inertia;

class IndexController extends Controller
{
    public function index()
    {
        $user_fullname = User::select('user_firstname', 'user_lastname');

        return Inertia::render('index', [
            'user_fullname' => $user_fullname
        ]);
    }
}
