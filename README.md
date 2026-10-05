# 🏫 Multi-Tenant School ERP & Parent Mobile Companion

A production-ready, full-stack **School Enterprise Resource Planning (ERP)** system built with **Laravel (PHP)** and **React.js**. The platform features an executive Administrative Dashboard alongside a mobile-responsive Parent Portal with real-time academic, financial, and administrative modules.

---

## 🌟 Key Features

### 🏢 1. Multi-Tenant Architecture
- Seamless school switcher supporting multiple institutional profiles from a unified database.
- Tenant-isolated data querying for students, fees, attendance, examinations, and announcements.

### 👨‍🎓 2. Student Lifecycle Management
- Admission registration pipeline tracking demographics, parent contacts, and classroom allotments.
- **Marathi UTF-8 Excel/CSV Export**: Complete student directories downloadable directly with full Indian language support.

### 💳 3. Fee & Financial Ledger
- Automated fee invoice generation with tracking for Partial, Paid, and Overdue balances.
- **Printable Fee Receipts**: Generates clean, printer-friendly institutional fee receipts complete with official seal and signature slots.
- **Mock UPI / QR Gateway**: Real-time mock payment modal supporting Google Pay, PhonePe, and Paytm with instant transaction IDs.

### 📅 4. Daily Attendance & Compliance
- Interactive daily attendance roster with Present, Absent, and Late marking.
- **Defaulter Tracking System**: Monthly attendance aggregated report alerting administrators for students below the mandatory 75% threshold.

### 📝 5. Academic Examinations & Report Cards
- Subject-wise score recording across Languages, Mathematics, and Sciences.
- Automatic aggregate, percentage, and grade calculations.
- **Official Student Progress Report Card**: Formatted printable marksheets with comprehensive performance metrics.

### 📢 6. Digital Notice Board
- Institutional circulars and category-based announcements (Holidays, Events, Exams, General).
- Real-time synchronisation across administrative and parent-facing views.

### 📱 7. Mobile-First Parent Portal
- Frictionless identity lookup using Admission Number (`ADM101`) or Parent Contact Number.
- Mobile companion interface displaying attendance metrics, pending balances, homework assignments, and transit routes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Laravel 11 (PHP 8.2+) |
| **Frontend Framework** | React.js (Vite) |
| **Database** | MySQL / SQLite |
| **Authentication** | Laravel Sanctum / Token-Based Auth |
| **State & Communication** | RESTful JSON APIs, Native React Hooks |

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js (v18 or higher) & npm
- Git

### 2. Backend Setup
```bash
# Navigate to backend directory
cd school-backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run database migrations and seed default data
php artisan migrate

# Start Laravel API server
php artisan serve