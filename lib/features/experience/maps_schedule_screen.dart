import 'package:flutter/material.dart';

class EventMapsScreen extends StatelessWidget {
  const EventMapsScreen({super.key});

  static const zones = ['Entrances', 'Exits', 'VIP Areas', 'Food Vendors', 'Transport Zones', 'Washrooms', 'Medical Areas', 'Emergency Exits', 'Stages', 'Parking'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Map')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 260,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Icon(Icons.map_outlined, size: 88),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [for (final zone in zones) Chip(label: Text(zone))],
          ),
        ],
      ),
    );
  }
}

class EventScheduleScreen extends StatelessWidget {
  const EventScheduleScreen({super.key});

  static const schedule = [
    ['10:00', 'Opening'],
    ['12:00', 'Speaker Sessions'],
    ['14:00', 'Break'],
    ['16:00', 'Performances'],
    ['21:30', 'Transport Departure'],
    ['22:00', 'Closing'],
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Timeline')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final item in schedule) Card(
            child: ListTile(
              leading: CircleAvatar(child: Text(item[0].split(':').first)),
              title: Text(item[1]),
              subtitle: Text(item[0]),
            ),
          ),
        ],
      ),
    );
  }
}
