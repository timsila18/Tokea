import 'package:flutter/material.dart';

class OrganizerVerificationScreen extends StatelessWidget {
  const OrganizerVerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Organizer Verification')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: const [
          TextField(decoration: InputDecoration(labelText: 'ID Document Path')),
          SizedBox(height: 14),
          TextField(decoration: InputDecoration(labelText: 'Business Registration Path')),
          SizedBox(height: 14),
          TextField(decoration: InputDecoration(labelText: 'KRA PIN Document Path')),
          SizedBox(height: 18),
          Card(
            child: ListTile(
              leading: Icon(Icons.verified_user_outlined),
              title: Text('Admin approval workflow'),
              subtitle: Text('Pending, approved, rejected, and needs-more-info states are backed by Supabase.'),
            ),
          ),
        ],
      ),
    );
  }
}
