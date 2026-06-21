import 'package:flutter/material.dart';

class VolunteerPortalScreen extends StatelessWidget {
  const VolunteerPortalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Volunteer Portal')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: const [
          TextField(decoration: InputDecoration(labelText: 'Skills')),
          SizedBox(height: 12),
          TextField(decoration: InputDecoration(labelText: 'Availability')),
          SizedBox(height: 12),
          Card(child: ListTile(leading: Icon(Icons.assignment_turned_in_outlined), title: Text('Applications'), subtitle: Text('Apply, accept assignments, check tasks, track hours.'))),
          Card(child: ListTile(leading: Icon(Icons.workspace_premium_outlined), title: Text('Certificates'), subtitle: Text('Volunteer certificates generated after event completion.'))),
        ],
      ),
    );
  }
}
