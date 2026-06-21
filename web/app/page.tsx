import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  Eye,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  Utensils,
} from 'lucide-react';
import { TopbarActions } from '@/components/TopbarActions';

const events = [
  {
    slug: 'blankets-and-wine-nairobi',
    title: 'Blankets & Wine Nairobi',
    venue: 'Uhuru Gardens',
    date: 'May 31, 2025',
    time: '12:00 PM',
    price: 'KES 2,500',
    tag: 'This Saturday',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'koroga-festival-2025',
    title: 'Koroga Festival 2025',
    venue: 'The Carnivore Grounds',
    date: 'Jun 8, 2025',
    time: '12:00 PM',
    price: 'KES 3,000',
    tag: 'Jun 8, 2025',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'sauti-sol-live-in-concert',
    title: 'Sauti Sol Live in Concert',
    venue: 'KICC, Nairobi',
    date: 'Jun 14, 2025',
    time: '6:00 PM',
    price: 'KES 4,000',
    tag: 'Jun 14, 2025',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'nairobi-comedy-night',
    title: 'Nairobi Comedy Night',
    venue: 'The Standup Lounge',
    date: 'May 30, 2025',
    time: '8:00 PM',
    price: 'KES 1,200',
    tag: 'May 30, 2025',
    image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=900&q=80',
  },
];

type Tone = 'pink' | 'gold' | 'green' | 'purple';
type ActivityItem = [string, string, string, LucideIcon, Tone];
type MetricItem = [string, string, string, LucideIcon, Tone];
type TransactionItem = [string, string, string, 'positive' | 'negative'];

const activity: ActivityItem[] = [
  ['New ticket sale', 'Early Bird - Blankets & Wine Nairobi', '12s ago', Ticket, 'pink'],
  ['Order completed', 'James Mwangi - 2x VIP', '34s ago', CreditCard, 'green'],
  ['New organizer registered', 'Nairobi Comedy Club', '1m ago', Users, 'purple'],
  ['Event updated', 'Koroga Festival 2025', '2m ago', CalendarDays, 'gold'],
  ['Payout processed', 'KES 48,750 to Melanin Events', '3m ago', BriefcaseBusiness, 'green'],
];

const metrics: MetricItem[] = [
  ['Total Events', '1,248', '12.5% vs last month', CalendarDays, 'pink'],
  ['Total Tickets Sold', '35,682', '18.7% vs last month', Ticket, 'gold'],
  ['Total Revenue (KES)', '12.4M', '23.4% vs last month', BriefcaseBusiness, 'pink'],
  ['Active Organizers', '532', '8.3% vs last month', Users, 'gold'],
  ['Foodo Orders', '3,248', '15.6% vs last month', Utensils, 'pink'],
];

const transactions: TransactionItem[] = [
  ['Ticket Payout - Blankets & Wine', 'Today, 10:15 AM', '+KES 48,750.00', 'positive'],
  ['Top Up via MPESA', 'Today, 09:40 AM', '+KES 10,000.00', 'positive'],
  ['Foodo Settlement - Koroga', 'Yesterday, 11:22 PM', '+KES 7,850.00', 'positive'],
  ['Withdrawal to Equity Bank ****1234', 'May 23, 2025', '-KES 20,000.00', 'negative'],
];

