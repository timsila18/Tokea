import 'package:flutter/material.dart';
import '../../core/services/offline_checkin_queue.dart';
import '../../core/theme/tokea_theme.dart';

class CheckinScannerScreen extends StatefulWidget {
  const CheckinScannerScreen({super.key});

  @override
  State<CheckinScannerScreen> createState() => _CheckinScannerScreenState();
}

class _CheckinScannerScreenState extends State<CheckinScannerScreen> {
  final _search = TextEditingController();
  final _queue = OfflineCheckinQueue();
  List<Map<String, dynamic>> _offlineScans = [];
  String _status = 'Ready';

  @override
  void initState() {
    super.initState();
    _loadQueue();
  }

  Future<void> _loadQueue() async {
    final scans = await _queue.readAll();
    if (mounted) setState(() => _offlineScans = scans);
  }

  Future<void> _scanOffline() async {
    await _queue.add(scanValue: _search.text.trim(), result: 'queued_offline');
    await _loadQueue();
    setState(() => _status = 'Offline scan saved. It will sync when internet returns.');
  }

  Future<void> _sync() async {
    await _queue.clear();
    await _loadQueue();
    setState(() => _status = 'Offline queue synced placeholder.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Check-In Mode')),
      body: ListView(
        padding: const EdgeInsets.all(18),
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
          const SizedBox(height: 18),
          TextField(
            controller: _search,
            decoration: const InputDecoration(
              labelText: 'QR, Ticket ID, Name, Phone, or Order Number',
              prefixIcon: Icon(Icons.search),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              ElevatedButton.icon(
                onPressed: _scanOffline,
                icon: const Icon(Icons.wifi_off),
                label: const Text('Store Offline Scan'),
              ),
              OutlinedButton.icon(
                onPressed: _sync,
                icon: const Icon(Icons.sync),
                label: const Text('Sync Queue'),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(_status),
          const SizedBox(height: 18),
          Text('Offline Queue (${_offlineScans.length})', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          for (final scan in _offlineScans) Card(
            child: ListTile(
              leading: const Icon(Icons.offline_pin_outlined),
              title: Text(scan['scan_value']?.toString() ?? 'Offline scan'),
              subtitle: Text(scan['created_at']?.toString() ?? ''),
            ),
          ),
        ],
      ),
    );
  }
}
