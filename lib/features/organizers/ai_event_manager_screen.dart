import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class AiEventManagerScreen extends StatefulWidget {
  const AiEventManagerScreen({super.key});

  @override
  State<AiEventManagerScreen> createState() => _AiEventManagerScreenState();
}

class _AiEventManagerScreenState extends State<AiEventManagerScreen> {
  final _eventType = TextEditingController();
  final _venue = TextEditingController();
  final _budget = TextEditingController();
  final _attendance = TextEditingController();
  final _date = TextEditingController();
  final _category = TextEditingController();
  var _generated = false;

  void _generate() => setState(() => _generated = true);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tokea AI Event Manager')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text("Don't Hear About It. Tokea.", style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 18),
          _Field(controller: _eventType, label: 'Event Type'),
          _Field(controller: _venue, label: 'Venue'),
          _Field(controller: _budget, label: 'Budget'),
          _Field(controller: _attendance, label: 'Expected Attendance'),
          _Field(controller: _date, label: 'Date'),
          _Field(controller: _category, label: 'Category'),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: _generate,
            icon: const Icon(Icons.auto_awesome),
            label: const Text('Generate Event Plan'),
          ),
          if (_generated) ...[
            const SizedBox(height: 18),
            const _AiSection(title: 'Budget Breakdown', body: 'Venue 30%, talent 25%, marketing 15%, security 10%, operations 20%.'),
            const _AiSection(title: 'Task Checklist', body: 'Confirm venue, book DJ, print banners, prepare VIP area, deploy security, confirm vendors.'),
            const _AiSection(title: 'Ticket Recommendations', body: 'Early Bird, Regular, VIP, VVIP, and group packages with staged release dates.'),
            const _AiSection(title: 'Marketing Strategy', body: 'Reels-first launch, organizer community drops, WhatsApp conversion, influencer promoter codes.'),
            const _AiSection(title: 'Vendor Requirements', body: 'Sound, lighting, photography, decor, security, cleaning, caterers.'),
            const _AiSection(title: 'Sponsor Suggestions', body: 'Match by audience, location, category, expected attendance, and brand goals.'),
            const _AiSection(title: 'Risk & Revenue Forecast', body: 'Monitor weather, check-in bottlenecks, payment failures, budget variance, and sales velocity.'),
          ],
        ],
      ),
    );
  }
}

class _Field extends StatelessWidget {
  const _Field({required this.controller, required this.label});

  final TextEditingController controller;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        decoration: InputDecoration(labelText: label),
      ),
    );
  }
}

class _AiSection extends StatelessWidget {
  const _AiSection({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.auto_awesome, color: TokeaColors.gold),
        title: Text(title),
        subtitle: Text(body),
      ),
    );
  }
}