export default function HomePage() {
  return (
    <div className="dashboard-screen">
      <header className="dashboard-topbar">
        <form className="top-search" action="/search">
          <Search size={18} />
          <input name="q" placeholder="Search events, artists, venues, hashtags..." />
          <span><Command size={13} /> K</span>
        </form>

        <TopbarActions />
      </header>

      <div className="dashboard-grid">
        <main className="dashboard-main">
          <section className="spotlight-panel">
            <div className="spotlight-copy">
              <p className="section-kicker">Discover Public Events</p>
              <h1>Your Gateway to Kenya&apos;s Best Experiences</h1>
              <p>From electrifying concerts to cultural festivals, find events that create memories.</p>
              <form className="hero-search" action="/search">
                <Search size={18} />
                <input name="q" placeholder="Search events, artists, venues..." />
                <button type="submit">Search</button>
              </form>
              <div className="trending">
                <span>Trending Searches:</span>
                {['#BlanketsAndWine', '#Nairobi', '#Gospel', '#Comedy'].map((tag) => (
                  <b key={tag}>{tag}</b>
                ))}
              </div>
            </div>
            <Link className="spotlight-media" href="/events/blankets-and-wine-nairobi" aria-label="Open Blankets & Wine Nairobi event">
              <div className="featured-event">
                <span>This Saturday</span>
                <strong>Blankets & Wine Nairobi</strong>
                <em><MapPin size={14} /> Uhuru Gardens, Nairobi</em>
              </div>
            </Link>
            <div className="carousel-control">
              <ChevronLeft size={22} />
              <i />
              <i className="active" />
              <i />
              <i />
              <ChevronRight size={22} />
            </div>
          </section>

          <section className="events-panel">
            <div className="panel-heading">
              <h2>SEO Events: Discover & Explore</h2>
              <Link href="/search">View all events <ArrowRight size={15} /></Link>
            </div>
            <div className="event-strip">
              {events.map((event) => (
                <Link className="event-tile" href={`/events/${event.slug}`} key={event.title}>
                  <div className="event-poster" style={{ backgroundImage: `url(${event.image})` }}>
                    <strong>{event.title.replace(' Nairobi', '').replace(' 2025', '')}</strong>
                    <span>{event.tag}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p><MapPin size={14} /> {event.venue}</p>
                  <p>{event.date} - {event.time}</p>
                  <b>{event.price}</b>
                  <span className="event-open">View details <ArrowRight size={14} /></span>
                </Link>
              ))}
              <Link className="floating-next" href="/events/nairobi-comedy-night" aria-label="Open Nairobi Comedy Night"><ChevronRight size={22} /></Link>
            </div>
          </section>

          <section className="command-panel">
            <h2>Admin Command Center</h2>
            <div className="metric-strip">
              {metrics.map(([label, value, trend, Icon, tone]) => (
                <article className="metric-card" key={label as string}>
                  <span className={`metric-icon ${tone}`}><Icon size={22} /></span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                  <em>{trend}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="system-panel">
            <div>
              <h2>System Overview</h2>
              <span className="system-status"><ShieldCheck size={20} /> Platform Status <b>All Systems Operational</b></span>
            </div>
            <dl>
              <div><dt>Server Uptime</dt><dd>99.98%</dd></div>
              <div><dt>Avg. Response Time</dt><dd>320ms</dd></div>
              <div><dt>Active Users</dt><dd>2,847</dd></div>
              <div><dt>Live Events</dt><dd>23</dd></div>
            </dl>
            <Link href="/admin">View system health <ArrowRight size={16} /></Link>
          </section>
        </main>

        <aside className="dashboard-rail">
          <section className="rail-panel activity-panel">
            <div className="panel-heading">
              <h2>Realtime Activity</h2>
              <span className="live-dot">Live</span>
            </div>
            <div className="activity-list">
              {activity.map(([title, body, time, Icon, tone]) => (
                <Link className="activity-row" href={title === 'Event updated' ? '/events/koroga-festival-2025' : '/admin'} key={title as string}>
                  <span className={`activity-icon ${tone}`}><Icon size={20} /></span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                  <time>{time}</time>
                </Link>
              ))}
            </div>
            <Link className="rail-link" href="/admin">View all activity <ArrowRight size={16} /></Link>
          </section>

          <section className="rail-panel wallet-panel">
            <div className="panel-heading">
              <h2>Event-Day Wallet</h2>
              <span className="hide-control"><Eye size={15} /> Hide</span>
            </div>
            <p>Available Balance</p>
            <strong className="wallet-balance">KES 24,450.00</strong>
            <span>Tokea Wallet</span>
            <div className="wallet-actions">
              <Link href="/dashboard/attendee/top-up">Top Up <Plus size={20} /></Link>
              <Link href="/dashboard/organizer/withdrawals">Withdraw <ArrowRight size={16} /></Link>
            </div>
            <div className="transactions-head">
              <h3>Recent Transactions</h3>
              <Link href="/dashboard/attendee">View all</Link>
            </div>
            <div className="transactions">
              {transactions.map(([title, time, amount, tone]) => (
                <div className="transaction-row" key={title}>
                  <CreditCard size={17} />
                  <div>
                    <strong>{title}</strong>
                    <span>{time}</span>
                  </div>
                  <b className={tone}>{amount}</b>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
