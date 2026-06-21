import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class IncidentCenterScreen extends StatelessWidget {
  const IncidentCenterScreen({super.key});

  static const types = ['Security Incident', 'Medical Incident', 'Lost Child', 'Lost Property', 'Crowd Issue', 'Vendor Issue', 'Emergency'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Incident Center')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const TextField(decoration: InputDecoration(labelText: 'Report Title')),
          const SizedBox(height: 12),
          const TextField(maxLines: 4, decoration: InputDecoration(labelText: 'Resolution / Notes')),
          const SizedBox(height: 16),
          for (final type in types) Card(
            child: ListTile(
              leading: const Icon(Icons.report_outlined, color: TokeaColors.gold),
              title: Text(type),
              subtitle: const Text('Severity, reporter, assigned team, photos, videos, resolution.'),
            ),
          ),
        ],
      ),
    );
  }
}

class EmergencyResponseScreen extends StatelessWidget {
  const EmergencyResponseScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Emergency Response')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Emergency Button', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 14),
            const Text('Notify event management, security, medical, and operations teams in real time.'),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.emergency_share_outlined),
              label: const Text('Broadcast Emergency Alert'),
              style: ElevatedButton.styleFrom(backgroundColor: TokeaColors.pink),
            ),
          ],
        ),
      ),
    );
  }
}
