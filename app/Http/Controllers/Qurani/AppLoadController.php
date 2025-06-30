<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\LinkID\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AppLoadController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $token = $request->get('token');
        if (!$token || empty($token)) {
            return redirect()->route('redirect');
        }

        [$encoded, $signature] = explode('.', $token, 2);

        $expected = hash_hmac('sha256', $encoded, env('APP_LINKID_TOKEN'));
        if (!hash_equals($expected, $signature)) {
            abort(401, 'Invalid token signature');
        }

        $payload = json_decode(base64_decode($encoded), true);

        if (Cache::has($payload['nonce'])) {
            abort(401, 'Token already used');
        }
        if ($payload['expires_at'] < time()) {
            abort(401, 'Token expired');
        }
        $user = User::where(['user_id' => $payload['user_id']])->first();
        if (!$user || empty($user)) {
            abort(401, 'User not found');
        }

        Cache::put($payload['nonce'], true, $payload['expires_at'] - time());
        Auth::login($user);

        return redirect()->route('home');
    }
}