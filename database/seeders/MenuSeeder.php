<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        MenuItem::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        $items = [
            ['name' => 'Chicken Adobo', 'category' => 'Main Dish', 'description' => 'Classic soy sauce & vinegar braised chicken', 'price' => 180, 'is_available' => true],
            ['name' => 'Pork Sinigang', 'category' => 'Main Dish', 'description' => 'Tamarind soup with pork & vegetables', 'price' => 200, 'is_available' => true],
            ['name' => 'Beef Kare-Kare', 'category' => 'Main Dish', 'description' => 'Oxtail & peanut sauce stew', 'price' => 280, 'is_available' => true],
            ['name' => 'Garlic Rice', 'category' => 'Rice', 'description' => 'Fried rice with toasted garlic', 'price' => 45, 'is_available' => true],
            ['name' => 'Steamed Rice', 'category' => 'Rice', 'description' => 'Plain white rice', 'price' => 25, 'is_available' => true],
            ['name' => 'Halo-Halo', 'category' => 'Dessert', 'description' => 'Shaved ice, milk, mixed sweets', 'price' => 95, 'is_available' => true],
            ['name' => 'Iced Tea', 'category' => 'Drink', 'description' => 'Refreshing cold tea', 'price' => 40, 'is_available' => true],
            ['name' => 'Bottled Water', 'category' => 'Drink', 'description' => 'Purified drinking water', 'price' => 20, 'is_available' => true],
        ];

        foreach ($items as $item) {
            MenuItem::create($item);
        }
    }
}