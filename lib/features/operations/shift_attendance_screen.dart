import 'package:flutter/material.dart';

class ShiftAttendanceScreen extends StatelessWidget {
  const ShiftAttendanceScreen({super.key});

  static const shifts = ['Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Night Shift', 'Custom Shift'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Shifts & GPS Attendance')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          for (final shift in shifts) Card(
            child: ListTile(
              leading: const Icon(Icons.schedule_outlined),
              title: Text(shift),
              subtitle: const Text('Assigned staff, attendance, check-in/out, hours worked, supervisor approval.'),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: null,
            icon: Icon(Icons.location_on_outlined),
            label: Text('GPS Check-In Placeholder'),
          ),
        ],
      ),
    );
  }
}
