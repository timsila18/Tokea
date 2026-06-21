import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/mpesa_payment_service.dart';
import '../../core/theme/tokea_theme.dart';

class TicketsScreen extends StatelessWidget {
  const TicketsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userId = Supabase.instance.client.auth.currentUser?.id;
    final walletStream = userId == null
        ? const Stream<List<Map<String, dynamic>>>.empty()
        : Supabase.instance.client
            .from('ticket_wallet')
            .stream(primaryKey: ['id'])
            .eq('profile_id', userId)
            .order('created_at');

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Tickets'),
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Wallet'),
              Tab(text: 'Buy'),
              Tab(text: 'Transfer'),
              Tab(text: 'Refunds'),
            ],
          ),
          actions: [
            IconButton(
              onPressed: () => context.go('/check-in'),
              icon: const Icon(Icons.qr_code_scanner),
            ),
            IconButton(
              onPressed: () => context.go('/organizer/ticket-dashboard'),
              icon: const Icon(Icons.query_stats),
            ),
          ],
        ),
        body: TabBarView(
          children: [
            _WalletTab(walletStream: walletStream),
            _PurchaseTab(client: Supabase.instance.client),
            const _TransferTab(),
            const _RefundTab(),
          ],
        ),
      ),
    );
  }
}

class _WalletTab extends StatelessWidget {
  const _WalletTab({required this.walletStream});

  final Stream<List<Map<String, dynamic>>> walletStream;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: walletStream,
      builder: (context, snapshot) {
        final tickets = (snapshot.data?.isNotEmpty ?? false) ? snapshot.data! : _demoTickets;
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: tickets.length,
          separatorBuilder: (_, __) => const SizedBox(height: 14),
          itemBuilder: (context, index) => _TicketWalletCard(ticket: tickets[index]),
        );
      },
    );
  }
}

class _TicketWalletCard extends StatelessWidget {
  const _TicketWalletCard({required this.ticket});

  final Map<String, dynamic> ticket;

  @override
  Widget build(BuildContext context) {
    final status = ticket['status']?.toString() ?? 'active';
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: TokeaColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: TokeaColors.gold.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          const _QrPlaceholder(),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(ticket['event_name']?.toString() ?? 'Tokea Event', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                Text(ticket['ticket_type']?.toString() ?? 'Regular'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    Chip(label: Text(status)),
                    const Chip(label: Text('Seat future')),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PurchaseTab extends StatefulWidget {
  const _PurchaseTab({required this.client});

  final SupabaseClient client;

  @override
  State<_PurchaseTab> createState() => _PurchaseTabState();
}

class _PurchaseTabState extends State<_PurchaseTab> {
  final _phoneController = TextEditingController();
  var _quantity = 1;
  Map<String, dynamic>? _selectedTicket;
  bool _loading = false;

  Future<List<Map<String, dynamic>>> _loadTickets() async {
    final rows = await widget.client
        .from('ticket_types')
        .select('id, event_id, name, price_cents, currency, quantity_total, quantity_sold, quantity_reserved, events(title)')
        .eq('is_active', true)
        .order('created_at');
    return List<Map<String, dynamic>>.from(rows);
  }

  Future<void> _checkout() async {
    final ticket = _selectedTicket;
    if (ticket == null) return;

    setState(() => _loading = true);
    try {
      final result = await MpesaPaymentService(widget.client).startTicketCheckout(
        eventId: ticket['event_id'].toString(),
        ticketTypeId: ticket['id'].toString(),
        quantity: _quantity,
        phoneNumber: _phoneController.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['customerMessage']?.toString() ?? 'Check your phone to complete M-Pesa payment.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _loadTickets(),
      builder: (context, snapshot) {
        final tickets = snapshot.data ?? [];
        _selectedTicket ??= tickets.isNotEmpty ? tickets.first : null;

        return ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text('Buy in under 60 seconds', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
            const SizedBox(height: 16),
            if (snapshot.connectionState == ConnectionState.waiting)
              const Center(child: CircularProgressIndicator())
            else if (tickets.isEmpty)
              const Card(
                child: ListTile(
                  leading: Icon(Icons.info_outline),
                  title: Text('No live ticket types yet'),
                  subtitle: Text('Create ticket types for an event, then they will appear here for M-Pesa checkout.'),
                ),
              )
            else ...[
              DropdownButtonFormField<Map<String, dynamic>>(
                value: _selectedTicket,
                decoration: const InputDecoration(labelText: 'Ticket'),
                items: tickets.map((ticket) {
                  final event = ticket['events'] is Map ? ticket['events'] as Map : const {};
                  final title = event['title']?.toString() ?? 'Tokea Event';
                  final priceCents = ticket['price_cents'] is num ? ticket['price_cents'] as num : 0;
                  final price = (priceCents / 100).round();
                  return DropdownMenuItem(
                    value: ticket,
                    child: Text('$title - ${ticket['name']} - KES $price'),
                  );
                }).toList(),
                onChanged: (value) => setState(() => _selectedTicket = value),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                value: _quantity,
                decoration: const InputDecoration(labelText: 'Quantity'),
                items: List.generate(10, (index) => index + 1).map((value) => DropdownMenuItem(value: value, child: Text('$value'))).toList(),
                onChanged: (value) => setState(() => _quantity = value ?? 1),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'M-Pesa Phone Number', hintText: '2547...'),
              ),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: _loading ? null : _checkout,
                icon: const Icon(Icons.phone_iphone),
                label: Text(_loading ? 'Starting STK Push...' : 'Pay with M-Pesa'),
              ),
            ],
            const SizedBox(height: 16),
            const _CheckoutStep(icon: Icons.qr_code_2, title: 'After Payment', body: 'Safaricom callback marks the order paid and your ticket wallet updates in realtime.'),
          ],
        );
      },
    );
  }
}

class _TransferTab extends StatelessWidget {
  const _TransferTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: const [
        TextField(decoration: InputDecoration(labelText: 'Recipient Phone Number')),
        SizedBox(height: 14),
        Text('Recipient accepts, ownership changes, old QR is revoked, and a new QR is issued.'),
      ],
    );
  }
}

class _RefundTab extends StatelessWidget {
  const _RefundTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: const [
        TextField(maxLines: 4, decoration: InputDecoration(labelText: 'Refund Reason')),
        SizedBox(height: 14),
        Text('Refund rules come from organizer policy: no refunds, until X days, approval required, or automatic.'),
      ],
    );
  }
}

class _CheckoutStep extends StatelessWidget {
  const _CheckoutStep({required this.icon, required this.title, required this.body});

  final IconData icon;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, color: TokeaColors.gold),
        title: Text(title),
        subtitle: Text(body),
      ),
    );
  }
}

class _QrPlaceholder extends StatelessWidget {
  const _QrPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 92,
      height: 92,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.all(8),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 5),
        itemCount: 25,
        itemBuilder: (_, index) => Container(
          margin: const EdgeInsets.all(1),
          color: index.isEven || index % 7 == 0 ? Colors.black : Colors.white,
        ),
      ),
    );
  }
}

const List<Map<String, dynamic>> _demoTickets = [
  {
    'event_name': 'Nairobi Gold Weekend',
    'ticket_type': 'VIP',
    'status': 'active',
  },
  {
    'event_name': 'Gospel Sundown Live',
    'ticket_type': 'Regular',
    'status': 'transferred',
  },
];
