import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class SponsorMarketplaceScreen extends StatelessWidget {
  const SponsorMarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const _MarketplaceScaffold(
      title: 'Sponsor Marketplace',
      searchLabel: 'Search sponsors by industry, audience, budget, location',
      items: [
        'Create sponsor profile',
        'Upload logos and brand assets',
        'Specify industries and budgets',
        'View matching events',
        'Apply for sponsorship opportunities',
        'Track proposals, negotiations, contracts, payments, deliverables',
      ],
    );
  }
}

class VendorMarketplaceScreen extends StatelessWidget {
  const VendorMarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const _MarketplaceScaffold(
      title: 'Vendor Marketplace',
      searchLabel: 'Search photographers, DJs, sound, lighting, caterers',
      items: [
        'Compare vendors',
        'View ratings and pricing',
        'Request quotations',
        'Book vendors',
        'Message vendors',
        'Track response time, acceptance rate, completed jobs, reviews',
      ],
    );
  }
}

class _MarketplaceScaffold extends StatelessWidget {
  const _MarketplaceScaffold({
    required this.title,
    required this.searchLabel,
    required this.items,
  });

  final String title;
  final String searchLabel;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              labelText: searchLabel,
            ),
          ),
          const SizedBox(height: 18),
          for (final item in items) Card(
            child: ListTile(
              leading: const Icon(Icons.workspace_premium_outlined, color: TokeaColors.gold),
              title: Text(item),
              subtitle: const Text('Marketplace module ready for live Supabase data.'),
            ),
          ),
        ],
      ),
    );
  }
}
