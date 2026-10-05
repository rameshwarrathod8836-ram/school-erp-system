<?php
namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class SchoolScope implements Scope {
    public function apply(Builder $builder, Model $model): void {
        if (auth()->check() && auth()->user()->school_id) {
            $builder->where('school_id', auth()->user()->school_id);
        }
    }
}
