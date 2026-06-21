import 'package:flutter/material.dart';

class OrganizerTeamsScreen extends StatelessWidget {
  const OrganizerTeamsScreen({super.key});

  static const roles = [
    'Owner',
    'Admin',
    'Finance Manager',
    'Marketing Manager',
    'Operations Manager',
    'Ticketing Manager',
    'Support Agent',
    'Custom Permissions',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Organizer Teams')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const TextField(decoration: InputDecoration(labelText: 'Invite by phone number')),
          const SizedBox(height: 16),
          for (final role in roles) Card(
            child: ListTile(
              leading: const Icon(Icons.person_add_alt_1),
              title: Text(role),
              subtitle: const Text('Role permissions foundation'),
            ),
          ),
        ],
      ),
    );
  }
}

class EventDocumentsScreen extends StatelessWidget {
  const EventDocumentsScreen({super.key});

  static const documents = [
    'Contracts',
    'Permits',
    'Venue Agreements',
    'Sponsor Agreements',
    'Vendor Agreements',
    'Insurance Documents',
    'Invoices',
    'Receipts',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Documents')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          OutlinedButton.icon(
            onPressed: null,
            icon: const Icon(Icons.upload_file),
            label: const Text('Upload Document'),
          ),
          const SizedBox(height: 16),
          for (final document in documents) Card(
            child: ListTile(
              leading: const Icon(Icons.description_outlined),
              title: Text(document),
              subtitle: const Text('Secure document management foundation'),
            ),
          ),
        ],
      ),
    );
  }
}
