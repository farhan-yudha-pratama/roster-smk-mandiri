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
        Schema::create('master_time_allocations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('master_day_id');
            $table->foreign('master_day_id')->references('id')->on('master_days')->onDelete('cascade');

            $table->string('type'); // 'ceremony', 'period', 'break'
            $table->integer('period_number')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->string('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_time_allocations');
    }
};
