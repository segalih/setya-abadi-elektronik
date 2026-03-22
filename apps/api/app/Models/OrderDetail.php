<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\Auditable;

class OrderDetail extends Model
{
    use Auditable;

    public function getAuditParent()
    {
        return [
            'table' => 'orders',
            'id' => $this->order_id
        ];
    }
    protected $fillable = [
        'order_id',
        'type',
        'file_path',
        'data_json',
        'evidence_images',
    ];

    protected $casts = [
        'data_json' => 'array',
        'evidence_images' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
