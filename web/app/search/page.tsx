import type { Metadata } from 'next';
import { ModuleTable } from '@/components/ModuleTable';

export const metadata: Metadata = {
  title: 'Global Search',
  description: 'Search events, organizers, venues, artists, speakers, sponsors, vendors, food vendors, transport providers, and communities.',
};

export default function SearchPage() {
  return (
    <>
      <div className="topbar">
        <input className="search" placeholder="Search the Tokea ecosystem..." />
        <button className="button">Search</button>
      </div>
      <ModuleTable
        title="Search Index Coverage"
        columns={['Entity', 'Table', 'Status']}
        rows={[
          ['Events', 'events', 'Indexed'],
          ['Organizers', 'organizer_profiles', 'Indexed'],
          ['Venues', 'venue_profiles', 'Indexed'],
          ['Sponsors', 'sponsors', 'Indexed'],
          ['Vendors', 'vendors', 'Indexed'],
          ['Food Vendors', 'food_vendors', 'Indexed'],
          ['Transport Providers', 'transport_providers', 'Indexed'],
          ['Communities', 'event_communities', 'Indexed'],
        ]}
      />
    </>
  );
}
