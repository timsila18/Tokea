import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/services/mpesa_payment_service.dart';

class WithdrawalRequestScreen extends StatefulWidget {
  const WithdrawalRequestScreen({super.key});

  @override
  State<WithdrawalRequestScreen> createState() => _WithdrawalRequestScreenState();
}

class _WithdrawalRequestScreenState extends State<WithdrawalRequestScreen> {
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  final _accountNameController = TextEditingController();
  final _accountNumberController = TextEditingController();
  var _method = 'mpesa';
  var _loading = false;
  List<Map<String, dynamic>> _banks = [];
  List<Map<String, dynamic>> _branches = [];
  Map<String, dynamic>? _selectedBank;
  Map<String, dynamic>? _selectedBranch;

  MpesaPaymentService get _service => MpesaPaymentService(Supabase.instance.client);

  @override
  void initState() {
    super.initState();
    _loadBanks();
  }

  Future<void> _loadBanks() async {
    try {
      final banks = await _service.fetchKenyaBanks();
      if (mounted) setState(() => _banks = banks);
    } catch (_) {
      if (mounted) setState(() => _banks = []);
    }
  }

  Future<void> _loadBranches(Map<String, dynamic>? bank) async {
    setState(() {
      _selectedBank = bank;
      _selectedBranch = null;
      _branches = [];
    });
    if (bank == null) return;
    final branches = await _service.fetchBankBranches(bank['id'].toString());
    if (mounted) setState(() => _branches = branches);
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amountController.text.trim()) ?? 0;
    final amountCents = (amount * 100).round();
    if (amountCents <= 0) return;

    setState(() => _loading = true);
    try {
      final payload = _method == 'mpesa'
          ? {
              'method': 'mpesa',
              'amountCents': amountCents,
              'phoneNumber': _phoneController.text.trim(),
            }
          : {
              'method': 'bank',
              'amountCents': amountCents,
              'bankId': _selectedBank?['id'],
              'branchId': _selectedBranch?['id'],
              'accountName': _accountNameController.text.trim(),
              'accountNumber': _accountNumberController.text.trim(),
            };
      final result = await _service.requestWithdrawal(payload);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']?.toString() ?? 'Withdrawal request sent.')),
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
    _amountController.dispose();
    _phoneController.dispose();
    _accountNameController.dispose();
    _accountNumberController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Request Withdrawal')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Amount (KES)'),
          ),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'mpesa', label: Text('M-Pesa'), icon: Icon(Icons.phone_iphone)),
              ButtonSegment(value: 'bank', label: Text('Bank'), icon: Icon(Icons.account_balance)),
            ],
            selected: {_method},
            onSelectionChanged: (value) => setState(() => _method = value.first),
          ),
          const SizedBox(height: 12),
          if (_method == 'mpesa')
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'M-Pesa Phone Number', hintText: '2547...'),
            )
          else ...[
            DropdownButtonFormField<Map<String, dynamic>>(
              value: _selectedBank,
              decoration: const InputDecoration(labelText: 'Bank'),
              items: _banks.map((bank) => DropdownMenuItem(value: bank, child: Text(bank['name'].toString()))).toList(),
              onChanged: _loadBranches,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<Map<String, dynamic>>(
              value: _selectedBranch,
              decoration: const InputDecoration(labelText: 'Branch'),
              items: _branches.map((branch) {
                final city = branch['city']?.toString();
                return DropdownMenuItem(
                  value: branch,
                  child: Text('${branch['name']}${city == null ? '' : ' - $city'}'),
                );
              }).toList(),
              onChanged: (value) => setState(() => _selectedBranch = value),
            ),
            const SizedBox(height: 12),
            TextField(controller: _accountNameController, decoration: const InputDecoration(labelText: 'Account Name')),
            const SizedBox(height: 12),
            TextField(controller: _accountNumberController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Account Number')),
          ],
          const SizedBox(height: 18),
          ElevatedButton.icon(
            onPressed: _loading ? null : _submit,
            icon: const Icon(Icons.payments_outlined),
            label: Text(_loading ? 'Submitting...' : 'Submit Withdrawal Request'),
          ),
          const SizedBox(height: 12),
          const Text('Admin will review and process the request within the 4-hour target window.'),
        ],
      ),
    );
  }
}
