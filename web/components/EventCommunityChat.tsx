'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Megaphone, MessageCircle, Send } from 'lucide-react';

const channels = ['General', 'Announcements', 'Questions', 'Photos', 'Networking', 'Transport', 'Food', 'Support'];

const seedMessages: Record<string, string[]> = {
  General: ['Who else is going with friends?', 'VIP entrance opens at 11:30 AM.'],
  Announcements: ['Organizer update: gates open at noon.', 'Remember to keep your ticket QR ready.'],
  Questions: ['Can I transfer my ticket to a friend?', 'Is there parking at the venue?'],
  Photos: ['Drop outfit inspo and poster screenshots here.'],
  Networking: ['Looking to meet founders and creators at the event.'],
  Transport: ['Anyone using Triplink from Westlands?'],
  Food: ['Foodo pre-orders should open before event day.'],
  Support: ['Use this channel for ticket and access help.'],
};

export function EventCommunityChat({ eventTitle }: { eventTitle: string }) {
  const [activeChannel, setActiveChannel] = useState('General');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(seedMessages);

  const activeMessages = useMemo(() => messages[activeChannel] ?? [], [activeChannel, messages]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => ({
      ...current,
      [activeChannel]: [`You: ${text}`, ...(current[activeChannel] ?? [])],
    }));
    setDraft('');
  }

  return (
    <section className="event-community" id="community">
      <div className="panel-heading">
        <div>
          <h2>{eventTitle} Community</h2>
          <p>Join the event chatrooms before, during, and after the event.</p>
        </div>
        <span className="live-dot">Live</span>
      </div>
      <div className="community-layout">
        <aside className="community-channels">
          {channels.map((channel) => (
            <button
              className={channel === activeChannel ? 'active' : undefined}
              key={channel}
              onClick={() => setActiveChannel(channel)}
              type="button"
            >
              {channel === 'Announcements' ? <Megaphone size={16} /> : <MessageCircle size={16} />}
              {channel}
            </button>
          ))}
        </aside>
        <div className="community-chat">
          <div className="chat-head">
            <strong>{activeChannel}</strong>
            <span>{activeMessages.length} posts</span>
          </div>
          <div className="chat-messages">
            {activeMessages.map((message, index) => (
              <article className={message.startsWith('You:') ? 'chat-message mine' : 'chat-message'} key={`${message}-${index}`}>
                <strong>{message.startsWith('You:') ? 'You' : index % 2 ? 'Organizer' : 'Tokea Member'}</strong>
                <p>{message.replace(/^You:\s*/, '')}</p>
              </article>
            ))}
          </div>
          <form className="chat-compose" onSubmit={submit}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Post in ${activeChannel}...`} />
            <button type="submit" aria-label="Send message"><Send size={17} /></button>
          </form>
        </div>
      </div>
    </section>
  );
}
