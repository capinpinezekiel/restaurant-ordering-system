<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order; // ← This was missing!

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(
            Order::with(['table', 'user', 'orderItems.menuItem'])
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id' => 'required|exists:tables,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_requests' => 'nullable|string',
        ]);

        $order = Order::create([
            'user_id' => auth()->id(),
            'table_id' => $validated['table_id'],
            'status' => 'preparing',
            'total_amount' => 0,
        ]);

        $total = 0;
        foreach ($validated['items'] as $item) {
            $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);
            $order->orderItems()->create([
                'menu_item_id' => $item['menu_item_id'],
                'quantity' => $item['quantity'],
                'price' => $menuItem->price,
                'special_requests' => $item['special_requests'] ?? null,
            ]);
            $total += $menuItem->price * $item['quantity'];
        }

        $order->update(['total_amount' => $total]);

        // Mark table as occupied
        \App\Models\Table::findOrFail($validated['table_id'])
            ->update(['status' => 'occupied']);

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order->load('orderItems.menuItem', 'table')
        ], 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:preparing,ready,served,paid',
        ]);

        $order->update($validated);

        if ($validated['status'] === 'paid') {
            $order->table->update(['status' => 'free']);
        }

        return response()->json([
            'message' => 'Status updated',
            'order' => $order->load('table', 'orderItems.menuItem')
        ]);
    }
}