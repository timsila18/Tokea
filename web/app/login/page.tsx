'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error ?? 'Unable to login. Please try again.');
        return;
      }

      const sessionResponse = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (!sessionResponse.ok) {
        setMessage('Login succeeded, but the session was not ready. Please tap Login again.');
        return;
      }

      window.dispatchEvent(new Event('tokea-auth-changed'));
      router.replace(body.dashboard ?? '/dashboard/attendee');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === 'AbortError' ? 'Login is taking too long. Please check your connection and try again.' : 'Unable to login. Please try again.');
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
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
