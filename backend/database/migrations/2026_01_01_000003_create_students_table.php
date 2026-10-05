<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('admission_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('class_name');
            $table->string('section')->nullable();
            $table->string('parent_name');
            $table->string('parent_phone');
            $table->timestamps();
            $table->unique(['school_id', 'admission_number']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('students');
    }
};
