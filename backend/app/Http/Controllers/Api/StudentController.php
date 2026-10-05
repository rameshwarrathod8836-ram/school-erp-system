<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller {
    public function index() {
        return response()->json(Student::with('feeInvoices')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'admission_number' => 'required',
            'first_name' => 'required',
            'last_name' => 'required',
            'class_name' => 'required',
            'parent_name' => 'required',
            'parent_phone' => 'required',
        ]);

        $student = Student::create($validated);
        return response()->json($student, 201);
    }

    public function show($id) {
        return response()->json(Student::findOrFail($id));
    }
}
