<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        "name",
        "subdomain",
        "email",
        "phone",
        "address",
        "status"
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}

