import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class RewardsReferralsScreen extends StatelessWidget {
  const RewardsReferralsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rewards & Referrals')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          Card(child: ListTile(leading: Icon(Icons.stars_outlined, color: TokeaColors.gold), title: Text('1,240 points'), subtitle: Text('Earn from tickets, food, transport, referrals, attendance, community engagement.'))),
          Card(child: ListTile(leading: Icon(Icons.link_outlined), title: Text('Referral Code'), subtitle: Text('TOKEA-AMINA-2026'))),
          Card(child: ListTile(leading: Icon(Icons.leaderboard_outlined), title: Text('Leaderboard'), subtitle: Text('Invites, registrations, purchases, rewards.'))),
        ],
      ),
    );
  }
}

class MerchandiseScreen extends StatelessWidget {
  const MerchandiseScreen({super.key});

  static const items = ['T-Shirt', 'Cap', 'Hoodie', 'Badge', 'Souvenir', 'Album', 'Book'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Merchandise')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          for (final item in items) Card(
            child: ListTile(
              leading: const Icon(Icons.shopping_bag_outlined, color: TokeaColors.gold),
              title: Text(item),
              subtitle: const Text('Purchase, QR collection, pending, collected, refunded.'),
              trailing: IconButton(onPressed: null, icon: const Icon(Icons.add_circle_outline)),
            ),
          ),
        ],
      ),
    );
  }
}
