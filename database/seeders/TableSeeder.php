<?php
namespace Database\Seeders;
use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder {
    public function run() {
        $tables = [
            ['table_number' => 1, 'capacity' => 2, 'status' => 'free', 'location_notes' => 'Near window'],
            ['table_number' => 2, 'capacity' => 2, 'status' => 'free', 'location_notes' => 'Near window'],
            ['table_number' => 3, 'capacity' => 4, 'status' => 'free', 'location_notes' => 'Center'],
            ['table_number' => 4, 'capacity' => 4, 'status' => 'free', 'location_notes' => 'Center'],
            ['table_number' => 5, 'capacity' => 6, 'status' => 'free', 'location_notes' => 'Corner'],
            ['table_number' => 6, 'capacity' => 8, 'status' => 'free', 'location_notes' => 'Main Hall'],
        ];
        foreach ($tables as $t) {
            Table::create($t);
        }
    }
}