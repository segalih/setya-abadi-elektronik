<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserAddress;
use App\Models\Role;
use App\Models\EmailVerificationToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'full_address' => 'required|string',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
        ]);

        // Get default 'user' role
        $userRole = Role::where('name', 'user')->first();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $userRole ? $userRole->id : 1,
        ]);

        $user->address()->create([
            'full_address' => $validated['full_address'],
            'province' => $validated['province'],
            'city' => $validated['city'],
            'district' => $validated['district'],
            'village' => $validated['village'],
            'postal_code' => $validated['postal_code'],
            'phone' => $validated['phone'],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        // Trigger verification email via notification service
        try {
            $verificationToken = Str::random(64);
            
            EmailVerificationToken::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'token' => hash('sha256', $verificationToken),
                    'expires_at' => Carbon::now()->addHours(24),
                ]
            );

            Http::post(config('services.notification.url') . '/api/verification/send-email', [
                'email' => $user->email,
                'token' => $verificationToken,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send verification email: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            'user' => $user->load(['address', 'role']),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and return token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Revoke previous tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => $user->load(['address', 'role']),
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['address', 'role']);
        $userData = $user->toArray();
        $userData['email_verified_at'] = $user->email_verified_at;

        return response()->json([
            'user' => $userData,
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user->load(['address', 'role']),
        ]);
    }

    /**
     * Update user address.
     */
    public function updateAddress(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'full_address' => 'required|string',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'phone' => 'required|string|max:20',
        ]);

        $user->address()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'message' => 'Alamat berhasil diperbarui',
            'user' => $user->load('address'),
        ]);
    }
}
