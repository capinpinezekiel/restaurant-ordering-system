<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller {
    public function index() {
        return response()->json(Table::all());
    }
    public function updateStatus(Request $request, Table $table) {
        $request->validate(['status' => 'required|in:free,reserved,occupied']);
        $table->update(['status' => $request->status]);
        return response()->json($table);
    }
}