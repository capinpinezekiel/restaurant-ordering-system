<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TableSeeder extends Seeder
{
    public function run()
    {
        // Temporarily disable foreign key checks so we can reset tables
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        
        // Clear dependent tables FIRST, then tables
        DB::table('reservations')->delete();
        DB::table('order_items')->delete();
        DB::table('orders')->delete();
        DB::table('tables')->delete();
        
        // Reset IDs back to 1
        DB::statement('ALTER TABLE tables AUTO_INCREMENT = 1');
        
        // Re-enable checks
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        // Insert fresh, clean set of tables
        $tables = [
            ['table_number' => 1, 'capacity' => 2, 'status' => 'free', 'location_notes' => 'Near window'],
            ['table_number' => 2, 'capacity' => 2, 'status' => 'free', 'location_notes' => 'Near window'],
            ['table_number' => 3, 'capacity' => 4, 'status' => 'free', 'location_notes' => 'Center'],
            ['table_number' => 4, 'capacity' => 4, 'status' => 'free', 'location_notes' => 'Center'],
            ['table_number' => 5, 'capacity' => 6, 'status' => 'free', 'location_notes' => 'Side area'],
            ['table_number' => 6, 'capacity' => 8, 'status' => 'free', 'location_notes' => 'Private room'],
        ];

        foreach ($tables as $table) {
            Table::create($table);
        }
    }
}