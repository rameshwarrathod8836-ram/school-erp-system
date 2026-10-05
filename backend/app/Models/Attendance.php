<?php
namespace App\Models;

use App\Models\Scopes\SchoolScope;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model {
    protected $guarded = [];

    protected static function booted() {
        static::addGlobalScope(new SchoolScope);
        static::creating(function ($item) {
            if (auth()->check() && auth()->user()->school_id) {
                $item->school_id = auth()->user()->school_id;
            }
        });
    }

    public function student() {
        return $this->belongsTo(Student::class);
    }
}
