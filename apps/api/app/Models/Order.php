<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

use App\Traits\Auditable;

class Order extends Model
{
    use Auditable;
    const STATUS_PENDING = 'pending';
    const STATUS_REVIEWED = 'reviewed';
    const STATUS_IN_PRODUCTION = 'in_production';
    const STATUS_READY_TO_SHIP = 'ready_to_ship';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'user_id',
        'order_number',
        'product_type',
        'status',
        'payment_status',
        'payment_at',
        'total_price',
        'notes',
        'snap_token',
        'payment_method',
        'payment_info',
    ];

    protected $casts = [
        'payment_at' => 'datetime',
        'payment_info' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function detail(): HasOne
    {
        return $this->hasOne(OrderDetail::class);
    }

    public function updates()
    {
        return $this->hasMany(OrderUpdate::class)->latest();
    }

    protected static function booted()
    {
        static::created(function ($order) {
            $order->order_number = 'ORD-' . str_pad($order->id, 6, '0', STR_PAD_LEFT);
            $order->saveQuietly();
        });
    }
}
