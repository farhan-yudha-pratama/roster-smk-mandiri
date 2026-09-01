<?php

namespace App\Http\Controllers\Settings;

use App\Enums\GradeLevel;
use App\Enums\Major;
use App\Http\Controllers\Controller;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneralController extends Controller
{
    public function edit()
    {
        $grades = GradeLevel::values();
        $majors = Major::values();

        $settings = [];
        
        // Hide settings for grades
        foreach ($grades as $grade) {
            $key = 'hide_roster_grade_' . strtolower($grade);
            $settings[$key] = GeneralSetting::getValue($key, 'false') === 'true';
        }

        // Hide settings for majors
        foreach ($majors as $major) {
            $key = 'hide_roster_major_' . strtolower(str_replace(' ', '_', $major));
            $settings[$key] = GeneralSetting::getValue($key, 'false') === 'true';
        }

        return Inertia::render('settings/general', [
            'grades' => $grades,
            'majors' => $majors,
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->all();
        
        // Only process keys that start with hide_roster_
        foreach ($data as $key => $value) {
            if (strpos($key, 'hide_roster_') === 0) {
                GeneralSetting::setValue($key, $value ? 'true' : 'false');
            }
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
