<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Table;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(Reservation::with(['table', 'user'])->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_id'           => 'required|exists:tables,id',
            'reserved_date_time' => 'required|date|after:today', // No past dates
            'guest_count'        => 'required|integer|min:1',
            'notes'              => 'nullable|string',
        ]);

        // ✅ Get the selected table and check capacity
        $table = Table::findOrFail($validated['table_id']);

        if ($validated['guest_count'] > $table->capacity) {
            return response()->json([
                'message' => "This table only seats {$table->capacity} people. Please choose a larger table or reduce your guest count.",
            ], 422);
        }

        // Prevent double-booking
        $conflict = Reservation::where('table_id', $validated['table_id'])
            ->where('reserved_date_time', $validated['reserved_date_time'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'This table is already reserved at that time.',
            ], 422);
        }

        $validated['user_id'] = auth()->id();
        $reservation = Reservation::create($validated);

        // Mark table as reserved
        $table->update(['status' => 'reserved']);

        return response()->json($reservation, 201);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $reservation->update($validated);

        // Free up the table if reservation is cancelled or completed
        if ($validated['status'] === 'cancelled' || $validated['status'] === 'completed') {
            $reservation->table->update(['status' => 'free']);
        }

        return response()->json([
            'message'    => 'Status updated',
            'reservation' => $reservation
        ]);
    }
}
