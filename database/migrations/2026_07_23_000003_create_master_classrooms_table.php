<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_classrooms', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g., 'LAB-05', 'THEORY-10'
            $table->string('room_name');
            $table->string('room_type')->nullable(); // 'Theory', 'Laboratory', 'Workshop'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_classrooms');
    }
};
