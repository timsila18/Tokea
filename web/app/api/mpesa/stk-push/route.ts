import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { startStkPush } from '@/lib/mpesa/daraja';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const stkPushSchema = z.object({
  amountCents: z.number().int().positive().max(10_000_000_00),
  phoneNumber: z.string().min(9).max(20),
  purpose: z.enum(['ticket', 'sponsorship', 'vendor_booking', 'food_order', 'transport_booking', 'wallet_topup']),
  sourceTable: z.string().max(80).optional(),
  sourceId: z.string().uuid().optional(),
  accountReference: z.string().min(2).max(40),
  description: z.string().min(2).max(80),
});

export async function POST(request: Request) {
  const auth = await requireSignedInUser();
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = stkPushSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid M-Pesa payload' }, { status: 400 });
  }

  const payload = parsed.data;
  const { data: transaction, error: insertError } = await auth.supabase
    .from('mpesa_transactions')
    .insert({
      profile_id: auth.user.id,
      purpose: payload.purpose,
      source_table: payload.sourceTable,
      source_id: payload.sourceId,
      amount_cents: payload.amountCents,
      phone_number: payload.phoneNumber,
      account_reference: payload.accountReference,
      description: payload.description,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !transaction) {
    return NextResponse.json({ error: insertError?.message ?? 'Unable to create M-Pesa transaction' }, { status: 400 });
  }

  try {
    const adminSupabase = createSupabaseAdminClient();
    const stk = await startStkPush({
      amountCents: payload.amountCents,
      phoneNumber: payload.phoneNumber,
      accountReference: payload.accountReference,
      description: payload.description,
    });

    const { error: updateError } = await adminSupabase
      .from('mpesa_transactions')
      .update({
        merchant_request_id: stk.merchantRequestId,
        checkout_request_id: stk.checkoutRequestId,
        provider_payload: stk.response,
      })
      .eq('id', transaction.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (payload.purpose === 'ticket' && payload.sourceTable === 'ticket_orders' && payload.sourceId) {
      await adminSupabase.from('ticket_payments').insert({
        ticket_order_id: payload.sourceId,
        buyer_id: auth.user.id,
        provider: 'mpesa_daraja',
        method: 'mpesa_stk',
        status: 'pending',
        amount_cents: payload.amountCents,
        currency: 'KES',
        phone_number: payload.phoneNumber,
        merchant_request_id: stk.merchantRequestId,
        checkout_request_id: stk.checkoutRequestId,
        provider_payload: stk.response,
      });
    }

    return NextResponse.json({
      ok: true,
      transactionId: transaction.id,
      checkoutRequestId: stk.checkoutRequestId,
      merchantRequestId: stk.merchantRequestId,
      customerMessage: stk.response.CustomerMessage ?? 'Check your phone to complete M-Pesa payment.',
    });
  } catch (error) {
    await createSupabaseAdminClient()
      .from('mpesa_transactions')
      .update({
        status: 'failed',
        result_description: (error as Error).message,
      })
      .eq('id', transaction.id);

    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
