'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, CheckCircle2, Gift, Heart, Music2, Save, Settings, Sparkles, Ticket, Users, Wallet, UserRound } from 'lucide-react';

const interestOptions = ['Music', 'Gospel', 'Comedy', 'Food', 'Fashion', 'Festivals', 'Tech', 'Nightlife'];
const followedOrganizers = ['Blankets & Wine KE', 'Koroga Festival', 'Nairobi Comedy Club'];
const preferenceDefaults = {
  eventReminders: true,
  communityReplies: true,
  priceDrops: false,
  privateProfile: false,
};

export function AttendeeProfileExperience() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Tokea Demo Attendee',
    phone: '0700 000 002',
    location: 'Nairobi',
    bio: 'Music, food, city culture, and good plans with good people.',
  });
  const [interests, setInterests] = useState(['Music', 'Food', 'Comedy', 'Festivals']);
  const [preferences, setPreferences] = useState(preferenceDefaults);
  const [notice, setNotice] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((current) => current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]);
  };

  const togglePreference = (key: keyof typeof preferenceDefaults) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const saveProfile = () => {
    setEditing(false);
    setNotice('Profile preferences saved for this session.');
  };

  return (
    <div className="attendee-workspace">
      <header className="attendee-header">
        <div>
          <p className="section-kicker">Your profile</p>
          <h1>Make Tokea yours.</h1>
          <p>Choose the events, communities, and experiences you want more of.</p>
        </div>
        <Link href="/search" className="button">Explore events</Link>
      </header>

      {notice && <p className="wallet-action-notice" role="status"><CheckCircle2 size={16} />{notice}</p>}

      <section className="profile-overview upgraded">
        <div className="profile-avatar"><UserRound size={32} /></div>
        <div className="profile-main">
          <h2>{profile.name}</h2>
          <p>{profile.phone} - {profile.location}</p>
          <p className="profile-bio">{profile.bio}</p>
          <div className="profile-interest-strip">
            {interests.slice(0, 5).map((interest) => <span key={interest}>{interest}</span>)}
          </div>
        </div>
        <button type="button" className="button secondary" onClick={() => { setEditing((value) => !value); setNotice(''); }}>
          {editing ? 'Close editor' : 'Edit profile'}
        </button>
      </section>

      {editing && (
        <section className="profile-editor">
          <div className="profile-form-grid">
            <label>Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
            <label>Phone number<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
            <label>Location<input value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} /></label>
            <label className="wide">Bio<textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} /></label>
          </div>
          <div className="profile-editor-actions">
            <button type="button" className="button secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button type="button" className="button" onClick={saveProfile}><Save size={17} />Save profile</button>
          </div>
        </section>
      )}

      <div className="profile-stats">
        <article><strong>7</strong><span>Events attended</span></article>
        <article><strong>9</strong><span>Saved events</span></article>
        <article><strong>1,240</strong><span>Reward points</span></article>
        <article><strong>12</strong><span>Following</span></article>
      </div>

      <section className="profile-rewards upgraded">
        <Gift size={24} />
        <div>
          <span>TOKEA REWARDS</span>
          <h2>1,240 points available</h2>
          <p>Earn points when you attend, share, review, pre-order food, or book transport.</p>
        </div>
        <Link href="/dashboard/attendee/tickets" className="button secondary"><Wallet size={17} />View wallet</Link>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <div className="profile-card-head">
            <div><span>Discovery DNA</span><h2>Your interests</h2></div>
            <Sparkles size={22} />
          </div>
          <div className="interest-picker">
            {interestOptions.map((interest) => <button type="button" key={interest} className={interests.includes(interest) ? 'active' : ''} onClick={() => toggleInterest(interest)}>{interest}</button>)}
          </div>
        </article>

        <article className="profile-card">
          <div className="profile-card-head">
            <div><span>Notifications</span><h2>What reaches you</h2></div>
            <Bell size={22} />
          </div>
          <div className="settings-list">
            <button type="button" onClick={() => togglePreference('eventReminders')}><span>Event reminders</span><strong>{preferences.eventReminders ? 'On' : 'Off'}</strong></button>
            <button type="button" onClick={() => togglePreference('communityReplies')}><span>Community replies</span><strong>{preferences.communityReplies ? 'On' : 'Off'}</strong></button>
            <button type="button" onClick={() => togglePreference('priceDrops')}><span>Ticket price drops</span><strong>{preferences.priceDrops ? 'On' : 'Off'}</strong></button>
            <button type="button" onClick={() => togglePreference('privateProfile')}><span>Private profile</span><strong>{preferences.privateProfile ? 'On' : 'Off'}</strong></button>
          </div>
        </article>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <div className="profile-card-head">
            <div><span>Following</span><h2>Organizers you track</h2></div>
            <Users size={22} />
          </div>
          <div className="follow-list">
            {followedOrganizers.map((organizer) => <div key={organizer}><span><Music2 size={15} />{organizer}</span><button type="button" onClick={() => setNotice(`${organizer} updates will stay in your feed.`)}>Following</button></div>)}
          </div>
        </article>

        <article className="profile-card">
          <div className="profile-card-head">
            <div><span>Quick actions</span><h2>Keep discovering</h2></div>
            <Settings size={22} />
          </div>
          <div className="profile-actions">
            <Link href="/search"><Heart size={16} />Saved and trending events</Link>
            <Link href="/communities/blankets-and-wine-nairobi"><Users size={16} />Open event communities</Link>
            <Link href="/dashboard/attendee/tickets"><Ticket size={16} />Tickets and event-day passes</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
