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
            'PCB_FR2_PRICE_PER_CM',
            'PCB_FR4_PRICE_PER_CM',
            'PCB_DOUBLE_LAYER_MULTIPLIER',
            'PCB_MASKING_PRICE_PER_LAYER',
            'PCB_SILKSCREEN_PRICE_PER_LAYER',
        ];

        $params = SystemParameter::whereIn('key', $keys)->pluck('value', 'key');

        return response()->json([
            'fr2_price' => (float) ($params['PCB_FR2_PRICE_PER_CM'] ?? 300),
            'fr4_price' => (float) ($params['PCB_FR4_PRICE_PER_CM'] ?? 500),
            'double_layer_multiplier' => (float) ($params['PCB_DOUBLE_LAYER_MULTIPLIER'] ?? 2.0),
            'masking_price' => (float) ($params['PCB_MASKING_PRICE_PER_LAYER'] ?? 10000),
            'silkscreen_price' => (float) ($params['PCB_SILKSCREEN_PRICE_PER_LAYER'] ?? 10000),
        ]);
    }
}
