<?php

use App\Http\Controllers\API\TableController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\MenuController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\BillingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// === PUBLIC ROUTES — EVERYONE SEES THESE ===
Route::post('/login', function(Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid login'], 401);
    }
    $user = Auth::user();
    $token = $user->createToken('main')->plainTextToken;
    return response()->json(['user' => $user, 'token' => $token]);
});

Route::post('/register', function(Request $request) {
    $validated = $request->validate([
        'last_name' => 'required|string|max:50',
        'first_name' => 'required|string|max:50',
        'suffix' => 'nullable|string|max:20',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6|confirmed', // confirmed = needs password_confirmation field
    ]);
    
// Create user with separate name fields
    $user = \App\Models\User::create([
        'last_name' => $validated['last_name'],
        'first_name' => $validated['first_name'],
        'suffix' => $validated['suffix'] ?? null,
        'email' => $validated['email'],
        'password' => bcrypt($validated['password']),
        'role' => 'customer',
    ]);
    
    $token = $user->createToken('main')->plainTextToken;
    // Return full name for frontend display
    return response()->json([
        'user' => [
            'id' => $user->id,
            'last_name' => $user->last_name,
            'first_name' => $user->first_name,
            'suffix' => $user->suffix,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'role' => $user->role,
        ],
        'token' => $token
    ], 201);
});

// ✅ THESE MUST BE PUBLIC — frontend loads before login
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/tables', [TableController::class, 'index']);

// === PROTECTED ROUTES — NEED LOGIN ===
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $req) { return $req->user(); });
    
    // ✅ ADMIN ONLY — Get all users for dashboard
    Route::get('/users', function (Request $req) {
        if ($req->user()->role !== 'admin') {
            abort(403, 'Admin only');
        }
        return response()->json(\App\Models\User::select('id', 'name', 'email', 'role')->get());
    });
    
    Route::patch('/tables/{table}/status', [TableController::class, 'updateStatus']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::patch('/reservations/{reservation}', [ReservationController::class, 'update']);
    Route::post('/menu', [MenuController::class, 'store']);
    Route::patch('/menu/{menuItem}', [MenuController::class, 'update']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/pay', [BillingController::class, 'pay']);
    Route::get('/transactions', [BillingController::class, 'index']);
    Route::delete('/users/{user}', [\App\Http\Controllers\API\UserController::class, 'destroy']);
    Route::patch('/users/{user}', [\App\Http\Controllers\API\UserController::class, 'update']);
Route::get('/users', [\App\Http\Controllers\API\UserController::class, 'index']);

});