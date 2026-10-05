<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query("school_id", 1);
        $date = $request->query("date", date("Y-m-d"));

        $attendances = Attendance::with("student")
            ->where("school_id", $schoolId)
            ->where("date", $date)
            ->get();

        return response()->json($attendances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "school_id" => "required|exists:schools,id",
            "date" => "required|date",
            "records" => "required|array",
            "records.*.student_id" => "required|exists:students,id",
            "records.*.status" => "required|in:present,absent,late"
        ]);

        $saved = [];
        foreach ($validated["records"] as $record) {
            $attendance = Attendance::updateOrCreate(
                [
                    "school_id" => $validated["school_id"],
                    "student_id" => $record["student_id"],
                    "date" => $validated["date"]
                ],
                [
                    "status" => $record["status"]
                ]
            );
            $saved[] = $attendance;
        }

        return response()->json(["message" => "????? ????? ????!", "data" => $saved], 200);
    }

    public function monthlyReport(Request $request)
    {
        $schoolId = $request->query("school_id", 1);
        $month = $request->query("month", date("m"));
        $year = $request->query("year", date("Y"));

        $students = Student::where("school_id", $schoolId)->get();

        $report = $students->map(function ($student) use ($schoolId, $month, $year) {
            $totalDays = Attendance::where("school_id", $schoolId)
                ->where("student_id", $student->id)
                ->whereMonth("date", $month)
                ->whereYear("date", $year)
                ->count();

            $presentDays = Attendance::where("school_id", $schoolId)
                ->where("student_id", $student->id)
                ->whereMonth("date", $month)
                ->whereYear("date", $year)
                ->where("status", "present")
                ->count();

            $percentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100) : 0;

            return [
                "student_id" => $student->id,
                "admission_number" => $student->admission_number,
                "name" => $student->first_name . " " . $student->last_name,
                "class" => $student->class_name . " (" . ($student->section ?: "A") . ")",
                "total_days" => $totalDays,
                "present_days" => $presentDays,
                "percentage" => $percentage,
                "is_low" => $totalDays > 0 && $percentage < 75
            ];
        });

        return response()->json($report);
    }
}

