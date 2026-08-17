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
        Schema::create('master_day_time_allocations', function (Blueprint $table) {
            $table->id();
            $table->string('master_day_id');
            $table->string('master_time_allocation_id');
            $table->timestamps();

            $table->foreign('master_day_id')->references('id')->on('master_days')->cascadeOnDelete();
            $table->foreign('master_time_allocation_id', 'fk_master_time_alloc')->references('id')->on('master_time_allocations')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_day_time_allocations');
    }
};
