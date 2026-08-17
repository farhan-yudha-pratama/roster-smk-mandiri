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
        Schema::table('master_days', function (Blueprint $table) {
            $table->dropColumn('uniform_description');
            $table->string('master_uniform_id')->nullable()->after('day_name');
            $table->foreign('master_uniform_id')->references('id')->on('master_uniforms')->nullOnDelete();
        });

        Schema::table('master_time_allocations', function (Blueprint $table) {
            $table->dropForeign(['master_day_id']);
            $table->dropColumn('master_day_id');
            $table->string('name')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_time_allocations', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->string('master_day_id')->after('id');
        });

        Schema::table('master_days', function (Blueprint $table) {
            $table->dropForeign(['master_uniform_id']);
            $table->dropColumn('master_uniform_id');
            $table->string('uniform_description')->nullable();
        });
    }
};
