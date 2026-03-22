<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !$user->role) {
            return response()->json([
                'message' => 'Unauthorized. No role assigned.'
            ], 403);
        }

        $userRole = is_string($user->role) ? $user->role : $user->role->name;

        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required role to access this resource.'
            ], 403);
        }

        return $next($request);
    }
}
