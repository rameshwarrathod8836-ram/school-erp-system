<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExamRecord;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query("school_id", 1);
        $records = ExamRecord::with("student")
            ->where("school_id", $schoolId)
            ->latest()
            ->get();

        return response()->json($records);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "school_id" => "required|exists:schools,id",
            "student_id" => "required|exists:students,id",
            "exam_name" => "required|string",
            "marathi" => "required|numeric|min:0|max:100",
            "english" => "required|numeric|min:0|max:100",
            "mathematics" => "required|numeric|min:0|max:100",
            "science" => "required|numeric|min:0|max:100",
        ]);

        $obtained = $validated["marathi"] + $validated["english"] + $validated["mathematics"] + $validated["science"];
        $percentage = round(($obtained / 400) * 100, 2);

        $grade = "F";
        if ($percentage >= 85) $grade = "A+";
        elseif ($percentage >= 70) $grade = "A";
        elseif ($percentage >= 55) $grade = "B";
        elseif ($percentage >= 40) $grade = "C";

        $exam = ExamRecord::updateOrCreate(
            [
                "school_id" => $validated["school_id"],
                "student_id" => $validated["student_id"],
                "exam_name" => $validated["exam_name"],
            ],
            [
                "marathi" => $validated["marathi"],
                "english" => $validated["english"],
                "mathematics" => $validated["mathematics"],
                "science" => $validated["science"],
                "total_marks" => 400,
                "obtained_marks" => $obtained,
                "percentage" => $percentage,
                "grade" => $grade,
            ]
        );

        return response()->json($exam, 201);
    }
}

