<?php

namespace Database\Seeders;

use App\Models\SystemParameter;
use Illuminate\Database\Seeder;

class SystemParameterSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'PCB_FR2_PRICE_PER_CM', 'value' => '300'],
            ['key' => 'PCB_FR4_PRICE_PER_CM', 'value' => '500'],
            ['key' => 'PCB_DOUBLE_LAYER_MULTIPLIER', 'value' => '2'],
            ['key' => 'PCB_MASKING_PRICE_PER_LAYER', 'value' => '10000'],
            ['key' => 'PCB_SILKSCREEN_PRICE_PER_LAYER', 'value' => '10000'],
        ];

        foreach ($defaults as $param) {
            SystemParameter::firstOrCreate(
                ['key' => $param['key']],
                ['value' => $param['value']]
            );
        }
    }
}
