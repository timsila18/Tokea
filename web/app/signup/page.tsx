'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AppRole } from '@/lib/roles';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const publicSignupRole: AppRole = 'attendee';

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const cleanEmail = email.trim();
    const cleanPhone = phoneNumber.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone_number: cleanPhone,
          role: publicSignupRole,
        },
      },
    });

    if (error || !data.user) {
      setLoading(false);
      setMessage(error?.message ?? 'Unable to create account.');
      return;
    }

    const profileRows = [
      supabase.from('users').upsert({
        id: data.user.id,
        phone_number: cleanPhone,
        role: publicSignupRole,
        disabled_at: null,
      }),
      supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        phone_number: cleanPhone,
        role: publicSignupRole,
        bio: 'Tokea member',
      }),
    ];

    const [{ error: userError }, { error: profileError }] = await Promise.all(profileRows);

    if (userError || profileError) {
      setLoading(false);
      setMessage(userError?.message ?? profileError?.message ?? 'Unable to save profile.');
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setMessage('Account created successfully. Please login.');
    setTimeout(() => router.push('/login'), 900);
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link href="/" className="auth-brand">Tokea</Link>
        <p>Don&apos;t Hear About It. Tokea.</p>
        <h1>Create account</h1>
        <label>
          Account Type
          <input value="Attendee" readOnly aria-readonly="true" />
        </label>
        <p className="auth-helper">
          Organizer, staff, volunteer, vendor, sponsor, artist, and venue accounts are created by Tokea Admin or approved organizer invitation.
        </p>
        <label>
          Full Name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label>
          Email Address
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Kenyan Phone Number
          <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} inputMode="tel" placeholder="2547..." required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required />
        </label>
        {message ? <div className="auth-message">{message}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <Link href="/login" className="auth-switch">Already have an account? Login</Link>
      </form>
    </section>
  );
}
