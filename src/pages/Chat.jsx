import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IconSend, IconImage } from '../components/Icons';

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 8,
  borderRadius: 6, color: '#5d6d7e', display: 'flex', alignItems: 'center',
  justifyContent: 'center', transition: 'background 0.15s',
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    [[880, 0, 0.12], [1100, 0.1, 0.25]].forEach(([freq, start, end]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      osc.connect(gain);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + end);
    });

    setTimeout(() => ctx.close(), 600);
  } catch (_) {}
}

function StatusTicks({ isRead }) {
  const color = isRead ? '#3b82f6' : 'rgba(255,255,255,0.65)';
  if (!isRead) {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 5L9 9L17 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DayDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 10px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', background: 'var(--bg-card)', padding: '0 6px', borderRadius: 8 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
    </div>
  );
}

function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Сьогодні';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчора';
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Chat() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c');

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [fullImage, setFullImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMsgAt, setLastMsgAt] = useState({});

  const [activeListing, setActiveListing] = useState(null);
  const [soldModal, setSoldModal] = useState(false);
  const [reviewPanel, setReviewPanel] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  const [mobileView, setMobileView] = useState(() => window.innerWidth <= 640 ? (params.get('c') ? 'chat' : 'list') : 'list');

  const messagesEnd = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLength = useRef(0);
  const justSentRef = useRef(false);
  const activeRef = useRef(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (checked && !user) nav('/login'); }, [user, checked, nav]);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase.from('conversations')
      .select('*, listing:listings(id,title,photos,price,status,buyer_id,user_id,is_free), buyer:profiles!conversations_buyer_id_fkey(id,name,avatar_url), seller:profiles!conversations_seller_id_fkey(id,name,avatar_url)')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    const filtered = (data || []).filter(c => !(c.hidden_for || []).includes(user.id));
    setConversations(filtered);

    const ids = filtered.map(c => c.id);
    if (ids.length) {
      const { data: unread } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', user.id)
        .in('conversation_id', ids);
      const counts = {};
      (unread || []).forEach(m => { counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1; });
      setUnreadCounts(prev => {
        const next = { ...counts };
        Object.keys(prev).forEach(id => { if (prev[id] === 0) next[id] = 0; });
        return next;
      });

      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('conversation_id, created_at')
        .in('conversation_id', ids)
        .order('created_at', { ascending: false });
      const atMap = {};
      (lastMsgs || []).forEach(m => { if (!atMap[m.conversation_id]) atMap[m.conversation_id] = m.created_at; });
      setLastMsgAt(atMap);
    }

    return filtered;
  };

  useEffect(() => {
    (async () => {
      const filtered = await loadConversations();
      if (activeId && filtered) {
        const found = filtered.find(c => c.id === activeId);
        if (found) setActive(found);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user || !conversations.length) return;
    const ids = conversations.map(c => c.id);

    const ch = supabase.channel('inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const { conversation_id, sender_id, created_at } = payload.new;
        if (!ids.includes(conversation_id)) return;

        setLastMsgAt(prev => ({ ...prev, [conversation_id]: created_at }));

        if (sender_id !== user.id) {
          playNotificationSound();
          if (conversation_id !== activeRef.current?.id) {
            setUnreadCounts(prev => ({ ...prev, [conversation_id]: (prev[conversation_id] || 0) + 1 }));
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, conversations]);

  useEffect(() => {
    if (!activeId || !conversations.length) return;
    const found = conversations.find(c => c.id === activeId);
    if (found && active?.id !== activeId) setActive(found);
    setUnreadCounts(prev => ({ ...prev, [activeId]: 0 }));
  }, [activeId, conversations]);

  const openChat = (c) => {
    setActive(c);
    setParams({ c: c.id });
    setUnreadCounts(prev => ({ ...prev, [c.id]: 0 }));
    if (isMobile) setMobileView('chat');
  };

  useEffect(() => {
    if (!active) return;
    (async () => {
      const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').eq('conversation_id', active.id).order('created_at');
        setMessages(data || []);
      };
      await fetchMessages();
      if (user) {
        await supabase.from('messages').update({ is_read: true }).eq('conversation_id', active.id).neq('sender_id', user.id);
        setUnreadCounts(prev => ({ ...prev, [active.id]: 0 }));
        await fetchMessages();
      }
    })();

    const ch = supabase.channel(`chat:${active.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active.id}` },
        async (payload) => {
          setMessages(m => [...m, payload.new]);
          if (payload.new.sender_id !== user?.id) {
            await supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id);
            setUnreadCounts(prev => ({ ...prev, [active.id]: 0 }));
          }
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active.id}` },
        (payload) => {
          setMessages(m => m.map(msg => msg.id === payload.new.id ? payload.new : msg));
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active, user]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const forceScroll = justSentRef.current;
      justSentRef.current = false;
      const container = messagesContainerRef.current;
      const nearBottom = !container || container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (prevMessagesLength.current === 0 || nearBottom || forceScroll) {
        messagesEnd.current?.scrollIntoView({ behavior: prevMessagesLength.current === 0 ? 'auto' : 'smooth' });
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => { prevMessagesLength.current = 0; }, [active?.id]);

  useEffect(() => {
    if (!active?.listing?.id) { setActiveListing(null); setReviewPanel(false); setReviewDone(false); return; }
    setReviewRating(0); setReviewComment(''); setReviewDone(false);
    (async () => {
      const { data: l } = await supabase.from('listings').select('*').eq('id', active.listing.id).maybeSingle();
      setActiveListing(l);
      if (l?.status === 'sold' && l?.buyer_id === user?.id) {
        const { data: rev } = await supabase.from('reviews')
          .select('id').eq('listing_id', l.id).eq('reviewer_id', user.id).maybeSingle();
        setReviewPanel(!rev);
      } else {
        setReviewPanel(false);
      }
    })();
  }, [active?.id, user?.id]);

  const isSeller = active && user?.id === active.seller_id;
  const isBuyer = active && user?.id === active.buyer_id;

  const confirmSold = async () => {
    if (!active || !activeListing) return;
    setSoldModal(false);
    const update = { status: 'sold', buyer_id: active.buyer_id };
    await supabase.from('listings').update(update).eq('id', activeListing.id);
    setActiveListing(prev => ({ ...prev, ...update }));
    const { data: sp } = await supabase.from('profiles').select('deals_count').eq('id', active.seller_id).maybeSingle();
    await supabase.from('profiles').update({ deals_count: (sp?.deals_count || 0) + 1 }).eq('id', active.seller_id);
  };

  const submitReview = async () => {
    if (!reviewRating || !active || !user) return;
    setSubmittingReview(true);
    await supabase.from('reviews').insert({
      seller_id: active.seller_id,
      reviewer_id: user.id,
      listing_id: active.listing.id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });
    const { data: allRev } = await supabase.from('reviews').select('rating').eq('seller_id', active.seller_id);
    if (allRev?.length) {
      const avg = allRev.reduce((s, r) => s + r.rating, 0) / allRev.length;
      await supabase.from('profiles').update({ rating: parseFloat(avg.toFixed(2)) }).eq('id', active.seller_id);
    }
    setSubmittingReview(false);
    setReviewPanel(false);
    setReviewDone(true);
  };

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    const t = text; setText('');
    justSentRef.current = true;
    await supabase.from('messages').insert({ conversation_id: active.id, sender_id: user.id, text: t });
  };

  const sendImage = async (file) => {
    if (!active || !user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('chat-media').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
      justSentRef.current = true;
      await supabase.from('messages').insert({ conversation_id: active.id, sender_id: user.id, image_url: data.publicUrl });
    }
  };

  const togglePin = async () => {
    if (!active || !user) return;
    const pinnedBy = active.pinned_by || [];
    const isPinned = pinnedBy.includes(user.id);
    const next = isPinned ? pinnedBy.filter(id => id !== user.id) : [...pinnedBy, user.id];
    await supabase.from('conversations').update({ pinned_by: next }).eq('id', active.id);
    setActive({ ...active, pinned_by: next });
    loadConversations();
  };

  const deleteChat = async () => {
    if (!active || !user) return;
    const next = [...(active.hidden_for || []), user.id];
    await supabase.from('conversations').update({ hidden_for: next }).eq('id', active.id);
    setShowDeleteModal(false);
    setActive(null);
    setParams({});
    loadConversations();
    if (isMobile) setMobileView('list');
  };

  const otherUser = (c) => c.buyer_id === user?.id ? c.seller : c.buyer;
  const isPinned = active && user && (active.pinned_by || []).includes(user.id);

  const sortedConversations = [...conversations].sort((a, b) => {
    const ap = (a.pinned_by || []).includes(user?.id);
    const bp = (b.pinned_by || []).includes(user?.id);
    if (ap !== bp) return ap ? -1 : 1;
    const at = lastMsgAt[a.id] || a.created_at;
    const bt = lastMsgAt[b.id] || b.created_at;
    return new Date(bt) - new Date(at);
  });

  return (
    <Layout>
      <div className="chat-outer" style={{ display: 'flex', height: 'calc(100vh - 88px - 48px)', gap: 16 }}>

        {(!isMobile || mobileView === 'list') && (
        <div style={{ width: isMobile ? '100%' : 320, borderRadius: isMobile ? 0 : 'var(--radius-lg)', border: isMobile ? 'none' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Повідомлення</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sortedConversations.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Немає розмов</div>
            )}
            {sortedConversations.map(c => {
              const pinned = user && (c.pinned_by || []).includes(user.id);
              const isActive = active?.id === c.id;
              const unread = unreadCounts[c.id] || 0;
              return (
                <div key={c.id}
                  onClick={() => openChat(c)}
                  style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', background: isActive ? 'var(--accent-soft)' : 'transparent', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--bg-soft)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {otherUser(c)?.avatar_url
                        ? <img src={otherUser(c).avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        : (otherUser(c)?.name?.[0] || '?').toUpperCase()}
                    </div>
                    {unread > 0 && (
                      <div style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid var(--bg-card)', lineHeight: 1 }}>
                        {unread > 99 ? '99+' : unread}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {otherUser(c)?.name || 'Інкогніто'}
                      </span>
                      {pinned && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" style={{ flexShrink: 0 }}>
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: unread > 0 ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, fontWeight: unread > 0 ? 500 : 400 }}>
                      {c.listing?.title || '—'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {(!isMobile || mobileView === 'chat') && (
        <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: isMobile ? 'none' : '1px solid var(--border)', borderRadius: isMobile ? 0 : 'var(--radius-lg)', overflow: 'hidden' }}>
          {active ? (
            <>
              <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isMobile && (
                    <button onClick={() => setMobileView('list')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 4px 4px 0', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                  )}
                  <div
                    onClick={() => otherUser(active)?.id && nav(`/u/${otherUser(active).id}`)}
                    style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--bg-soft)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 17, color: 'var(--text-muted)', cursor: 'pointer', border: '1px solid var(--border)' }}
                  >
                    {otherUser(active)?.avatar_url
                      ? <img src={otherUser(active).avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : (otherUser(active)?.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      onClick={() => otherUser(active)?.id && nav(`/u/${otherUser(active).id}`)}
                      style={{ fontWeight: 700, fontSize: 15, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {otherUser(active)?.name || 'Інкогніто'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Обговорення товару</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button title={isPinned ? 'Відкріпити' : 'Закріпити'} onClick={togglePin}
                      style={{ ...iconBtnStyle, color: isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                    </button>
                    <button title="Видалити чат" onClick={() => setShowDeleteModal(true)}
                      style={iconBtnStyle}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                  onClick={() => nav(`/listing/${active.listing?.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {active.listing?.photos?.[0] && (
                    <img src={active.listing.photos[0]} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}/>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.listing?.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: activeListing?.status === 'sold' ? 'var(--text-muted)' : 'var(--accent)', marginTop: 1 }}>
                      {activeListing?.is_free ? 'Безкоштовно' : active.listing?.price ? `${Number(active.listing.price).toLocaleString('uk-UA')} грн` : ''}
                    </div>
                  </div>
                  {activeListing?.status === 'sold' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#fdf2f1', color: 'var(--danger)', border: '1px solid #f5d4d0', padding: '3px 8px', borderRadius: 8, flexShrink: 0 }}>
                      ПРОДАНО
                    </span>
                  ) : isSeller && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSoldModal(true); }}
                      style={{ fontSize: 12, fontWeight: 600, background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid #bbf7d0', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      ✓ Продано
                    </button>
                  )}
                </div>
              </div>

              <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column' }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    Почніть обговорення!
                  </div>
                )}

                {messages.map((m, i) => {
                  const isMe = m.sender_id === user?.id;
                  const dayLabel = getDayLabel(m.created_at);
                  const prevLabel = i > 0 ? getDayLabel(messages[i - 1].created_at) : null;
                  const showDivider = dayLabel !== prevLabel;
                  const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={m.id}>
                      {showDivider && <DayDivider label={dayLabel}/>}
                      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
                        <div style={{
                          maxWidth: '65%', minWidth: 72,
                          background: isMe ? 'var(--accent)' : 'var(--bg-soft)',
                          color: isMe ? '#fff' : 'var(--text)',
                          padding: '8px 10px 6px 12px',
                          borderRadius: 16,
                          borderBottomRightRadius: isMe ? 3 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 3,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          display: 'flex', flexDirection: 'column', gap: 2,
                        }}>
                          {m.image_url && (
                            <img src={m.image_url} onClick={() => setFullImage(m.image_url)}
                              style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 10, display: 'block', cursor: 'zoom-in', objectFit: 'cover' }}/>
                          )}
                          {m.text && (
                            <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {m.text}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 1 }}>
                            <span style={{ fontSize: 11, opacity: isMe ? 0.8 : 0.55, lineHeight: 1, whiteSpace: 'nowrap' }}>
                              {timeStr}
                            </span>
                            {isMe && <StatusTicks isRead={m.is_read}/>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEnd}/>
              </div>

              {reviewPanel && !reviewDone && (
                <div style={{ borderTop: '1px solid #bbf7d0', background: '#f0fdf4', padding: '12px 20px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', flex: 1, minWidth: 120 }}>Оцініть продавця</div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(i => (
                        <button key={i} type="button"
                          onClick={() => setReviewRating(i)}
                          onMouseEnter={() => setReviewHover(i)}
                          onMouseLeave={() => setReviewHover(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: i <= (reviewHover || reviewRating) ? '#d97706' : '#d1d5db', transition: 'color .1s, transform .1s', transform: reviewHover === i ? 'scale(1.2)' : 'scale(1)' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                    {reviewRating > 0 && (
                      <>
                        <input
                          style={{ flex: 2, minWidth: 120, border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 13, background: '#fff', outline: 'none' }}
                          placeholder="Коментар (необов'язково)"
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          maxLength={300}
                        />
                        <button onClick={submitReview} disabled={submittingReview}
                          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                          {submittingReview ? '...' : 'Надіслати'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              {reviewDone && (
                <div style={{ borderTop: '1px solid #bbf7d0', background: '#f0fdf4', padding: '10px 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Відгук надіслано. Дякуємо!</span>
                  <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= reviewRating ? '#d97706' : '#d1d5db'}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-soft)', borderRadius: 24, padding: '4px 4px 4px 12px', border: '1px solid var(--border)' }}>
                  <label style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }} title="Надіслати фото">
                    <IconImage size={20}/>
                    <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && sendImage(e.target.files[0])}/>
                  </label>
                  <input
                    style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', outline: 'none', fontSize: 14, minWidth: 0 }}
                    placeholder="Напишіть повідомлення..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  />
                  <button onClick={send} disabled={!text.trim()}
                    style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: text.trim() ? 'var(--accent)' : 'var(--border)', color: text.trim() ? '#fff' : 'var(--text-muted)', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}>
                    <IconSend size={18}/>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 44, opacity: 0.25 }}>💬</div>
              <p style={{ fontSize: 15, margin: 0 }}>Виберіть чат для спілкування</p>
            </div>
          )}
        </div>
        )}
      </div>

      {fullImage && (
        <div onClick={() => setFullImage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={fullImage} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}/>
        </div>
      )}

      {soldModal && (
        <div onClick={() => setSoldModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 380, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>Підтвердити продаж?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Покупець <strong>{active?.buyer?.name || 'Покупець'}</strong> отримає запит на відгук.
              Статус оголошення зміниться на «Продано».
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSoldModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Скасувати</button>
              <button onClick={confirmSold} className="btn btn-primary" style={{ flex: 1 }}>Підтвердити</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>Видалити чат?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              Чат буде видалено лише у вас. Якщо вам надішлють нове повідомлення — чат відновиться.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Скасувати</button>
              <button onClick={deleteChat} className="btn btn-danger" style={{ flex: 1 }}>Видалити</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
