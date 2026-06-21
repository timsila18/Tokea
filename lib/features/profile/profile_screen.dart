import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    await AuthService(Supabase.instance.client).signOut();
    if (context.mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;
    final phone = user?.phone ?? '';
    final email = user?.email ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          TextButton.icon(
            onPressed: () => _logout(context),
            icon: const Icon(Icons.logout),
            label: const Text('Logout'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const CircleAvatar(radius: 44, child: Icon(Icons.person, size: 44)),
          const SizedBox(height: 16),
          Center(child: Text(email, style: Theme.of(context).textTheme.titleMedium)),
          if (phone.isNotEmpty) ...[
            const SizedBox(height: 6),
            Center(child: Text(phone, style: Theme.of(context).textTheme.bodyMedium)),
          ],
          const SizedBox(height: 28),
          const ListTile(title: Text('Bio')),
          const ListTile(title: Text('Events Attended')),
          const ListTile(title: Text('Tickets Purchased')),
          const ListTile(title: Text('Interested Events')),
          const ListTile(title: Text('Saved Events')),
          ListTile(
            title: const Text('Organizer Command Center'),
            subtitle: const Text('Events, teams, sponsors, vendors, finance'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.go('/organizer'),
          ),
          ListTile(
            title: const Text('Organizer Verification'),
            subtitle: const Text('ID, business registration, KRA PIN'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.go('/organizer/verification'),
          ),
          const ListTile(title: Text('Settings')),
          const SizedBox(height: 16),
          OutlinedButton(
            onPressed: () => _logout(context),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}
