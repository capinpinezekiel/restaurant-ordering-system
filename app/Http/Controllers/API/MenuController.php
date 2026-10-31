<?php

namespace App\Http\Controllers\API;  // ✅ MUST match folder

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            MenuItem::orderBy('category')->orderBy('name')->get()
        );
    }
}