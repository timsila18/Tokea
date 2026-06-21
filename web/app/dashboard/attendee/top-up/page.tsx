'use client';

import { FormEvent, useState } from 'react';

export default function WalletTopUpPage() {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const amountCents = Math.round(Number(amount || 0) * 100);
    const response = await fetch('/api/mpesa/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: 'wallet_topup',
        amountCents,
        phoneNumber,
        accountReference: 'TokeaWallet',
        description: 'Tokea wallet top up',
      }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? 'Unable to start M-Pesa top up.');
      return;
    }

    setMessage(data.customerMessage ?? 'Check your phone to complete M-Pesa payment.');
  }

  return (
    <section className="withdrawals-page">
      <div className="topbar">
        <div>
          <h1>Top Up Wallet</h1>
          <p>Start an M-Pesa STK Push and fund your Tokea Event-Day Wallet.</p>
        </div>
      </div>
      <form className="withdrawal-card" onSubmit={submit}>
        <label>
          Amount (KES)
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" required />
        </label>
        <label>
          M-Pesa Phone Number
          <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" placeholder="2547..." required />
        </label>
        {message ? <div className="auth-message">{message}</div> : null}
        <button type="submit" disabled={loading || Number(amount || 0) <= 0}>{loading ? 'Starting STK Push...' : 'Top Up with M-Pesa'}</button>
      </form>
    </section>
  );
}
