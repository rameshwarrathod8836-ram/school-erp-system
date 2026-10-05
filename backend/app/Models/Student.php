<?php
namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Model;

class Student extends Model {
    protected $guarded = [];

    protected static function booted() {
        static::addGlobalScope(new SchoolScope);
        static::creating(function ($student) {
            if (auth()->check() && auth()->user()->school_id) {
                $student->school_id = auth()->user()->school_id;
            }
        });
    }

    public function feeInvoices() {
        return $this->hasMany(FeeInvoice::class);
    }
    public function attendances() {
        return $this->hasMany(Attendance::class);
    }
}
