<?php

Route::get('/login', function () {
    return response()->json(['message' => 'Please use the frontend login page']);
})->name('login');

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
