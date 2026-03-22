<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\AuditLog;

#[Signature('audit:clean')]
#[Description('Clean up audit logs older than 180 days')]
class CleanAuditLogs extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffDate = now()->subDays(180);
        
        $deletedCount = AuditLog::where('created_at', '<', $cutoffDate)->delete();

        if ($deletedCount > 0) {
            $this->info("Successfully deleted {$deletedCount} old audit logs.");
            Log::info("AuditLog Cleanup Task executed: {$deletedCount} records deleted.");
        } else {
            $this->info("No audit logs older than 180 days found.");
        }
    }
}
