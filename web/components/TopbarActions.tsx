'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, CalendarDays, Check, Mail, Send, Wallet, X } from 'lucide-react';

type Panel = 'notifications' | 'messages' | null;

const initialNotifications = [
  { id: 1, title: 'New ticket sale', body: 'Early Bird - Blankets & Wine Nairobi', time: '12s ago', unread: true },
  { id: 2, title: 'Event updated', body: 'Koroga Festival 2025 changed stage time', time: '2m ago', unread: true },
  { id: 3, title: 'Payout processed', body: 'KES 48,750 sent to Melanin Events', time: '3m ago', unread: true },
];

const initialMessages = [
  { id: 1, sender: 'Nairobi Comedy Club', body: 'Can we boost Friday tickets?', time: '1m ago', unread: true },
  { id: 2, sender: 'Melanin Events', body: 'Vendor access list has been updated.', time: '8m ago', unread: true },
  { id: 3, sender: 'James Mwangi', body: 'Please confirm my VIP table request.', time: '17m ago', unread: false },
];

export function TopbarActions() {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const unreadNotifications = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);
  const unreadMessages = useMemo(() => messages.filter((item) => item.unread).length, [messages]);

  function toggle(panel: Exclude<Panel, null>) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => [
      { id: Date.now(), sender: 'You', body: text, time: 'now', unread: false },
      ...current,
    ]);
    setDraft('');
  }

  return (
    <div className="top-actions">
      <Link href="/dashboard/organizer" className="create-button">
        <CalendarDays size={17} />
        Create Event
      </Link>
      <span className="top-divider" />
      <div className="action-popover-wrap">
        <button
          className={`icon-button ${unreadNotifications ? 'alert-dot' : ''}`}
          aria-label="Notifications"
          aria-expanded={activePanel === 'notifications'}
          onClick={() => toggle('notifications')}
          type="button"
        >
          <Bell size={20} />
          {unreadNotifications ? <b>{unreadNotifications}</b> : null}
        </button>
        {activePanel === 'notifications' ? (
          <div className="action-popover" role="dialog" aria-label="Notifications">
            <div className="popover-head">
              <div>
                <strong>Notifications</strong>
                <span>{unreadNotifications} unread</span>
              </div>
              <button type="button" onClick={() => setActivePanel(null)} aria-label="Close notifications">
                <X size={16} />
              </button>
            </div>
            <div className="popover-list">
              {notifications.map((item) => (
                <button
                  type="button"
                  className={item.unread ? 'popover-row unread' : 'popover-row'}
                  key={item.id}
                  onClick={() => setNotifications((current) => current.map((row) => (row.id === item.id ? { ...row, unread: false } : row)))}
                >
                  <span />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                  <time>{item.time}</time>
                </button>
              ))}
            </div>
            <button className="popover-action" type="button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, unread: false })))}>
              <Check size={15} />
              Mark all as read
            </button>
          </div>
        ) : null}
      </div>
      <div className="action-popover-wrap">
        <button
          className={`icon-button ${unreadMessages ? 'alert-dot' : ''}`}
          aria-label="Messages"
          aria-expanded={activePanel === 'messages'}
          onClick={() => toggle('messages')}
          type="button"
        >
          <Mail size={20} />
          {unreadMessages ? <b>{unreadMessages}</b> : null}
        </button>
        {activePanel === 'messages' ? (
          <div className="action-popover message-popover" role="dialog" aria-label="Messages">
            <div className="popover-head">
              <div>
                <strong>Messages</strong>
                <span>{unreadMessages} unread</span>
              </div>
              <button type="button" onClick={() => setActivePanel(null)} aria-label="Close messages">
                <X size={16} />
              </button>
            </div>
            <div className="popover-list">
              {messages.map((item) => (
                <button
                  type="button"
                  className={item.unread ? 'popover-row unread' : 'popover-row'}
                  key={item.id}
                  onClick={() => setMessages((current) => current.map((row) => (row.id === item.id ? { ...row, unread: false } : row)))}
                >
                  <span />
                  <div>
                    <strong>{item.sender}</strong>
                    <p>{item.body}</p>
                  </div>
                  <time>{item.time}</time>
                </button>
              ))}
            </div>
            <div className="message-compose">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply or start a message..." />
              <button type="button" onClick={sendMessage} aria-label="Send message">
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className="wallet-chip">
        <div>
          <strong>KES 24,450.00</strong>
          <span>Event-Day Wallet</span>
        </div>
        <Wallet size={20} />
      </div>
    </div>
  );
}
