<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Enums\RoleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    /**
     * Check if current user is SUPERADMIN
     */
    private function checkSuperadmin()
    {
        $isSuperadmin = request()->user()->roles()->where('name', RoleType::SUPERADMIN->value)->exists();
        if (!$isSuperadmin) {
            abort(403, 'Unauthorized action.');
        }
    }

    public function index()
    {
        $this->checkSuperadmin();

        // Get users with their roles
        $users = User::with('roles')->latest()->get();
        // We only allow assigning GURU and TEKNISI for this view according to requirements
        $roles = Role::whereIn('name', [RoleType::GURU->value, RoleType::TEKNISI->value])->get();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $this->checkSuperadmin();

        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        
        // Ensure they only update to GURU or TEKNISI
        if (!in_array($role->name->value, [RoleType::GURU->value, RoleType::TEKNISI->value])) {
             return back()->withErrors(['role_id' => 'Invalid role assignment.']);
        }

        // Sync the new role
        $user->roles()->syncWithPivotValues([$role->id], ['model_type' => get_class($user)]);

        return back()->with('success', 'User role updated successfully.');
    }
}
