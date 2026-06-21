import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/tokea_theme.dart';

class AttendeeExperienceHubScreen extends StatelessWidget {
  const AttendeeExperienceHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Experience Hub')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Your whole event day', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          const Text("Ticket, food, transport, updates, maps, schedule, and help in one place."),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _ExperiencePass(label: 'Event Ticket', value: 'VIP Active', icon: Icons.confirmation_number_outlined),
              _ExperiencePass(label: 'Food Orders', value: '2 ready soon', icon: Icons.restaurant_outlined),
              _ExperiencePass(label: 'Transport Pass', value: 'Westlands shuttle', icon: Icons.directions_bus_outlined),
              _ExperiencePass(label: 'VIP Access', value: 'Included', icon: Icons.workspace_premium_outlined),
              _ExperiencePass(label: 'Coupons', value: '3 available', icon: Icons.local_offer_outlined),
              _ExperiencePass(label: 'Rewards', value: '1,240 pts', icon: Icons.stars_outlined),
            ],
          ),
          const SizedBox(height: 18),
          _HubAction(label: 'Food Marketplace', icon: Icons.fastfood_outlined, route: '/experience/food'),
          _HubAction(label: 'Transport Booking', icon: Icons.route_outlined, route: '/experience/transport'),
          _HubAction(label: 'Event Maps', icon: Icons.map_outlined, route: '/experience/maps'),
          _HubAction(label: 'Event Schedule', icon: Icons.timeline_outlined, route: '/experience/schedule'),
          _HubAction(label: 'Rewards & Referrals', icon: Icons.card_giftcard_outlined, route: '/experience/rewards'),
          _HubAction(label: 'Merchandise', icon: Icons.shopping_bag_outlined, route: '/experience/merch'),
        ],
      ),
    );
  }
}

class _ExperiencePass extends StatelessWidget {
  const _ExperiencePass({required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 166,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: TokeaColors.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: TokeaColors.gold.withOpacity(0.18)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: TokeaColors.gold),
            const SizedBox(height: 14),
            Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}

class _HubAction extends StatelessWidget {
  const _HubAction({required this.label, required this.icon, required this.route});

  final String label;
  final IconData icon;
  final String route;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: TokeaColors.gold),
        title: Text(label),
        subtitle: const Text('Event-day service foundation'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => context.go(route),
      ),
    );
  }
}
