<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_homeroom_teachers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('teacher_name');
            $table->uuid('user_id')->nullable()->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('master_homeroom_teachers');
    }
};
