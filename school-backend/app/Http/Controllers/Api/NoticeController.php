<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->query('school_id', 1);
        $notices = Notice::where('school_id', $schoolId)->latest('date')->get();
        return response()->json($notices);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'category' => 'nullable|string',
        ]);

        $notice = Notice::create($validated);
        return response()->json($notice, 201);
    }
}