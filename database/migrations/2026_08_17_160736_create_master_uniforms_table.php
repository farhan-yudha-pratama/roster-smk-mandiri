<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_uniforms', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('uniform_name');
            $table->string('description')->nullable();
            $table->boolean('is_any_day')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_uniforms');
    }
};
