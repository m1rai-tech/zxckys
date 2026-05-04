import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Empty } from '../components/Empty';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IconSend, IconImage, IconMessage, IconStar, IconCheck } from '../components/Icons';

export default function Chat() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeId = params.get('c');
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!user) nav('/login'); }, [user, nav]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('conversations')
        .select('*, listing:listings(id,title,photos), buyer:profiles!conversations_buyer_id_fkey(id,name,avatar_url), seller:profiles!conversations_seller_id_fkey(id,name,avatar_url)')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      setConversations(data || []);
      if (activeId) {
        const found = (data || []).find((c: any) => c.id === activeId);
        if (found) setActive(found);
      }
    })();
  }, [user, activeId]);

  // Load messages + realtime
  useEffect(() => {
    if (!active) return;
    (async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', active.id).order('created_at');
      setMessages(data || []);
    })();
    const ch = supabase.channel(`conv:${active.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active.id}` },
        (payload) => setMessages(m => [...m, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !active || !user) return;
    const t = text; setText('');
    await supabase.from('messages').insert({ conversation_id: active.id, sender_id: user.id, text: t });
  };

  const sendImage = async (file: File) => {
    if (!active || !user) return;
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g,'_')}`;
    const { error } = await supabase.storage.from('chat-media').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
      await supabase.from('messages').insert({ conversation_id: active.id, sender_id: user.id, image_url: data.publicUrl });
    }
  };

  const otherUser = (c: any) => c.buyer_id === user?.id ? c.seller : c.buyer;

  const updateDealStatus = async (status: string) => {
    if (!active) return;
    await supabase.from('conversations').update({ deal_status: status }).eq('id', active.id);
    setActive({ ...active, deal_status: status });
  };

  const submitReview = async () => {
    if (!active || !user) return;
    await supabase.from('reviews').insert({
      conversation_id: active.id,
      reviewer_id: user.id,
      seller_id: active.seller_id,
      rating, comment: reviewText,
    });
    await updateDealStatus('completed');
    setShowReview(false);
  };

  const isSeller = active && user?.id === active.seller_id;
  const isBuyer = active && user?.id === active.buyer_id;

  return (
    <Layout full>
      <div className="chat-layout">
        <div className="conv-list">
          {conversations.length === 0 ? (
            <div style={{ padding: 24 }}>
              <Empty icon={<IconMessage size={40}/>} title="Немає розмов" text="Почніть діалог з продавцем"/>
            </div>
          ) : conversations.map(c => {
            const o = otherUser(c);
            return (
              <div key={c.id} className={`conv-item ${active?.id === c.id?'active':''}`}
                onClick={() => { setActive(c); setParams({ c: c.id }); }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {o?.avatar_url ? <img src={o.avatar_url}/> : (o?.name?.[0] || 'U').toUpperCase()}
                </div>
                <div className="conv-info">
                  <div className="conv-name">{o?.name || 'Користувач'}</div>
                  <div className="conv-preview">{c.listing?.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="chat-window">
          {!active ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Empty icon={<IconMessage size={48}/>} title="Виберіть розмову" text="Оберіть діалог зліва"/>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {(otherUser(active)?.name?.[0] || 'U').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{otherUser(active)?.name}</div>
                  <div className="text-xs text-muted">{active.listing?.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {active.deal_status === 'open' && isSeller && (
                    <button className="btn btn-ghost btn-sm" onClick={() => updateDealStatus('shipped')}>Позначити як відправлено</button>
                  )}
                  {active.deal_status === 'shipped' && isBuyer && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowReview(true)}>
                      <IconCheck size={14}/> Підтвердити отримання
                    </button>
                  )}
                  {active.deal_status === 'completed' && (
                    <span className="tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>Угоду завершено</span>
                  )}
                </div>
              </div>

              <div className="messages">
                {messages.map((m: any) => (
                  <div key={m.id} className={`message ${m.sender_id === user?.id?'out':'in'}`}>
                    {m.image_url && <img src={m.image_url} alt=""/>}
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEnd}/>
              </div>

              {showReview ? (
                <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Залиште відгук</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(i => (
                      <button key={i} onClick={() => setRating(i)} style={{ color: i <= rating ? '#d97706' : '#d4d4d8' }}>
                        <IconStar size={28} fill={i <= rating}/>
                      </button>
                    ))}
                  </div>
                  <textarea className="textarea" placeholder="Ваш коментар..." value={reviewText} onChange={e => setReviewText(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary" onClick={submitReview}>Надіслати відгук</button>
                    <button className="btn btn-ghost" onClick={() => setShowReview(false)}>Скасувати</button>
                  </div>
                </div>
              ) : (
                <div className="chat-input">
                  <label className="icon-btn" title="Фото">
                    <IconImage size={20}/>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => e.target.files?.[0] && sendImage(e.target.files[0])}/>
                  </label>
                  <input value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Напишіть повідомлення..."/>
                  <button className="btn btn-primary" onClick={send}><IconSend size={18}/></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
