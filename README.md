# Multi-Tenant School ERP Starter Kit

This starter kit contains the full core production-ready architecture for:
- Laravel 11/12 Multi-Tenant REST API Backend
- Multi-tenancy Isolation (SchoolScope)
- Authentication & Roles
- Student, Attendance, Fee Management Modules
- Flutter 3.x Parent/Student Mobile App Starter

## Installation & Setup
1. Extract this zip file.
2. For Backend:
   - Run `composer create-project laravel/laravel school-backend`
   - Copy the files from `backend/` into `school-backend/`
   - Configure MySQL credentials in `.env`
   - Run `php artisan migrate`
   - Run `php artisan serve`
3. For Mobile App:
   - Run `flutter create school_mobile`
   - Replace `lib/main.dart` with `mobile/lib/main.dart`
   - Run `flutter run`
