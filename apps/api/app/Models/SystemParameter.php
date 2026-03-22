<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class SystemParameter extends Model
{
    use Auditable;

    protected $fillable = [
        'key',
        'value',
    ];
}
