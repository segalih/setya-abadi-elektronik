<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $staffRoles = Role::whereIn('name', ['staff', 'supervisor'])->pluck('id');
        $query = User::with('role')->whereIn('role_id', $staffRoles)->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('limit', $request->input('per_page', 10));
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:staff,supervisor',
        ]);

        $role = Role::where('name', $request->role)->firstOrFail();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
        ]);

        return response()->json($user->load('role'), 201);
    }

    public function destroy(string $id)
    {
        $user = User::with('role')->findOrFail($id);
        
        // Prevent deleting self
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 400);
        }

        // Prevent deleting supervisor
        if ($user->role && $user->role->name === 'supervisor') {
            return response()->json(['message' => 'Supervisor account cannot be deleted'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
