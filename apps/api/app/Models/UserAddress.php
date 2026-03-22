<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\Auditable;

#[Fillable([
    'user_id',
    'full_address',
    'province',
    'city',
    'district',
    'village',
    'postal_code',
    'phone',
])]
class UserAddress extends Model
{
    use Auditable;

    public function getAuditParent()
    {
        return [
            'table' => 'users',
            'id' => $this->user_id
        ];
    }

    /**
     * Get the user that owns the address.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
