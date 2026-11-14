<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add new columns
            $table->string('last_name')->after('id');
            $table->string('first_name')->after('last_name');
            $table->string('suffix')->nullable()->after('first_name'); // e.g., Jr., Sr., III
            $table->dropColumn('name');
            
          
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['last_name', 'first_name', 'suffix']);
        });
    }
};
