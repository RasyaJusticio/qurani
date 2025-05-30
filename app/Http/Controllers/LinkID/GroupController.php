<?php

namespace App\Http\Controllers\LinkID;

use App\Models\LinkID\Group;
use App\Http\Controllers\Controller;

class GroupController extends Controller
{
    public function getGroups()
    {
        try {
            return Group::select('group_id', 'group_name')->get()->map(function ($group) {
                return [
                    'value' => (string) $group->group_id,
                    'name' => $group->group_name,
                ];
            })->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
}
