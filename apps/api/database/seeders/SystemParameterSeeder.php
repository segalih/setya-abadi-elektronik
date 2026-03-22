<?php

namespace Database\Seeders;

use App\Models\SystemParameter;
use Illuminate\Database\Seeder;

class SystemParameterSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'PCB_SINGLE_LAYER_PRICE_PER_CM', 'value' => '500'],
            ['key' => 'PCB_DOUBLE_LAYER_PRICE_PER_CM', 'value' => '1000'],
            ['key' => 'PCB_SOLDERMASK_PERCENT', 'value' => '15'],
            ['key' => 'PCB_SILKSCREEN_PERCENT', 'value' => '10'],
        ];

        foreach ($defaults as $param) {
            SystemParameter::firstOrCreate(
                ['key' => $param['key']],
                ['value' => $param['value']]
            );
        }
    }
}
