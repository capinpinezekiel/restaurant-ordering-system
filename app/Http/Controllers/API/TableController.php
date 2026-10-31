<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Table::orderBy('table_number')->get()
        );
    }

    public function updateStatus(Request $request, Table $table)
    {
        $validated = $request->validate([
            'status' => 'required|in:free,occupied,reserved',
        ]);
        $table->update($validated);
        return response()->json(['message' => 'Status updated', 'table' => $table]);
    }
}