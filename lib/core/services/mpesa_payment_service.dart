import 'package:supabase_flutter/supabase_flutter.dart';

class MpesaPaymentService {
  MpesaPaymentService(this._client);

  final SupabaseClient _client;

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
