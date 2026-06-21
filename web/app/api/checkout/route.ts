import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { startStkPush } from '@/lib/mpesa/daraja';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const checkoutSchema = z.object({
  eventId: z.string().uuid(),
  ticketTypeId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  phoneNumber: z.string().min(9).max(20),
  foodMenuIds: z.array(z.string().uuid()).default([]),
  transportRouteId: z.string().uuid().optional(),
  promoCode: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  const payload = parsed.data;
  const { data: ticketType, error: ticketTypeError } = await auth.supabase
    .from('ticket_types')
    .select('id, event_id, name, price_cents, currency, quantity_total, quantity_sold, quantity_reserved, max_per_user, is_active')
    .eq('id', payload.ticketTypeId)
    .eq('event_id', payload.eventId)
    .maybeSingle();

  if (ticketTypeError || !ticketType || !ticketType.is_active) {
    return NextResponse.json({ error: 'Ticket type is not available' }, { status: 400 });
  }

  if (payload.quantity > ticketType.max_per_user) {
    return NextResponse.json({ error: `Maximum ${ticketType.max_per_user} tickets allowed per order` }, { status: 400 });
  }

  const remaining = ticketType.quantity_total - ticketType.quantity_sold - ticketType.quantity_reserved;
  if (remaining < payload.quantity) {
    return NextResponse.json({ error: 'Not enough tickets remaining' }, { status: 409 });
  }

  const subtotalCents = ticketType.price_cents * payload.quantity;
  const platformFeeCents = Math.round(subtotalCents * 0.04);
  const totalCents = subtotalCents + platformFeeCents;
  const adminSupabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await auth.supabase
    .from('ticket_orders')
    .insert({
      buyer_id: auth.user.id,
      event_id: payload.eventId,
      status: 'pending_payment',
      subtotal_cents: subtotalCents,
      platform_fee_cents: platformFeeCents,
      total_cents: totalCents,
      currency: ticketType.currency,
      quantity: payload.quantity,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select('id, order_number')
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? 'Unable to create ticket order' }, { status: 400 });
  }

  const accountReference = `Tokea${order.order_number}`;
  const description = `Tokea ticket ${ticketType.name}`;

  const { data: transaction, error: transactionError } = await auth.supabase
    .from('mpesa_transactions')
    .insert({
      profile_id: auth.user.id,
      purpose: 'ticket',
      source_table: 'ticket_orders',
      source_id: order.id,
      amount_cents: totalCents,
      currency: ticketType.currency,
      phone_number: payload.phoneNumber,
      account_reference: accountReference,
      description,
      status: 'pending',
    })
    .select('id')
    .single();

  if (transactionError || !transaction) {
    return NextResponse.json({ error: transactionError?.message ?? 'Unable to create M-Pesa transaction' }, { status: 400 });
  }

  try {
    const stk = await startStkPush({
      amountCents: totalCents,
      phoneNumber: payload.phoneNumber,
      accountReference,
      description,
    });

    await adminSupabase
      .from('mpesa_transactions')
      .update({
        merchant_request_id: stk.merchantRequestId,
        checkout_request_id: stk.checkoutRequestId,
        provider_payload: stk.response,
      })
      .eq('id', transaction.id);

    await adminSupabase.from('ticket_payments').insert({
      ticket_order_id: order.id,
      buyer_id: auth.user.id,
      provider: 'mpesa_daraja',
      method: 'mpesa_stk',
      status: 'pending',
      amount_cents: totalCents,
      currency: ticketType.currency,
      phone_number: payload.phoneNumber,
      merchant_request_id: stk.merchantRequestId,
      checkout_request_id: stk.checkoutRequestId,
      provider_payload: stk.response,
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      transactionId: transaction.id,
      checkoutRequestId: stk.checkoutRequestId,
      amountCents: totalCents,
      customerMessage: stk.response.CustomerMessage ?? 'Check your phone to complete M-Pesa payment.',
    });
  } catch (error) {
    await adminSupabase.from('mpesa_transactions').update({ status: 'failed', result_description: (error as Error).message }).eq('id', transaction.id);
    await adminSupabase.from('ticket_orders').update({ status: 'failed' }).eq('id', order.id);

    return NextResponse.json({ error: (error as Error).message }, { status: 502 });
  }
}
