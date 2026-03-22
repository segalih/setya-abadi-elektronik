<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\ParameterController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\PaymentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [VerificationController::class, 'verify']);

// Public pricing route
Route::get('/pricing/pcb', [PricingController::class, 'pcbPricing']);

// Health check (for system status checker)
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]);
});

// Midtrans Notification (Public Webhook)
Route::post('/midtrans/notification', [PaymentController::class, 'handleNotification']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/address', [AuthController::class, 'updateAddress']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [VerificationController::class, 'sendVerification']);

    // User (Customer) only routes
    Route::middleware('role:user')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::post('/orders/{id}/mark-paid', [OrderController::class, 'markAsPaid']);
        Route::post('/orders/{id}/expire', [OrderController::class, 'expirePayment']);
        Route::post('/orders/{id}/file', [OrderController::class, 'updateFile']);
        Route::post('/orders/{id}/snap-token', [PaymentController::class, 'getToken']);
    });

    Route::get('/orders/{id}', [OrderController::class, 'show'])->middleware('role:user,staff,supervisor');
    Route::get('/orders/{id}/audit-logs', [OrderController::class, 'orderAuditLogs'])->middleware('role:user,staff,supervisor');

    // Backoffice (Staff & Supervisor) routes
    Route::group(['prefix' => 'backoffice', 'middleware' => 'role:staff,supervisor'], function () {
        Route::get('orders', [OrderController::class, 'allOrders']);
        Route::get('orders/{id}', [OrderController::class, 'show']);
        Route::get('orders/{id}/audit-logs', [OrderController::class, 'orderAuditLogs']);
        Route::post('orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('orders/{id}/evidence', [OrderController::class, 'uploadEvidence']);

        Route::get('customers', [CustomersController::class, 'index']);
        Route::get('customers/{id}', [CustomersController::class, 'show']);

        // Supervisor only routes (inside backoffice)
        Route::group(['middleware' => 'role:supervisor,staff'], function () {
            Route::get('audit-logs', [AuditController::class, 'index']);
        });

        Route::group(['middleware' => 'role:supervisor'], function () {
            Route::get('parameters', [ParameterController::class, 'index']);
            Route::put('parameters', [ParameterController::class, 'update']);

            Route::get('users', [UsersController::class, 'index']);
            Route::post('users', [UsersController::class, 'store']);
            Route::delete('users/{id}', [UsersController::class, 'destroy']);
        });
    });
});
