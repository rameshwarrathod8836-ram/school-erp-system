<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        "school_id",
        "student_id",
        "exam_name",
        "marathi",
        "english",
        "mathematics",
        "science",
        "total_marks",
        "obtained_marks",
        "percentage",
        "grade"
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}

