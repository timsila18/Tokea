'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function AuthControls() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = '/login';
  }

  if (email) {
    return (
      <div className="auth-controls signed-in">
        <span>{email}</span>
        <button type="button" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-controls">
      <Link href="/login">
        <LogIn size={16} />
        Login
      </Link>
      <Link href="/signup">
        <UserPlus size={16} />
        Sign up
      </Link>
    </div>
  );
}
