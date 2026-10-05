<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        "school_id",
        "admission_number",
        "first_name",
        "last_name",
        "class_name",
        "section",
        "parent_name",
        "parent_phone"
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}

