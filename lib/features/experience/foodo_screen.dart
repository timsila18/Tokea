import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class FoodoScreen extends StatelessWidget {
  const FoodoScreen({super.key});

  static const vendors = [
    ['Burger House', 'Burgers • Fries • Soda'],
    ['Nairobi Pilau Spot', 'Pilau • Samosa • Juice'],
    ['Coffee Cart KE', 'Coffee • Tea • Pastries'],
  ];

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Foodo'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Vendors'),
              Tab(text: 'Pre-Order'),
              Tab(text: 'Redeem'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                for (final vendor in vendors) Card(
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.restaurant_outlined)),
                    title: Text(vendor[0]),
                    subtitle: Text('${vendor[1]}\nRatings, reviews, menu, pricing, availability, licensing docs.'),
                    isThreeLine: true,
                    trailing: const Icon(Icons.chevron_right),
                  ),
                ),
              ],
            ),
            ListView(
              padding: const EdgeInsets.all(16),
              children: const [
                _MenuItem(name: 'Burger', price: 'KES 650'),
                _MenuItem(name: 'Fries', price: 'KES 300'),
                _MenuItem(name: 'Pilau', price: 'KES 450'),
                _MenuItem(name: 'Coffee', price: 'KES 250'),
                _MenuItem(name: 'Water', price: 'KES 120'),
                SizedBox(height: 12),
                Card(child: ListTile(leading: Icon(Icons.shopping_cart_checkout), title: Text('Bundle with ticket'), subtitle: Text('Ticket + food + transport in one checkout architecture.'))),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    height: 220,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: TokeaColors.gold.withOpacity(0.3)),
                    ),
                    child: const Icon(Icons.qr_code_scanner, size: 82, color: TokeaColors.gold),
                  ),
                  const SizedBox(height: 16),
                  const Text('Vendor scans food QR to verify order, quantity, vendor, and redemption status.'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({required this.name, required this.price});

  final String name;
  final String price;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.fastfood_outlined, color: TokeaColors.gold),
        title: Text(name),
        subtitle: Text(price),
        trailing: IconButton(onPressed: null, icon: const Icon(Icons.add_circle_outline)),
      ),
    );
  }
}
