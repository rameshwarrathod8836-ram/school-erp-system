<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("exam_records", function (Blueprint $table) {
            $table->id();
            $table->foreignId("school_id")->constrained()->onDelete("cascade");
            $table->foreignId("student_id")->constrained()->onDelete("cascade");
            $table->string("exam_name"); // ???. Term 1 Exam
            $table->integer("marathi")->default(0);
            $table->integer("english")->default(0);
            $table->integer("mathematics")->default(0);
            $table->integer("science")->default(0);
            $table->integer("total_marks")->default(400);
            $table->integer("obtained_marks")->default(0);
            $table->decimal("percentage", 5, 2)->default(0.00);
            $table->string("grade")->default("F");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("exam_records");
    }
};

