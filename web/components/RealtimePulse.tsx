'use client';

import { useCallback, useState } from 'react';
import { Radio } from 'lucide-react';
import { useRealtimeTable } from '@/lib/realtime';

export function RealtimePulse({ table }: { table: string }) {
  const [count, setCount] = useState(0);
  const onChange = useCallback(() => setCount((value) => value + 1), []);
  useRealtimeTable(table, onChange);

  return (
    <div className="activity">
      <div className="row">
        <strong><Radio size={14} /> {table}</strong>
        <span className="status good">Realtime</span>
      </div>
      <p>{count === 0 ? 'Listening for mobile and web updates.' : `${count} live update${count === 1 ? '' : 's'} received.`}</p>
    </div>
  );
}
