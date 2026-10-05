<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'description',
        'date',
        'category',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}