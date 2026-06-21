import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/models/app_role.dart';
import '../../core/services/auth_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _organization = TextEditingController();
  final _business = TextEditingController();
  var _role = AppRole.attendee;
  var _loading = false;

  Future<void> _signup() async {
    setState(() => _loading = true);
    try {
      await AuthService(Supabase.instance.client).signUp(
        fullName: _name.text.trim(),
        phoneNumber: _phone.text.trim(),
        password: _password.text,
        role: _role,
        organizationName: _organization.text.trim(),
        businessName: _business.text.trim(),
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created successfully. Please login.'),
        ),
      );
      context.go('/login');
    } on AuthException catch (error) {
      _showError(error.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final needsOrganization = _role == AppRole.organizer;
    final needsBusiness = _role == AppRole.vendor;

    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          DropdownButtonFormField<AppRole>(
            value: _role,
            decoration: const InputDecoration(labelText: 'Account Type'),
            items: const [
              DropdownMenuItem(value: AppRole.attendee, child: Text('Attendee')),
              DropdownMenuItem(value: AppRole.organizer, child: Text('Organizer')),
              DropdownMenuItem(value: AppRole.vendor, child: Text('Vendor')),
              DropdownMenuItem(value: AppRole.eventStaff, child: Text('Event Staff')),
            ],
            onChanged: (role) => setState(() => _role = role ?? AppRole.attendee),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _name,
            decoration: const InputDecoration(labelText: 'Full Name'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Phone Number'),
          ),
          if (needsOrganization) ...[
            const SizedBox(height: 16),
            TextField(
              controller: _organization,
              decoration: const InputDecoration(labelText: 'Organization Name'),
            ),
          ],
          if (needsBusiness) ...[
            const SizedBox(height: 16),
            TextField(
              controller: _business,
              decoration: const InputDecoration(labelText: 'Business Name'),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loading ? null : _signup,
            child: Text(_loading ? 'Creating...' : 'Create Account'),
          ),
        ],
      ),
    );
  }
}
