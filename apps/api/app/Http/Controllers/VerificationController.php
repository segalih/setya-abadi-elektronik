<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmailVerificationToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VerificationController extends Controller
{
    public function sendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        // Generate token
        $token = Str::random(64);
        
        // Save hashed token
        EmailVerificationToken::updateOrCreate(
            ['user_id' => $user->id],
            [
                'token' => hash('sha256', $token),
                'expires_at' => Carbon::now()->addHours(24),
            ]
        );

        // Call Notification Service
        try {
            Http::post(config('services.notification.url') . '/api/verification/send-email', [
                'email' => $user->email,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send verification email'], 500);
        }

        return response()->json(['message' => 'Verification email sent']);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $hashedToken = hash('sha256', $request->token);
        
        $verificationToken = EmailVerificationToken::where('token', $hashedToken)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$verificationToken) {
            return response()->json(['message' => 'Invalid or expired token'], 422);
        }

        $user = $verificationToken->user;
        $user->email_verified_at = Carbon::now();
        $user->save();

        // Delete token after use
        $verificationToken->delete();

        return response()->json(['message' => 'Email verified successfully']);
    }
}
