'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const roles = [
  ['attendee', 'Attendee'],
  ['organizer', 'Organizer'],
  ['vendor', 'Vendor'],
  ['event_staff', 'Event Staff'],
] as const;

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [role, setRole] = useState<(typeof roles)[number][0]>('attendee');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [businessName, setBusinessName] = useState('');
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
          role,
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
        role,
        disabled_at: null,
      }),
      supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName.trim(),
        phone_number: cleanPhone,
        role,
        bio: 'Tokea member',
      }),
    ];

    const [{ error: userError }, { error: profileError }] = await Promise.all(profileRows);

    if (userError || profileError) {
      setLoading(false);
      setMessage(userError?.message ?? profileError?.message ?? 'Unable to save profile.');
      return;
    }

    if (role === 'organizer') {
      const { error: organizerError } = await supabase.from('organizer_profiles').upsert(
        {
          profile_id: data.user.id,
          organization_name: organizationName.trim(),
        },
        { onConflict: 'profile_id' },
      );
      if (organizerError) {
        setLoading(false);
        setMessage(organizerError.message);
        return;
      }
    }

    if (role === 'vendor') {
      const { error: vendorError } = await supabase.from('vendors').upsert(
        {
          profile_id: data.user.id,
          business_name: businessName.trim(),
        },
        { onConflict: 'profile_id' },
      );
      if (vendorError) {
        setLoading(false);
        setMessage(vendorError.message);
        return;
      }
    }

    if (role === 'event_staff') {
      const { error: staffError } = await supabase.from('staff_profiles').upsert(
        { profile_id: data.user.id },
        { onConflict: 'profile_id' },
      );
      if (staffError) {
        setLoading(false);
        setMessage(staffError.message);
        return;
      }
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
          <select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
            {roles.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
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
        {role === 'organizer' ? (
          <label>
            Organization Name
            <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} required />
          </label>
        ) : null}
        {role === 'vendor' ? (
          <label>
            Business Name
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
          </label>
        ) : null}
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
