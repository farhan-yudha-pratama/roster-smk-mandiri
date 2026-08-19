<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_classes', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g., 'X-PPL-GIM-1', 'XII-TKJ-1'
            $table->string('grade_level'); // 'X', 'XI', 'XII'
            $table->string('class_name');
            $table->string('major'); // 'TJK', 'PPL GIM', 'TKJ', 'RPL'

            // 1-to-1 relationship with Homeroom Teacher
            $table->string('master_classroom_teacher_id')->nullable()->unique();
            $table->foreign('master_classroom_teacher_id')->references('id')->on('master_homeroom_teachers')->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_classes');
    }
};
