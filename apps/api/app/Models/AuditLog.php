<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false; // We use created_at manually in migration without updated_at

    protected $fillable = [
        'table_name',
        'table_id',
        'parent_table',
        'parent_id',
        'action',
        'before_data',
        'after_data',
        'changed_fields',
        'user_id',
        'user_role',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'before_data' => 'array',
        'after_data' => 'array',
        'changed_fields' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
