<?php

namespace App\Http\Controllers\Qurani;

use App\Http\Controllers\Controller;
use App\Models\LinkID\SettingUser;
use App\Traits\ErrorLabel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    use ErrorLabel;
    public function store(Request $request)
    {
        $userId = Auth::user()->user_id;
        $errors = $request->all();

        foreach ($errors as $error) {
            // Cari data SettingUser dengan user_id dan id yang sama
            $setting = SettingUser::where('user', $userId)
                ->where('setting', $error['id'])
                ->first();

            if ($setting) {
                // Jika ada, update
                $setting->value = $error['value'];
                $setting->status = $error['status'];
                $setting->save();
            } else {
                // Jika tidak ada, insert baru
                SettingUser::create([
                    'user' => $userId,
                    'setting' => $error['id'],
                    'value' => $error['value'],
                    'status' => $error['status'],
                ]);
            }
        }

        // Ambil semua SettingUser milik user ini
        $updatedLabels = $this->ErrorLabelGenerate(Auth::user());

        return response()->json([
            'success' => true,
            'updatedLabels' => $updatedLabels
        ]);
    }

    public function reset(Request $request)
    {
        $userId = Auth::user()->user_id;

        // Hapus semua SettingUser milik user ini
        SettingUser::where('user', $userId)->delete();

        $updatedLabels = $this->ErrorLabelGenerate(Auth::user());

        return response()->json([
            'success' => true,
            'updatedLabels' => $updatedLabels
        ]);
    }
}
