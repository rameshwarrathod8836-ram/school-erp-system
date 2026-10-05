<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeInvoice;
use Illuminate\Http\Request;

class FeeController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query("school_id", 1);
        $fees = FeeInvoice::with("student")->where("school_id", $schoolId)->latest()->get();
        return response()->json($fees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "school_id" => "required|exists:schools,id",
            "student_id" => "required|exists:students,id",
            "title" => "required|string",
            "total_amount" => "required|numeric|min:0",
            "paid_amount" => "nullable|numeric|min:0",
            "due_date" => "required|date",
            "status" => "nullable|in:paid,partial,unpaid"
        ]);

        $paid = $validated["paid_amount"] ?? 0;
        $total = $validated["total_amount"];

        if (!isset($validated["status"])) {
            if ($paid >= $total) {
                $validated["status"] = "paid";
            } elseif ($paid > 0) {
                $validated["status"] = "partial";
            } else {
                $validated["status"] = "unpaid";
            }
        }

        $fee = FeeInvoice::create($validated);
        return response()->json($fee->load("student"), 201);
    }
}

