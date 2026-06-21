import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';
import { normalizeKenyanPhone } from '@/lib/mpesa/daraja';

const withdrawalSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('mpesa'),
    amountCents: z.number().int().positive().max(50_000_000_00),
    phoneNumber: z.string().min(9).max(20),
  }),
  z.object({
    method: z.literal('bank'),
    amountCents: z.number().int().positive().max(50_000_000_00),
    bankId: z.string().uuid(),
    branchId: z.string().uuid(),
    accountName: z.string().min(2).max(120),
    accountNumber: z.string().min(5).max(40),
  }),
]);

export async function GET(request: Request) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) {
    return auth.error;
  }

  const { data: organizer } = await auth.supabase
    .from('organizer_profiles')
    .select('id')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (!organizer) {
    return NextResponse.json({ withdrawals: [] });
  }

  const { data, error } = await auth.supabase
    .from('payout_requests')
    .select('id, amount_cents, currency, status, payout_method, destination_details, requested_processing_deadline, admin_notes, processed_at, created_at')
    .eq('organizer_id', organizer.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ withdrawals: data });
}

export async function POST(request: Request) {
  const auth = await requireSignedInUser(request);
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = withdrawalSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid withdrawal request' }, { status: 400 });
  }

  const { data: organizer, error: organizerError } = await auth.supabase
    .from('organizer_profiles')
    .select('id')
    .eq('profile_id', auth.user.id)
    .maybeSingle();

  if (organizerError || !organizer) {
    return NextResponse.json({ error: 'Organizer profile required for withdrawals' }, { status: 403 });
  }

  const payload = parsed.data;
  const destination =
    payload.method === 'mpesa'
      ? {
          type: 'mpesa',
          phone_number: normalizeKenyanPhone(payload.phoneNumber),
        }
      : {
          type: 'bank',
          bank_id: payload.bankId,
          branch_id: payload.branchId,
          account_name: payload.accountName.trim(),
          account_number: payload.accountNumber.trim(),
        };

  const { data, error } = await auth.supabase
    .from('payout_requests')
    .insert({
      organizer_id: organizer.id,
      requested_by: auth.user.id,
      status: 'requested',
      amount_cents: payload.amountCents,
      currency: 'KES',
      payout_method: payload.method,
      destination_details: destination,
    })
    .select('id, status, requested_processing_deadline')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    withdrawal: data,
    message: 'Withdrawal request received. Admin processing target is within 4 hours.',
  });
}
