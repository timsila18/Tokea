import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type CallbackMetadataItem = {
  Name: string;
  Value?: string | number;
};

type StkCallbackPayload = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: CallbackMetadataItem[];
      };
    };
  };
};

function getMetadataValue(items: CallbackMetadataItem[] | undefined, name: string) {
  return items?.find((item) => item.Name === name)?.Value;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as StkCallbackPayload;
  const callback = payload.Body?.stkCallback;

  if (!callback?.CheckoutRequestID) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdminClient();
  const metadata = callback.CallbackMetadata?.Item;
  const receipt = getMetadataValue(metadata, 'MpesaReceiptNumber');
  const resultCode = callback.ResultCode ?? -1;
  const paymentStatus = resultCode === 0 ? 'succeeded' : 'failed';

  await supabase
    .from('mpesa_transactions')
    .update({
      status: paymentStatus,
      merchant_request_id: callback.MerchantRequestID,
      mpesa_receipt_number: receipt ? String(receipt) : null,
      result_code: resultCode,
      result_description: callback.ResultDesc,
      callback_payload: payload,
    })
    .eq('checkout_request_id', callback.CheckoutRequestID);

  const { data: payment } = await supabase
    .from('ticket_payments')
    .select('ticket_order_id')
    .eq('checkout_request_id', callback.CheckoutRequestID)
    .maybeSingle();

  await supabase
    .from('ticket_payments')
    .update({
      status: paymentStatus,
      mpesa_receipt_number: receipt ? String(receipt) : null,
      failure_reason: resultCode === 0 ? null : callback.ResultDesc,
      provider_payload: payload,
    })
    .eq('checkout_request_id', callback.CheckoutRequestID);

  if (resultCode === 0 && payment?.ticket_order_id) {
    await supabase
      .from('ticket_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.ticket_order_id);
  }

  return NextResponse.json({ ok: true });
}
