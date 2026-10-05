import 'package:flutter/material.dart';

void main() {
  runApp(const SchoolERPApp());
}

class SchoolERPApp extends StatelessWidget {
  const SchoolERPApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'School ERP - Parent App',
      theme: ThemeData(primarySwatch: Colors.indigo, useMaterial3: true),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('School Dashboard'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildCard(Icons.check_circle, 'Attendance', '95% Present'),
            _buildCard(Icons.receipt_long, 'Fees', '₹ 5,000 Due'),
            _buildCard(Icons.directions_bus, 'Live Bus', 'On Route'),
            _buildCard(Icons.assignment, 'Homework', '2 Pending'),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(IconData icon, String title, String subtitle) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.indigo),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 5),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
