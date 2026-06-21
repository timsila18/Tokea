'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Plus, Search } from 'lucide-react';

export function OrganizerProfileActions({ organizerName }: { organizerName: string }) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="hero-actions">
      <button className="button" type="button" onClick={() => setFollowing((value) => !value)}>
        {following ? <Check size={16} /> : <Plus size={16} />}
        {following ? 'Following' : 'Follow Organizer'}
      </button>
      <Link className="button secondary" href={`/search?q=${encodeURIComponent(organizerName)}`}>
        <Search size={16} />
        View Events
      </Link>
    </div>
  );
}
