<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\WelcomeController::class, 'index'])->name('home');
Route::get('/informasi-jadwal', [\App\Http\Controllers\WelcomeController::class, 'scheduleInfo'])->name('schedule.info');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    
    // User Management (Role check handled in Controller)
    Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    // Subjects Management
    Route::get('/subjects', [\App\Http\Controllers\SubjectController::class, 'index'])->name('subjects.index');
    Route::post('/subjects', [\App\Http\Controllers\SubjectController::class, 'store'])->name('subjects.store');
    Route::put('/subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{id}', [\App\Http\Controllers\SubjectController::class, 'destroy'])->name('subjects.destroy');

    // Classes Management
    Route::get('/classes', [\App\Http\Controllers\ClassController::class, 'index'])->name('classes.index');
    Route::post('/classes', [\App\Http\Controllers\ClassController::class, 'store'])->name('classes.store');
    Route::put('/classes/{id}', [\App\Http\Controllers\ClassController::class, 'update'])->name('classes.update');
    Route::delete('/classes/{id}', [\App\Http\Controllers\ClassController::class, 'destroy'])->name('classes.destroy');

    // Classrooms Management
    Route::get('/classrooms', [\App\Http\Controllers\ClassroomController::class, 'index'])->name('classrooms.index');
    Route::post('/classrooms', [\App\Http\Controllers\ClassroomController::class, 'store'])->name('classrooms.store');
    Route::put('/classrooms/{id}', [\App\Http\Controllers\ClassroomController::class, 'update'])->name('classrooms.update');
    Route::delete('/classrooms/{id}', [\App\Http\Controllers\ClassroomController::class, 'destroy'])->name('classrooms.destroy');

    // Homeroom Teachers Management
    Route::get('/homeroom-teachers', [\App\Http\Controllers\HomeroomTeacherController::class, 'index'])->name('homeroom-teachers.index');
    Route::post('/homeroom-teachers', [\App\Http\Controllers\HomeroomTeacherController::class, 'store'])->name('homeroom-teachers.store');
    Route::put('/homeroom-teachers/{id}', [\App\Http\Controllers\HomeroomTeacherController::class, 'update'])->name('homeroom-teachers.update');
    Route::delete('/homeroom-teachers/{id}', [\App\Http\Controllers\HomeroomTeacherController::class, 'destroy'])->name('homeroom-teachers.destroy');

    // Roster Schedules Management
    Route::get('/roster-schedules', [\App\Http\Controllers\RosterScheduleController::class, 'index'])->name('roster-schedules.index');
    Route::post('/roster-schedules', [\App\Http\Controllers\RosterScheduleController::class, 'store'])->name('roster-schedules.store');
    Route::put('/roster-schedules/{id}', [\App\Http\Controllers\RosterScheduleController::class, 'update'])->name('roster-schedules.update');
    Route::delete('/roster-schedules/{id}', [\App\Http\Controllers\RosterScheduleController::class, 'destroy'])->name('roster-schedules.destroy');

    // Master Days Management
    Route::get('/master-days', [\App\Http\Controllers\MasterDayController::class, 'index'])->name('master-days.index');
    Route::post('/master-days', [\App\Http\Controllers\MasterDayController::class, 'store'])->name('master-days.store');
    Route::put('/master-days/{id}', [\App\Http\Controllers\MasterDayController::class, 'update'])->name('master-days.update');
    Route::delete('/master-days/{id}', [\App\Http\Controllers\MasterDayController::class, 'destroy'])->name('master-days.destroy');
    Route::resource('master-uniforms', \App\Http\Controllers\MasterUniformController::class);
    // Master Time Allocations Management
    Route::get('/time-allocations', [\App\Http\Controllers\MasterTimeAllocationController::class, 'index'])->name('time-allocations.index');
    Route::post('/time-allocations', [\App\Http\Controllers\MasterTimeAllocationController::class, 'store'])->name('time-allocations.store');
    Route::put('/time-allocations/{id}', [\App\Http\Controllers\MasterTimeAllocationController::class, 'update'])->name('time-allocations.update');
    Route::delete('/time-allocations/{id}', [\App\Http\Controllers\MasterTimeAllocationController::class, 'destroy'])->name('time-allocations.destroy');
});

require __DIR__.'/settings.php';
