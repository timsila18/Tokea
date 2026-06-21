import 'package:flutter/material.dart';

class AnalyticsDashboardScreen extends StatelessWidget {
  const AnalyticsDashboardScreen({super.key});

  static const metrics = [
    'Ticket Sales',
    'Sales Velocity',
    'Revenue Trends',
    'Attendance %',
    'Check-In Rates',
    'Community Growth',
    'Top Promoters',
    'Top Sponsors',
    'Top Vendors',
    'Audience Demographics',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Analytics')),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: metrics.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemBuilder: (context, index) => Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.insights_outlined),
                const Spacer(),
                Text(metrics[index], style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                const Text('Realtime chart foundation'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
