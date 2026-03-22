<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendOrderNotification implements ShouldQueue
{
    use Queueable;

    public $url;
    public $payload;

    /**
     * Create a new job instance.
     */
    public function __construct(string $url, array $payload)
    {
        $this->url = $url;
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $url = str_replace('localhost', '127.0.0.1', $this->url);
            $response = Http::timeout(60)->post($url, $this->payload);
            
            if ($response->failed()) {
                Log::error("Notification failed to {$this->url}: " . $response->body());
                throw new \Exception("Notification failed");
            }
        } catch (\Exception $e) {
            Log::error("Notification error to {$this->url}: " . $e->getMessage());
            // Fail the job so it can be retried if configured
            throw $e;
        }
    }
}
