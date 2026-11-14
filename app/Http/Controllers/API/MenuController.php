<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(
            MenuItem::orderBy('category')->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $item = MenuItem::create($validated);
        return response()->json($item, 201);
    }

    // ✅ Fixed update — accepts partial data like just is_available
    public function update(Request $request, MenuItem $menuItem)
    {
        // Allow partial updates — validate only what's sent
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $menuItem->update($validated);
        return response()->json($menuItem);
    }
}