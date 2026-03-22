<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Jobs\SendOrderNotification;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource (user's own orders).
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('detail')->latest()->get();
        return response()->json($orders);
    }

    /**
     * Backoffice: Display a listing of all resources.
     */
    public function allOrders(Request $request)
    {
        $query = Order::with(['detail', 'user'])->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($qu) use ($search) {
                        $qu->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->input('limit', 10);
        return response()->json($query->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_type' => 'required|string',
            'notes' => 'nullable|string',
            'total_price' => 'required|numeric',
            'details' => 'required|array',
            'file' => 'required|file|max:5120|mimes:zip,rar,pdf,png,jpg,jpeg',
            'shipping_address' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($request) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'product_type' => $request->product_type,
                'status' => 'pending',
                'payment_status' => 'waiting',
                'total_price' => $request->total_price,
                'notes' => $request->notes,
            ]);

            $details = $request->details;
            $path = null;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $userId = $request->user()->id;
                $orderId = $order->id;
                $timestamp = time();
                $filename = $file->getClientOriginalName();
                $uuid = Str::uuid();
                $productTypeSlug = strtolower(str_replace(' ', '_', $request->product_type));

                $path = "{$productTypeSlug}/{$userId}/{$orderId}/{$timestamp}_{$uuid}_{$filename}";

                Storage::disk('public')->putFileAs(
                    "{$productTypeSlug}/{$userId}/{$orderId}",
                    $file,
                    "{$timestamp}_{$uuid}_{$filename}"
                );

                $details['file_path'] = $path;
            }

            if ($request->has('shipping_address')) {
                $details['shipping_address'] = $request->shipping_address;
            }

            OrderDetail::create([
                'order_id' => $order->id,
                'type' => $request->product_type,
                'file_path' => $path,
                'data_json' => $details,
            ]);

            // Notify User (Queued)
            SendOrderNotification::dispatch(config('services.notification.url') . '/api/notify/order-created', [
                'order_id' => $order->id,
                'product_type' => $order->product_type,
                'total_price' => $order->total_price,
                'customer_name' => $request->user()->name,
                'customer_email' => $request->user()->email,
                'customer_phone' => $request->user()->address->phone ?? null,
            ]);

            return response()->json($order->load('detail'), 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        if ($request->user()->hasAnyRole(['staff', 'supervisor'])) {
            $order = Order::with(['detail', 'user.address', 'updates.user'])->findOrFail($id);
        } else {
            $order = $request->user()->orders()->with(['detail', 'user.address', 'updates.user'])->findOrFail($id);
        }
        return response()->json($order);
    }

    /**
     * User: Mark order as paid (mock payment).
     */
    public function markAsPaid(Request $request, string $id)
    {
        $order = $request->user()->orders()->with(['user.address'])->findOrFail($id);

        if ($order->payment_status !== 'waiting') {
            return response()->json(['message' => 'Pembayaran sudah diproses sebelumnya.'], 422);
        }

        $order->update([
            'payment_status' => 'success',
            'payment_at' => now(),
        ]);

        // Notify (Queued)
        SendOrderNotification::dispatch(config('services.notification.url') . '/api/notify/payment-success', [
            'order_id' => $order->id,
            'product_type' => $order->product_type,
            'total_price' => $order->total_price,
            'customer_name' => $order->user->name,
            'customer_email' => $order->user->email,
            'customer_phone' => $order->user->address->phone ?? null,
        ]);

        return response()->json($order->load('detail'));
    }

    /**
     * User: Expire payment (mock).
     */
    public function expirePayment(Request $request, string $id)
    {
        $order = $request->user()->orders()->findOrFail($id);

        if ($order->payment_status !== 'waiting') {
            return response()->json(['message' => 'Pembayaran sudah diproses sebelumnya.'], 422);
        }

        $order->update(['payment_status' => 'expired']);

        return response()->json($order->load('detail'));
    }

    /**
     * User: Re-upload design file (only before in_production).
     */
    public function updateFile(Request $request, string $id)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $order = $request->user()->orders()->with('detail')->findOrFail($id);

        $lockedStatuses = ['in_production', 'ready_to_ship', 'shipped', 'completed', 'cancelled'];
        if (in_array($order->status, $lockedStatuses)) {
            return response()->json(['message' => 'File tidak dapat diubah setelah masuk produksi.'], 422);
        }

        $file = $request->file('file');
        $userId = $request->user()->id;
        $orderId = $order->id;
        $productTypeSlug = strtolower(str_replace(' ', '_', $order->product_type));
        $filename = Str::uuid() . '_' . $file->getClientOriginalName();

        $path = "{$productTypeSlug}/{$userId}/{$orderId}/{$filename}";

        Storage::disk('public')->putFileAs(
            "{$productTypeSlug}/{$userId}/{$orderId}",
            $file,
            $filename
        );

        $detail = $order->detail;
        $dataJson = $detail->data_json ?? [];

        // Maintain file history
        $history = $dataJson['file_history'] ?? [];
        if ($detail->file_path) {
            $history[] = [
                'path' => $detail->file_path,
                'uploaded_at' => now()->toDateTimeString(),
                'user_id' => $userId
            ];
        }

        $dataJson['file_path'] = $path;
        $dataJson['file_history'] = $history;

        $detail->update([
            'file_path' => $path,
            'data_json' => $dataJson,
        ]);

        return response()->json($order->load('detail'));
    }

    /**
     * Get audit logs for a specific order.
     */
    public function orderAuditLogs(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $logs = AuditLog::where(function ($q) use ($id) {
            $q->where(function ($q2) use ($id) {
                $q2->where('table_name', 'orders')->where('table_id', $id);
            })->orWhere(function ($q2) use ($id) {
                $q2->where('parent_table', 'orders')->where('parent_id', $id);
            });
        })->with('user')->latest()->paginate(20);

        return response()->json($logs);
    }

    /**
     * Update the status of the order (backoffice).
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,reviewed,in_production,ready_to_ship,shipped,completed,cancelled',
            'note' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
        ]);

        $order = Order::with('user.address')->findOrFail($id);

        // Enforce payment_status=success before progressing beyond reviewed
        $paidRequiredStatuses = ['in_production', 'ready_to_ship', 'shipped', 'completed'];
        if (in_array($request->status, $paidRequiredStatuses) && $order->payment_status !== 'success') {
            return response()->json([
                'message' => 'Pesanan belum dibayar. Hanya pesanan dengan pembayaran sukses yang dapat diproses lebih lanjut.'
            ], 422);
        }

        $order->update(['status' => $request->status]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '_' . $image->getClientOriginalName();
                $path = $image->storeAs("orders/{$order->id}/progress", $filename, 'public');
                $imagePaths[] = $path;
            }
        }

        $order->updates()->create([
            'user_id' => $request->user()->id,
            'status' => $request->status,
            'note' => $request->note,
            'images' => $imagePaths,
        ]);

        // Notify (Queued)
        $baseUrl = config('app.url') . '/storage/';
        $fullImageUrls = array_map(fn($path) => $baseUrl . $path, $imagePaths);

        SendOrderNotification::dispatch(config('services.notification.url') . '/api/notify/status-updated', [
            'order_id' => $order->id,
            'status' => $request->status,
            'note' => $request->note,
            'images' => $fullImageUrls,
            'customer_name' => $order->user->name,
            'customer_email' => $order->user->email,
            'customer_phone' => $order->user->address->phone ?? null,
        ]);

        return response()->json($order->load(['detail', 'updates.user']));
    }

    /**
     * Backoffice: Upload evidence images for an order.
     */
    public function uploadEvidence(Request $request, string $id)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|max:2048',
        ]);

        $order = Order::findOrFail($id);
        $detail = $order->detail;

        $paths = $detail->evidence_images ?? [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $filename = Str::uuid() . '_' . $image->getClientOriginalName();
                $path = $image->storeAs("evidence/{$order->id}", $filename, 'public');
                $paths[] = $path;
            }
        }

        $detail->update(['evidence_images' => $paths]);

        return response()->json($order->load('detail'));
    }
}
