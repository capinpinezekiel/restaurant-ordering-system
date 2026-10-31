<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\Request;

class BillingController extends Controller {
    public function index() {
        return response()->json(Transaction::with('order', 'receivedBy')->latest()->get());
    }

    public function pay(Request $request, Order $order) {
        $validated = $request->validate([
            'payment_method' => 'required|string|in:cash,gcash,card',
            'amount_paid' => 'required|numeric|min:' . $order->total_amount,
        ]);

        $transaction = Transaction::create([
            'order_id' => $order->id,
            'payment_method' => $validated['payment_method'],
            'amount_paid' => $validated['amount_paid'],
            'received_by' => auth()->id(),
        ]);

        $order->update(['status' => 'paid']);
        $order->table->update(['status' => 'free']);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'transaction' => $transaction,
            'change' => $validated['amount_paid'] - $order->total_amount
        ], 201);
    }
}