<?php

namespace App\Traits;

use App\Models\LinkId\GroupMemberModel;
use App\Models\LinkId\SettingGlobal;
use App\Models\LinkId\SettingGroup;
use App\Models\LinkId\SettingUser;
use Illuminate\Support\Facades\Log;

trait ErrorLabel
{
    protected function ErrorLabelGenerate($user)
    {
        $settings = [];
        $globalSetting = SettingGlobal::get(); // Ini adalah koleksi SettingGlobal yang asli
        $group_id = GroupMemberModel::where("user_id", $user->user_id)->get()->pluck("group_id"); // id group dari user
        $settingUser = SettingUser::where("user", $user->user_id)->get();
        $globalSettingForTeman = $globalSetting->map(function ($item) {
            return clone $item; // Kloning setiap objek model
        });
        $settings["teman"] = $this->formatArray($globalSettingForTeman, $settingUser);

        $reciter = session("reciter_data");
        $id_grup = session("grup_id");
        if ($reciter["value"] && $reciter["value"] == "grup") {
            if ($id_grup) {
                $settingGroup = SettingGroup::where("group", (int) $id_grup["value"])->get();

                // **Penting: Kloning SETIAP item di dalam koleksi globalSetting**

                $globalSettingForGrup = $globalSetting->map(function ($item) {
                    return clone $item; // Kloning setiap objek model lagi untuk yang grup
                });
                $grup = $this->formatArray($globalSettingForGrup, $settingGroup);
                ;
                $settings = $grup;
                // Log::info($grup);
            }
        } else {
            $user = $this->formatArray($globalSettingForTeman, $settingUser);
            ;
            // log::info($user);
            $settings = $user;
        }

        // foreach ($group_id as $value) {
        //     $settingGroup = SettingGroup::where("group", $value)->get();

        //     // **Penting: Kloning SETIAP item di dalam koleksi globalSetting**

        //     $globalSettingForGrup = $globalSetting->map(function ($item) {
        //         return clone $item; // Kloning setiap objek model lagi untuk yang grup
        //     });
        //     $grup = $this->formatArray($globalSettingForGrup, $settingGroup);
        //     $settings["grup"][$value] = $grup;
        //     // $settings["grup"][$value] = $this->formatArray($grup, $settingUser);
        // }
        return $settings;
    }

    private function formatArray($array1, $array2)
    {
        // Konversi array ke koleksi (ini sudah aman karena $array1 berisi kloning item)
        $collection1 = collect($array1);
        $collection2 = collect($array2);

        // Iterasi melalui array kedua
        $collection2->each(function ($item2) use ($collection1) {
            $collection1->transform(function ($item1) use ($item2) {
                if ($item1['id'] == $item2['setting']) {
                    $item1['value'] = $item2['value'];
                    $item1['status'] = $item2['status'];
                }
                return $item1;
            });
        });

        return $collection1->toArray();
    }
}
