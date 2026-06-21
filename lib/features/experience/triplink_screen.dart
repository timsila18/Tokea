import 'package:flutter/material.dart';
import '../../core/theme/tokea_theme.dart';

class TriplinkScreen extends StatelessWidget {
  const TriplinkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Triplink'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Book'),
              Tab(text: 'Pass'),
              Tab(text: 'Manifest'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView(
              padding: const EdgeInsets.all(16),
              children: const [
                TextField(decoration: InputDecoration(labelText: 'Pickup Point')),
                SizedBox(height: 12),
                TextField(decoration: InputDecoration(labelText: 'Drop-Off / Return Route')),
                SizedBox(height: 12),
                Card(child: ListTile(leading: Icon(Icons.directions_bus_outlined), title: Text('Shuttle Operators'), subtitle: Text('Bus, matatu, private driver, ride partner, corporate provider support.'))),
                Card(child: ListTile(leading: Icon(Icons.payments_outlined), title: Text('Pay together'), subtitle: Text('Ticket + food + transport in one order architecture.'))),
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
                    child: const Icon(Icons.qr_code_2, size: 82, color: TokeaColors.gold),
                  ),
                  const SizedBox(height: 16),
                  const Text('Transport pass includes vehicle assignment, pickup, future seat assignment, and boarding QR.'),
                ],
              ),
            ),
            ListView(
              padding: const EdgeInsets.all(16),
              children: const [
                _Passenger(name: 'Amina Wanjiku', pickup: 'Westlands', status: 'Booked'),
                _Passenger(name: 'Brian Otieno', pickup: 'Kilimani', status: 'Boarded'),
                _Passenger(name: 'Faith Njeri', pickup: 'CBD', status: 'No Show'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Passenger extends StatelessWidget {
  const _Passenger({required this.name, required this.pickup, required this.status});

  final String name;
  final String pickup;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.person_pin_circle_outlined),
        title: Text(name),
        subtitle: Text('Pickup: $pickup'),
        trailing: Chip(label: Text(status)),
      ),
    );
  }
}
