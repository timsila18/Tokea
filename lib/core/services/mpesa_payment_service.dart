import 'dart:convert';
import 'dart:io';

import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/supabase_config.dart';

class MpesaPaymentService {
  MpesaPaymentService(this._client);

  final SupabaseClient _client;

  Future<Map<String, dynamic>> startTicketCheckout({
    required String eventId,
    required String ticketTypeId,
    required int quantity,
    required String phoneNumber,
  }) async {
    final token = _client.auth.currentSession?.accessToken;
    if (token == null) {
      throw const AuthException('Please login again to checkout.');
    }

    final uri = Uri.parse('${SupabaseConfig.apiBaseUrl}/api/checkout');
    final request = await HttpClient().postUrl(uri);
    request.headers.contentType = ContentType.json;
    request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    request.write(jsonEncode({
      'eventId': eventId,
      'ticketTypeId': ticketTypeId,
      'quantity': quantity,
      'phoneNumber': phoneNumber,
      'foodMenuIds': <String>[],
    }));

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final data = jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['error']?.toString() ?? 'Unable to start M-Pesa checkout.');
    }

    return data;
  }

  Future<List<Map<String, dynamic>>> fetchKenyaBanks() async {
    final uri = Uri.parse('${SupabaseConfig.apiBaseUrl}/api/banks');
    final request = await HttpClient().getUrl(uri);
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final data = jsonDecode(body) as Map<String, dynamic>;
    return List<Map<String, dynamic>>.from(data['banks'] as List? ?? const []);
  }

  Future<List<Map<String, dynamic>>> fetchBankBranches(String bankId) async {
    final uri = Uri.parse('${SupabaseConfig.apiBaseUrl}/api/banks/$bankId/branches');
    final request = await HttpClient().getUrl(uri);
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final data = jsonDecode(body) as Map<String, dynamic>;
    return List<Map<String, dynamic>>.from(data['branches'] as List? ?? const []);
  }

  Future<Map<String, dynamic>> requestWithdrawal(Map<String, dynamic> payload) async {
    final token = _client.auth.currentSession?.accessToken;
    if (token == null) {
      throw const AuthException('Please login again to request withdrawal.');
    }

    final uri = Uri.parse('${SupabaseConfig.apiBaseUrl}/api/withdrawals');
    final request = await HttpClient().postUrl(uri);
    request.headers.contentType = ContentType.json;
    request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    request.write(jsonEncode(payload));

    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    final data = jsonDecode(body) as Map<String, dynamic>;

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(data['error']?.toString() ?? 'Unable to request withdrawal.');
    }

    return data;
  }

  Future<void> createPendingPayment({
    required String ticketOrderId,
    required String buyerId,
    required int amountCents,
    required String phoneNumber,
    String method = 'mpesa_stk',
  }) async {
    await _client.from('ticket_payments').insert({
      'ticket_order_id': ticketOrderId,
      'buyer_id': buyerId,
      'method': method,
      'status': 'pending',
      'amount_cents': amountCents,
      'currency': 'KES',
      'phone_number': phoneNumber,
    });
  }
}
