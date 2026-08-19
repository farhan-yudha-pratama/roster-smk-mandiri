<?php

use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeroomTeacherController;
use App\Http\Controllers\MasterDayController;
use App\Http\Controllers\MasterTimeAllocationController;
use App\Http\Controllers\MasterUniformController;
use App\Http\Controllers\RosterScheduleController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');
Route::get('/informasi-jadwal', [WelcomeController::class, 'scheduleInfo'])->name('schedule.info');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // User Management (Role check handled in Controller)
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Subjects Management
    Route::get('/subjects/template', [SubjectController::class, 'downloadTemplate'])->name('subjects.template');
    Route::post('/subjects/import', [SubjectController::class, 'importBatch'])->name('subjects.import');
    Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects.index');
    Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::put('/subjects/{id}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Master Classes Management
    Route::get('/classes/template', [\App\Http\Controllers\ClassController::class, 'downloadTemplate'])->name('classes.template');
    Route::post('/classes/import', [\App\Http\Controllers\ClassController::class, 'importBatch'])->name('classes.import');
    Route::resource('classes', ClassController::class);

    // Classrooms Management
    Route::get('/classrooms', [ClassroomController::class, 'index'])->name('classrooms.index');
    Route::post('/classrooms', [ClassroomController::class, 'store'])->name('classrooms.store');
    Route::put('/classrooms/{id}', [ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('/classrooms/{id}', [ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    // Master Homeroom Teachers Management
    Route::get('/homeroom-teachers/template', [\App\Http\Controllers\HomeroomTeacherController::class, 'downloadTemplate'])->name('homeroom-teachers.template');
    Route::post('/homeroom-teachers/import', [\App\Http\Controllers\HomeroomTeacherController::class, 'importBatch'])->name('homeroom-teachers.import');
    Route::get('/homeroom-teachers', [HomeroomTeacherController::class, 'index'])->name('homeroom-teachers.index');
    Route::post('/homeroom-teachers', [HomeroomTeacherController::class, 'store'])->name('homeroom-teachers.store');
    Route::put('/homeroom-teachers/{id}', [HomeroomTeacherController::class, 'update'])->name('homeroom-teachers.update');
    Route::delete('/homeroom-teachers/{id}', [HomeroomTeacherController::class, 'destroy'])->name('homeroom-teachers.destroy');

    // Roster Schedules Management
    Route::get('/roster-schedules/template', [\App\Http\Controllers\RosterScheduleController::class, 'downloadTemplate'])->name('roster-schedules.template');
    Route::post('/roster-schedules/import', [\App\Http\Controllers\RosterScheduleController::class, 'importBatch'])->name('roster-schedules.import');
    Route::get('/roster-schedules', [RosterScheduleController::class, 'index'])->name('roster-schedules.index');
    Route::post('/roster-schedules', [RosterScheduleController::class, 'store'])->name('roster-schedules.store');
    Route::put('/roster-schedules/{id}', [RosterScheduleController::class, 'update'])->name('roster-schedules.update');
    Route::delete('/roster-schedules/{id}', [RosterScheduleController::class, 'destroy'])->name('roster-schedules.destroy');

    // Master Days Management
    Route::get('/master-days', [MasterDayController::class, 'index'])->name('master-days.index');
    Route::post('/master-days', [MasterDayController::class, 'store'])->name('master-days.store');
    Route::put('/master-days/{id}', [MasterDayController::class, 'update'])->name('master-days.update');
    Route::delete('/master-days/{id}', [MasterDayController::class, 'destroy'])->name('master-days.destroy');
    Route::resource('master-uniforms', MasterUniformController::class);
    // Master Time Allocations Management
    Route::get('/time-allocations/template', [\App\Http\Controllers\MasterTimeAllocationController::class, 'downloadTemplate'])->name('time-allocations.template');
    Route::post('/time-allocations/import', [\App\Http\Controllers\MasterTimeAllocationController::class, 'importBatch'])->name('time-allocations.import');
    Route::get('/time-allocations', [\App\Http\Controllers\MasterTimeAllocationController::class, 'index'])->name('time-allocations.index');
    Route::post('/time-allocations', [\App\Http\Controllers\MasterTimeAllocationController::class, 'store'])->name('time-allocations.store');
    Route::put('/time-allocations/{id}', [MasterTimeAllocationController::class, 'update'])->name('time-allocations.update');
    Route::delete('/time-allocations/{id}', [MasterTimeAllocationController::class, 'destroy'])->name('time-allocations.destroy');
});

require __DIR__.'/settings.php';
