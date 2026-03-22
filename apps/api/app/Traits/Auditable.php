<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

trait Auditable
{

    public static function bootAuditable()
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        static::created(function ($model) {
            static::logAudit($model, 'created', null, $model->getAttributes());
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
        });

        static::updated(function ($model) {
            $changedFields = $model->getChanges();
            // Don't log if only timestamps changed
            unset($changedFields['updated_at']);

            if (!empty($changedFields)) {
                $before = array_intersect_key($model->getOriginal(), $changedFields);
                $after = $changedFields;
                static::logAudit($model, 'updated', $before, $after, $changedFields);
            }
        });

        static::deleted(function ($model) {
            static::logAudit($model, 'deleted', $model->getOriginal(), null);
        });
    }

    protected static function logAudit($model, string $action, $before = null, $after = null, $changedFields = null)
    {
        $user = Auth::user();
        
        $data = [
            'table_name' => $model->getTable(),
            'table_id' => $model->id,
            'action' => $action,
            'before_data' => $before,
            'after_data' => $after,
            'changed_fields' => $changedFields,
            'user_id' => Auth::id(),
            'user_role' => $user ? (is_object($user->role) ? $user->role->name : $user->role) : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ];

        // Handle parent linkage if available (defined in model)
        if (method_exists($model, 'getAuditParent')) {
            $parent = $model->getAuditParent();
            if ($parent) {
                $data['parent_table'] = $parent['table'];
                $data['parent_id'] = $parent['id'];
            }
        }

        AuditLog::create($data);
    }
}
