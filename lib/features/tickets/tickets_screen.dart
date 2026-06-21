import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
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
            const _PurchaseTab(),
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

class _PurchaseTab extends StatelessWidget {
  const _PurchaseTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text('Buy in under 60 seconds', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w900)),
        const SizedBox(height: 16),
        const _CheckoutStep(icon: Icons.confirmation_number_outlined, title: 'Select Ticket', body: 'Early Bird, Regular, VIP, VVIP, Group, Student, Corporate, or Free.'),
        const _CheckoutStep(icon: Icons.add_shopping_cart, title: 'Confirm Quantity', body: 'Maximum per user and capacity checks happen before payment.'),
        const _CheckoutStep(icon: Icons.local_offer_outlined, title: 'Apply Promo Code', body: 'EARLYBIRD, VIP20, STUDENT50, FREETICKET and promoter codes.'),
        const _CheckoutStep(icon: Icons.phone_iphone, title: 'Pay via M-Pesa', body: 'Daraja STK Push first, Paybill/Till and card payments prepared.'),
        const _CheckoutStep(icon: Icons.qr_code_2, title: 'Receive Ticket', body: 'Order, wallet ticket, and unique QR ownership record are generated.'),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          onPressed: null,
          icon: Icon(Icons.lock_outline),
          label: Text('Checkout placeholder'),
        ),
      ],
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
