'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function useRealtimeTable(table: string, onChange: () => void) {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`web:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onChange, table]);
}
