import 'package:flutter/material.dart';

class LogisticsOperationsScreen extends StatelessWidget {
  const LogisticsOperationsScreen({super.key});

  static const items = ['Food Deliveries', 'Transport Arrivals', 'Vendor Setup', 'Equipment Delivery', 'Inventory Status', 'Event Readiness'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Logistics Operations')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final item in items) Card(
            child: ListTile(
              leading: const Icon(Icons.inventory_2_outlined),
              title: Text(item),
              subtitle: const Text('Realtime logistics status foundation'),
            ),
          ),
        ],
      ),
    );
  }
}

class HealthSafetyScreen extends StatelessWidget {
  const HealthSafetyScreen({super.key});

  static const items = ['Medical Teams', 'Emergency Contacts', 'Safety Incidents', 'Vendor Compliance', 'Food Safety Compliance', 'Transport Compliance'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Health & Safety')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final item in items) Card(
            child: ListTile(
              leading: const Icon(Icons.health_and_safety_outlined),
              title: Text(item),
              subtitle: const Text('Compliance and incident readiness foundation'),
            ),
          ),
        ],
      ),
    );
  }
}
