<?php

namespace App\Http\Controllers;

use App\Models\SystemParameter;
use Illuminate\Http\JsonResponse;

class PricingController extends Controller
{
    /**
     * Get PCB pricing parameters from system_parameters.
     */
    public function pcbPricing(): JsonResponse
    {
        $keys = [
            'PCB_SINGLE_LAYER_PRICE_PER_CM',
            'PCB_DOUBLE_LAYER_PRICE_PER_CM',
            'PCB_SOLDERMASK_PERCENT',
            'PCB_SILKSCREEN_PERCENT',
        ];

        $params = SystemParameter::whereIn('key', $keys)->pluck('value', 'key');

        return response()->json([
            'single_layer_price' => (float) ($params['PCB_SINGLE_LAYER_PRICE_PER_CM'] ?? 500),
            'double_layer_price' => (float) ($params['PCB_DOUBLE_LAYER_PRICE_PER_CM'] ?? 1000),
            'soldermask_percent' => (float) ($params['PCB_SOLDERMASK_PERCENT'] ?? 15),
            'silkscreen_percent' => (float) ($params['PCB_SILKSCREEN_PERCENT'] ?? 10),
        ]);
    }
}
