'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dashboardForRole } from '@/components/RoleAwareSidebar';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const userId = data.user?.id;
    const { data: userRole } = userId
      ? await supabase.from('users').select('role').eq('id', userId).maybeSingle()
      : { data: null };

    router.push(dashboardForRole(userRole?.role ?? data.user?.user_metadata?.role));
    router.refresh();
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link href="/" className="auth-brand">Tokea</Link>
        <p>Don&apos;t Hear About It. Tokea.</p>
        <h1>Login</h1>
        <label>
          Email Address
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        {message ? <div className="auth-message">{message}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <Link href="/signup" className="auth-switch">Create account</Link>
      </form>
    </section>
  );
}
