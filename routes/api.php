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
        'name' => 'required|string',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:6',
    ]);
    
    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => bcrypt($validated['password']),
        'role' => 'customer',
    ]);
    
    $token = $user->createToken('main')->plainTextToken;
    return response()->json(['user' => $user, 'token' => $token], 201);
});

// ✅ THESE MUST BE PUBLIC — frontend loads before login
Route::get('/menu', [MenuController::class, 'index']);
Route::get('/tables', [TableController::class, 'index']);

// === PROTECTED ROUTES — NEED LOGIN ===
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $req) { return $req->user(); });
    
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
});