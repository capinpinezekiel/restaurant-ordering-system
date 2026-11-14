<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::latest()->get());
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['customer', 'waitstaff', 'kitchen', 'admin'])],
        ]);

        $user->update($validated);
        return response()->json($user);
    }

 public function destroy(User $user)
{
    if (auth()->id() === $user->id) {
        return response()->json(['message' => 'You cannot delete your own account'], 403);
    }

    // ✅ Step 1: Get all orders belonging to this user
    $userOrders = $user->orders;

    // ✅ Step 2: Delete transactions first (they depend on orders)
    foreach ($userOrders as $order) {
        $order->transactions()->delete();
        $order->orderItems()->delete(); // Then delete order items
    }

    // ✅ Step 3: Now safe to delete orders & reservations
    $user->reservations()->delete();
    $user->orders()->delete();

    // ✅ Step 4: Finally delete the user
    $user->delete();

    return response()->json(['message' => 'User and all related records deleted successfully']);
}
}