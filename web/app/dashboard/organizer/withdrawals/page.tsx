'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { RoleGate } from '@/components/RoleGate';

type Bank = {
  id: string;
  bank_code: string;
  name: string;
};

type Branch = {
  id: string;
  branch_code: string;
  name: string;
  city: string | null;
};

export default function OrganizerWithdrawalsPage() {
  const [method, setMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bankId, setBankId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const amountCents = useMemo(() => Math.round(Number(amount || 0) * 100), [amount]);

  useEffect(() => {
    fetch('/api/banks')
      .then((response) => response.json())
      .then((data) => setBanks(data.banks ?? []))
      .catch(() => setBanks([]));
  }, []);

  useEffect(() => {
    if (!bankId) {
      setBranches([]);
      setBranchId('');
      return;
    }

    fetch(`/api/banks/${bankId}/branches`)
      .then((response) => response.json())
      .then((data) => setBranches(data.branches ?? []))
      .catch(() => setBranches([]));
  }, [bankId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const body =
      method === 'mpesa'
        ? { method, amountCents, phoneNumber }
        : { method, amountCents, bankId, branchId, accountName, accountNumber };

    const response = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? 'Unable to create withdrawal request.');
      return;
    }

    setMessage(data.message ?? 'Withdrawal request received.');
  }

  return (
    <RoleGate allowedRoles={['organizer', 'super_admin']}>
      <section className="withdrawals-page">
        <div className="topbar">
          <div>
            <h1>Withdrawal Requests</h1>
            <p>Request organizer payouts to M-Pesa or a Kenyan bank account. Admin processing target is within 4 hours.</p>
          </div>
        </div>

        <form className="withdrawal-card" onSubmit={submit}>
        <label>
          Amount (KES)
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="25000" required />
        </label>

        <div className="segmented">
          <button type="button" className={method === 'mpesa' ? 'active' : undefined} onClick={() => setMethod('mpesa')}>
            M-Pesa
          </button>
          <button type="button" className={method === 'bank' ? 'active' : undefined} onClick={() => setMethod('bank')}>
            Bank
          </button>
        </div>

        {method === 'mpesa' ? (
          <label>
            M-Pesa Phone Number
            <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" placeholder="2547..." required />
          </label>
        ) : (
          <>
            <label>
              Bank
              <select value={bankId} onChange={(event) => setBankId(event.target.value)} required>
                <option value="">Select bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </label>
            <label>
              Branch
              <select value={branchId} onChange={(event) => setBranchId(event.target.value)} required>
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}{branch.city ? ` - ${branch.city}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Account Name
              <input value={accountName} onChange={(event) => setAccountName(event.target.value)} required />
            </label>
            <label>
              Account Number
              <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} inputMode="numeric" required />
            </label>
          </>
        )}

        {message ? <div className="auth-message">{message}</div> : null}
        <button type="submit" disabled={loading || amountCents <= 0}>{loading ? 'Submitting...' : 'Request Withdrawal'}</button>
        </form>
      </section>
    </RoleGate>
  );
}
