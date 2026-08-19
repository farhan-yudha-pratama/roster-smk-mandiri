<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Enums\RoleType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $users = User::with('roles')->latest()->get();
        // Allow assigning SUPERADMIN, GURU and TEKNISI
        $roles = Role::whereIn('name', [RoleType::SUPERADMIN->value, RoleType::GURU->value, RoleType::TEKNISI->value])->get();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $this->checkSuperadmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        
        if (!in_array($role->name->value, [RoleType::SUPERADMIN->value, RoleType::GURU->value, RoleType::TEKNISI->value])) {
            return back()->withErrors(['role_id' => 'Role tidak valid.']);
        }

        $user = User::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->roles()->attach($role->id, ['model_type' => get_class($user)]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $this->checkSuperadmin();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($request->role_id);
        
        if (!in_array($role->name->value, [RoleType::SUPERADMIN->value, RoleType::GURU->value, RoleType::TEKNISI->value])) {
             return back()->withErrors(['role_id' => 'Role tidak valid.']);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $user->roles()->syncWithPivotValues([$role->id], ['model_type' => get_class($user)]);

        return back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $this->checkSuperadmin();

        if (request()->user()->id === $user->id) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus akun Anda sendiri.']);
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
