<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->decimal('total_amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->date('due_date');
            $table->enum('status', ['paid', 'partial', 'unpaid'])->default('unpaid');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('fee_invoices');
    }
};
