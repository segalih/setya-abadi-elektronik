<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendVerificationEmail implements ShouldQueue
{
    use Queueable;

    public $email;
    public $token;

    /**
     * Create a new job instance.
     */
    public function __construct($email, $token)
    {
        $this->email = $email;
        $this->token = $token;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Http::post(config('services.notification.url') . '/api/verification/send-email', [
                'email' => $this->email,
                'token' => $this->token,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send verification email job: " . $e->getMessage());
        }
    }
}
