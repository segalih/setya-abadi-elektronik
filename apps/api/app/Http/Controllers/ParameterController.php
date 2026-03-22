<?php

namespace App\Http\Controllers;

use App\Models\SystemParameter;
use Illuminate\Http\Request;

class ParameterController extends Controller
{
    public function index()
    {
        return response()->json(SystemParameter::all());
    }

    public function update(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'value' => 'nullable|string',
        ]);

        $parameter = SystemParameter::updateOrCreate(
            ['key' => $request->key],
            ['value' => $request->value]
        );

        return response()->json($parameter);
    }
}
