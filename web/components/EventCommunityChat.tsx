'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Flag, Heart, Image as ImageIcon, Megaphone, MessageCircle, Pin, Reply, Send, Users } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type CommunityPost = { id: string; author: string; initials: string; time: string; body: string; likes: number; comments: string[]; pinned?: boolean; mediaUrls?: string[] };

const channels = [
  ['General', MessageCircle, 82], ['Announcements', Megaphone, 4], ['Questions', MessageCircle, 18], ['Photos', ImageIcon, 26],
  ['Networking', Users, 41], ['Transport', MessageCircle, 12], ['Food', MessageCircle, 9], ['Support', MessageCircle, 6],
] as const;

const seedPosts: Record<string, CommunityPost[]> = {
  General: [{ id: 'general-1', author: 'Tokea Community', initials: 'TC', time: '12 min ago', body: 'Who is coming with friends? Use this space to find your people before the gates open.', likes: 24, comments: ['I am bringing my cousins.'], pinned: true }, { id: 'general-2', author: 'Aisha N.', initials: 'AN', time: '38 min ago', body: 'First time at Blankets & Wine. What should I not miss?', likes: 9, comments: ['Arrive early for a good lawn spot.', 'The food village is always worth it.'] }],
  Announcements: [{ id: 'announcements-1', author: 'Blankets & Wine Team', initials: 'BW', time: '25 min ago', body: 'Gates open at noon. Keep your ticket QR ready and check your wallet for event-day updates.', likes: 86, comments: [], pinned: true }],
  Questions: [{ id: 'questions-1', author: 'Brian K.', initials: 'BK', time: '1 hr ago', body: 'Is parking available at the venue?', likes: 4, comments: ['Yes. Follow the venue directions in Event-Day mode.'] }],
  Photos: [{ id: 'photos-1', author: 'Wanjiku M.', initials: 'WM', time: '2 hrs ago', body: 'Drop your outfit inspiration, favourite past moments, and poster sightings here.', likes: 17, comments: [] }],
  Networking: [{ id: 'networking-1', author: 'Kevin O.', initials: 'KO', time: '1 hr ago', body: 'Looking to meet founders and creators at the event. Say hi if you are building something.', likes: 21, comments: ['Count me in.'] }],
  Transport: [{ id: 'transport-1', author: 'Nadia A.', initials: 'NA', time: '46 min ago', body: 'Anyone using Triplink from Westlands? I would like to coordinate pickup.', likes: 6, comments: ['The route details will appear in your wallet once booked.'] }],
  Food: [{ id: 'food-1', author: 'Foodo Team', initials: 'FT', time: '2 hrs ago', body: 'Food pre-orders will open before event day. Your collection QR will appear with your ticket.', likes: 31, comments: [] }],
  Support: [{ id: 'support-1', author: 'Tokea Support', initials: 'TS', time: '35 min ago', body: 'Need help with an order, ticket, or transfer? Post the details here and our team will respond.', likes: 11, comments: [] }],
};

