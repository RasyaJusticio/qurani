<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LinkID\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $friends = User::select(
            DB::raw("CONCAT(user_firstname, ' ', user_lastname) AS user_fullname"),
            'user_name'
        )->get();

        return Inertia::render('index', [
            'friends' => $friends
        ]);
    }
}
