import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSignedInUser } from '@/lib/authz';

const checkoutSchema = z.object({
  eventId: z.string().uuid(),
  ticketTypeId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  foodMenuIds: z.array(z.string().uuid()).default([]),
  transportRouteId: z.string().uuid().optional(),
  promoCode: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const auth = await requireSignedInUser();
  if ('error' in auth) {
    return auth.error;
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mode: 'architecture_ready',
    nextStep: 'Create order, reserve capacity, start M-Pesa STK push, issue wallet passes after payment callback.',
  });
}
