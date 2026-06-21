type DarajaTokenResponse = {
  access_token: string;
  expires_in: string;
};

type StkPushResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
};

const productionBaseUrl = 'https://api.safaricom.co.ke';
const sandboxBaseUrl = 'https://sandbox.safaricom.co.ke';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function normalizeKenyanPhone(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith('254') && digits.length === 12) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  if (digits.startsWith('7') && digits.length === 9) {
    return `254${digits}`;
  }

  throw new Error('Enter a valid Kenyan phone number.');
}

function getDarajaBaseUrl() {
  return process.env.MPESA_ENV === 'sandbox' ? sandboxBaseUrl : productionBaseUrl;
}

function getTimestamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

async function getAccessToken() {
  const consumerKey = getRequiredEnv('MPESA_CONSUMER_KEY');
  const consumerSecret = getRequiredEnv('MPESA_CONSUMER_SECRET');
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const response = await fetch(`${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to authenticate with M-Pesa Daraja (${response.status}).`);
  }

  const data = (await response.json()) as DarajaTokenResponse;
  if (!data.access_token) {
    throw new Error('M-Pesa Daraja did not return an access token.');
  }

  return data.access_token;
}

export async function startStkPush(input: {
  amountCents: number;
  phoneNumber: string;
  accountReference: string;
  description: string;
  callbackPath?: string;
}) {
  const shortCode = getRequiredEnv('MPESA_SHORTCODE');
  const passkey = getRequiredEnv('MPESA_PASSKEY');
  const siteUrl = getRequiredEnv('NEXT_PUBLIC_SITE_URL').replace(/\/$/, '');
  const amount = Math.max(1, Math.round(input.amountCents / 100));
  const phoneNumber = normalizeKenyanPhone(input.phoneNumber);
  const timestamp = getTimestamp();
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
  const token = await getAccessToken();

  const response = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${siteUrl}${input.callbackPath ?? '/api/mpesa/callback/stk'}`,
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.description.slice(0, 60),
    }),
  });

  const data = (await response.json()) as StkPushResponse;

  if (!response.ok || data.errorCode || data.ResponseCode !== '0') {
    throw new Error(data.errorMessage ?? data.ResponseDescription ?? 'M-Pesa STK push failed to start.');
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    response: data,
  };
}
