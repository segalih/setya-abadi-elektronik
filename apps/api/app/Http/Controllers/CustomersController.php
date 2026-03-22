<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class CustomersController extends Controller
{
    public function index(Request $request)
    {
        $userRoleId = Role::where('name', 'user')->value('id');
        $query = User::where('role_id', $userRoleId)->withCount('orders')->latest();

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

    public function show(string $id)
    {
        $user = User::with(['address', 'role', 'orders' => function($q) {
            $q->latest()->limit(10);
        }])->findOrFail($id);
        
        return response()->json($user);
    }
}