export function EventCommunityChat({ eventTitle }: { eventTitle: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [activeChannel, setActiveChannel] = useState('General');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState(seedPosts);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState<string[]>([]);
  const [joined, setJoined] = useState(false);
  const [notice, setNotice] = useState('');
  const [attachments, setAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const activePosts = useMemo(() => posts[activeChannel] ?? [], [activeChannel, posts]);

  function selectPhotos(files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'));
    if (selected.length === 0) {
      setNotice('Choose one or more photo files to attach.');
      return;
    }
    setAttachments(selected.slice(0, 8).map((file) => ({ file, previewUrl: URL.createObjectURL(file) })));
    if (activeChannel !== 'Photos') setActiveChannel('Photos');
    setNotice('Photos added. Add a caption and publish them to the event conversation.');
  }

  function removeAttachment(previewUrl: string) {
    setAttachments((current) => current.filter((item) => item.previewUrl !== previewUrl));
  }

  function safeFileName(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event-photo';
    return `${baseName}.${extension}`;
  }

  async function uploadPhotos() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error('Please login before posting event photos.');

    const uploaded: string[] = [];
    for (const [index, item] of attachments.entries()) {
      const path = `${userId}/post-event/${Date.now()}-${index}-${safeFileName(item.file)}`;
      const { error } = await supabase.storage.from('community-media').upload(path, item.file, {
        cacheControl: '3600',
        contentType: item.file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('community-media').getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    return uploaded;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text && attachments.length === 0) return;

    setUploading(true);
    setNotice('');
    try {
      const mediaUrls = attachments.length > 0 ? await uploadPhotos() : [];
      const postChannel = mediaUrls.length > 0 ? 'Photos' : activeChannel;
      setPosts((current) => ({
        ...current,
        [postChannel]: [
          { id: `${postChannel}-${Date.now()}`, author: 'You', initials: 'YO', time: 'Just now', body: text || 'Shared event photos.', likes: 0, comments: [], mediaUrls },
          ...(current[postChannel] ?? []),
        ],
      }));
      setActiveChannel(postChannel);
      setDraft('');
      setAttachments([]);
      setNotice(mediaUrls.length > 0 ? 'Photos posted to the event community.' : '');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to post photos. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function toggleLike(id: string) { setLiked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }
  function addReply(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const body = reply.trim();
    if (!body) return;
    setPosts((current) => ({ ...current, [activeChannel]: (current[activeChannel] ?? []).map((post) => post.id === postId ? { ...post, comments: [...post.comments, body] } : post) }));
    setReply(''); setReplyingTo(null);
  }

  return (
    <section className="community-workspace" id="community">
      <header className="community-hero"><div><div className="community-title-row"><span className="community-mark"><Users size={20} /></span><p>Event community</p></div><h1>{eventTitle} Community</h1><p>Meet people, get event updates, plan your day, and keep the good conversations going.</p></div><button className={joined ? 'button secondary' : 'button'} onClick={() => setJoined((value) => !value)} type="button">{joined ? 'Joined community' : 'Join community'}</button></header>
      <div className="community-layout community-workspace-layout">
        <aside className="community-channels">
          <div className="community-channel-heading"><strong>Channels</strong><span>{joined ? 'Joined' : 'Public'}</span></div>
          {channels.map(([channel, Icon, count]) => (
            <button
              className={channel === activeChannel ? 'active' : undefined}
              key={channel}
              onClick={() => { setActiveChannel(channel); setReplyingTo(null); }}
              type="button"
            >
              <Icon size={16} /><span>{channel}</span><small>{count}</small>
            </button>
          ))}
        </aside>
        <div className="community-feed">
          <div className="community-feed-head"><div><h2>{activeChannel}</h2><p>{activeChannel === 'Announcements' ? 'Updates from the organizer and Tokea.' : `Talk with people going to ${eventTitle}.`}</p></div><span className="live-dot">Live</span></div>
          <form className="community-composer photo-composer" onSubmit={(event) => void submit(event)}>
            <span className="post-avatar mine">YO</span>
            <div className="community-composer-main">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={activeChannel === 'Photos' ? `Share photos and memories from ${eventTitle}...` : `Start a conversation in ${activeChannel}...`} />
              {attachments.length > 0 && (
                <div className="composer-photo-preview">
                  {attachments.map((item) => (
                    <button key={item.previewUrl} type="button" onClick={() => removeAttachment(item.previewUrl)} aria-label="Remove photo" style={{ backgroundImage: `url(${item.previewUrl})` }} />
                  ))}
                </div>
              )}
            </div>
            <label className="attach-photo-button" aria-label="Attach event photos">
              <ImageIcon size={17} />
              <input type="file" accept="image/*" multiple onChange={(event) => selectPhotos(event.target.files)} />
            </label>
            <button type="submit" aria-label="Publish post" disabled={uploading}><Send size={17} /></button>
          </form>
          <div className="community-posts">{activePosts.map((post) => {
            const isLiked = liked.includes(post.id);
            return <article className="community-post" key={post.id}><div className="post-avatar">{post.initials}</div><div className="community-post-content"><div className="post-author"><strong>{post.author}</strong><span>{post.time}</span>{post.pinned && <em><Pin size={12} /> Pinned</em>}</div><p>{post.body}</p>{post.mediaUrls && post.mediaUrls.length > 0 && <div className={`post-photo-grid count-${Math.min(post.mediaUrls.length, 4)}`}>{post.mediaUrls.map((url) => <button key={url} type="button" style={{ backgroundImage: `url(${url})` }} aria-label="Open shared event photo" />)}</div>}<div className="post-actions"><button className={isLiked ? 'active' : undefined} onClick={() => toggleLike(post.id)} type="button"><Heart size={15} fill={isLiked ? 'currentColor' : 'none'} /> {post.likes + (isLiked ? 1 : 0)}</button><button onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)} type="button"><Reply size={15} /> Reply {post.comments.length ? `(${post.comments.length})` : ''}</button><button onClick={() => setNotice('Thanks. The post has been queued for review.')} type="button"><Flag size={14} /> Report</button></div>{post.comments.length > 0 && <div className="post-comments">{post.comments.map((comment, index) => <p key={`${post.id}-${index}`}><strong>Community member</strong>{comment}</p>)}</div>}{replyingTo === post.id && <form className="reply-compose" onSubmit={(event) => addReply(event, post.id)}><input autoFocus value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." /><button type="submit">Reply</button></form>}</div></article>;
          })}</div>
          {notice && <p className="community-notice" role="status">{notice}</p>}
        </div>
      </div>
    </section>
  );
}
