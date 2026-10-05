<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParentPortalController;
use App\Models\School;

// Authentication Route
Route::post("/login", [AuthController::class, "login"]);

// Schools Master
Route::get("/schools", function () {
    return response()->json(School::all());
});

// Admin ERP Routes
Route::get("/students", [StudentController::class, "index"]);
Route::post("/students", [StudentController::class, "store"]);

Route::get("/fees", [FeeController::class, "index"]);
Route::post("/fees", [FeeController::class, "store"]);

Route::get("/attendances", [AttendanceController::class, "index"]);
Route::post("/attendances", [AttendanceController::class, "store"]);
Route::get("/attendances/monthly-report", [AttendanceController::class, "monthlyReport"]);

Route::get("/exams", [ExamController::class, "index"]);
Route::post("/exams", [ExamController::class, "store"]);

Route::get("/notices", [NoticeController::class, "index"]);
Route::post("/notices", [NoticeController::class, "store"]);

// Parent Portal APIs
Route::post("/parent/dashboard", [ParentPortalController::class, "getStudentDashboard"]);
Route::post("/parent/pay-fee", [ParentPortalController::class, "payFeeOnline"]);