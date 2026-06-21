import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/tokea_theme.dart';

class FinanceBudgetingScreen extends StatelessWidget {
  const FinanceBudgetingScreen({super.key});

  static const categories = [
    'Venue',
    'Marketing',
    'Entertainment',
    'Security',
    'Food',
    'Transport',
    'Staff',
    'Equipment',
    'Miscellaneous',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Finance & Budgeting')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: const [
              _FinanceMetric(label: 'Revenue', value: 'KES 642K'),
              _FinanceMetric(label: 'Expenses', value: 'KES 388K'),
              _FinanceMetric(label: 'Sponsor Income', value: 'KES 120K'),
              _FinanceMetric(label: 'Projected Profit', value: 'KES 254K'),
            ],
          ),
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: () => context.go('/organizer/withdrawals'),
            icon: const Icon(Icons.account_balance_wallet_outlined),
            label: const Text('Request Withdrawal'),
          ),
          const SizedBox(height: 18),
          Text('Budget Categories', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 10),
          for (final category in categories) Card(
            child: ListTile(
              title: Text(category),
              subtitle: const Text('Budgeted • Actual • Variance'),
              trailing: const Icon(Icons.chevron_right),
            ),
          ),
        ],
      ),
    );
  }
}

class _FinanceMetric extends StatelessWidget {
  const _FinanceMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 164,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: TokeaColors.surface,
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
            const SizedBox(height: 4),
            Text(label),
          ],
        ),
      ),
    );
  }
}
