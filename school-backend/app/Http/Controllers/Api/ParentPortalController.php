<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\FeeInvoice;
use App\Models\Attendance;
use App\Models\ExamRecord;
use App\Models\Notice;
use App\Models\School;
use Illuminate\Http\Request;

class ParentPortalController extends Controller
{
    public function getStudentDashboard(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
        ]);

        $identifier = trim($request->identifier);

        $student = Student::where('admission_number', $identifier)
            ->orWhere('parent_phone', $identifier)
            ->first();

        if (!$student) {
            return response()->json([
                'message' => 'या माहितीनुसार कोणताही विद्यार्थी सापडला नाही. कृपया प्रवेश क्रमांक किंवा फोन नंबर तपासा.'
            ], 404);
        }

        $school = School::find($student->school_id);

        // १. उपस्थिती (Attendance)
        $attendances = Attendance::where('student_id', $student->id)->get();
        $totalDays = $attendances->count();
        $presentDays = $attendances->where('status', 'present')->count();
        $attendancePercentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 0;

        // २. फी (FeeInvoice)
        $fees = FeeInvoice::where('student_id', $student->id)->latest()->get();
        $totalFee = (float) $fees->sum('total_amount');
        $paidFee = (float) $fees->sum('paid_amount');
        $dueFee = $totalFee - $paidFee;

        // ३. परीक्षा निकाल (ExamRecord)
        $exams = ExamRecord::where('student_id', $student->id)->latest()->get();

        // ४. शाळेच्या ताज्या सूचना (Notices)
        $notices = Notice::where('school_id', $student->school_id)->latest('date')->take(5)->get();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'admission_number' => $student->admission_number,
                'name' => $student->first_name . ' ' . $student->last_name,
                'class_name' => $student->class_name,
                'section' => $student->section ?? 'A',
                'parent_name' => $student->parent_name,
                'parent_phone' => $student->parent_phone,
                'school_name' => $school ? $school->name : 'School ERP',
            ],
            'attendance' => [
                'total_days' => $totalDays,
                'present_days' => $presentDays,
                'percentage' => $attendancePercentage,
                'is_low' => $attendancePercentage < 75,
            ],
            'fees' => [
                'total_amount' => $totalFee,
                'paid_amount' => $paidFee,
                'due_amount' => $dueFee,
                'records' => $fees,
            ],
            'exams' => $exams,
            'notices' => $notices,
        ]);
    }

    public function payFeeOnline(Request $request)
    {
        $request->validate([
            'fee_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string',
        ]);

        $fee = FeeInvoice::find($request->fee_id);

        if (!$fee) {
            return response()->json(['message' => 'फी चलन सापडले नाही.'], 404);
        }

        $newPaidAmount = (float)$fee->paid_amount + (float)$request->amount;
        $totalAmount = (float)$fee->total_amount;

        if ($newPaidAmount > $totalAmount) {
            return response()->json(['message' => 'रक्कम शिल्लक फीपेक्षा जास्त असू शकत नाही.'], 422);
        }

        $fee->paid_amount = $newPaidAmount;
        $fee->status = ($newPaidAmount >= $totalAmount) ? 'paid' : 'partial';
        $fee->save();

        return response()->json([
            'message' => 'ऑनलाइन फी यशस्वीरीत्या जमा झाली!',
            'transaction_id' => 'TXN' . time() . rand(100, 999),
            'fee' => $fee,
        ]);
    }
}