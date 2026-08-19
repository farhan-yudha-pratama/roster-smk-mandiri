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
        Schema::create('master_day_uniforms', function (Blueprint $table) {
            $table->id();
            $table->string('master_day_id');
            $table->string('master_uniform_id');
            $table->timestamps();

            $table->foreign('master_day_id')->references('id')->on('master_days')->onDelete('cascade');
            $table->foreign('master_uniform_id')->references('id')->on('master_uniforms')->onDelete('cascade');

            $table->unique(['master_day_id', 'master_uniform_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_day_uniforms');
    }
};
