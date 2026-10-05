<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeInvoice;
use Illuminate\Http\Request;

class FeeController extends Controller {
    public function index() {
        return response()->json(FeeInvoice::with('student')->get());
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'title' => 'required',
            'total_amount' => 'required|numeric',
            'due_date' => 'required|date'
        ]);

        $invoice = FeeInvoice::create($validated);
        return response()->json($invoice, 201);
    }
}
