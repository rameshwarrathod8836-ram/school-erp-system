<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query("school_id", 1);
        $students = Student::where("school_id", $schoolId)->latest()->get();
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "school_id" => "required|exists:schools,id",
            "admission_number" => "required|string",
            "first_name" => "required|string",
            "last_name" => "required|string",
            "class_name" => "required|string",
            "section" => "nullable|string",
            "parent_name" => "required|string",
            "parent_phone" => "required|string"
        ]);

        $student = Student::create($validated);
        return response()->json($student, 201);
    }
}

