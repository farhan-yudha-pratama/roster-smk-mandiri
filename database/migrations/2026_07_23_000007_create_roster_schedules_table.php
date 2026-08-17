<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roster_schedules', function (Blueprint $table) {
            $table->string('id')->primary();
            
            $table->string('class_id')->nullable();
            $table->foreign('class_id')->references('id')->on('master_classes')->onDelete('cascade');
            
            $table->string('day'); // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
            $table->string('week_cycle'); // 'Odd' or 'Even'
            $table->string('period_number'); // Sessional slot sequence per day (1 to 5)
            
            $table->string('subject_id')->nullable();
            $table->foreign('subject_id')->references('id')->on('master_subjects')->onDelete('cascade');
            
            $table->uuid('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->string('classroom_id')->nullable();
            $table->foreign('classroom_id')->references('id')->on('master_classrooms')->onDelete('cascade');
            
            $table->string('period_duration_hours'); // Total duration counts (e.g., 2, 3, 4, or 10 periods)
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roster_schedules');
    }
};
