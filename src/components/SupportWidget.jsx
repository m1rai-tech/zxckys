import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { IconMessage, IconClose, IconSend } from './Icons';

const FAQ = [
  { q: 'How do I post a listing?', a: 'Click "Post Ad" in the header. Fill in the title, category, price, and location, add some photos, and hit "Post Listing". You\'re live instantly — no approval needed.' },
  { q: 'How do I contact a seller?', a: 'Open any listing and click "Message Seller". It opens a private chat. If the seller shows their phone number, you\'ll also see a call button.' },
  { q: 'How does payment work?', a: 'Payments are handled directly between buyer and seller — we don\'t process money. Meet in a public place, inspect the item, and pay however works for you both.' },
  { q: 'How do I report a listing?', a: 'On any listing, scroll to the action buttons and click "Report listing". Pick a reason and submit. The listing disappears from your feed while our team reviews it.' },
  { q: 'How does boosting work?', a: 'Open your listing and click "Boost to top". Boosted listings appear at the top of search and category pages. Plans: 7 days ($2.99) or 30 days ($7.99).' },
  { q: 'I think I was scammed', a: 'Report the listing immediately using the "Report listing" button, then contact moderation below. Include as many details as possible — screenshots help a lot.' },
];

const playSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
};

export function SupportWidget() {
  const { user } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('faq');
  const [selected, setSelected] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [unread, setUnread] = useState(0);
  const prevIdsRef = useRef(new Set());
  const bottomRef = useRef(null);
  const hidden = loc.pathname === '/settings' && window.matchMedia('(max-width: 640px)').matches;

  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // poll every 4 seconds for new moderator replies while the chat is open
  useEffect(() => {
    if (mode !== 'chat' || !ticketId) return;
    const load = async () => {
      const { data } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    load();
    const iv = setInterval(load, 4000);
    return () => clearInterval(iv);
  }, [mode, ticketId]);

  // play a sound and show a badge when the moderator sends a new message
  useEffect(() => {
    if (messages.length === 0) return;
    const newModMsgs = messages.filter(m => m.is_mod && !prevIdsRef.current.has(m.id));
    if (newModMsgs.length > 0) {
      playSound();
      if (!open) setUnread(u => u + newModMsgs.length);
    }
    prevIdsRef.current = new Set(messages.map(m => m.id));
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiMessages, aiTyping, mode]);

  // reuse the existing open ticket if the user already has one, otherwise create a new one
  const startChat = async () => {
    if (!user) return;
    setLoadingChat(true);
    const { data: existing } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle();
    if (existing) {
      setTicketId(existing.id);
    } else {
      const { data } = await supabase
        .from('support_tickets')
        .insert({ user_id: user.id })
        .select()
        .single();
      if (data) setTicketId(data.id);
    }
    setLoadingChat(false);
    setMode('chat');
  };

  const send = async () => {
    if (!text.trim() || !ticketId || !user || sending) return;
    setSending(true);
    await supabase.from('support_messages').insert({
      ticket_id: ticketId,
      sender_id: user.id,
      is_mod: false,
      text: text.trim(),
    });
    setText('');
    setSending(false);
  };

  const sendAi = async () => {
    const q = aiInput.trim();
    if (!q || aiTyping) return;
    const updated = [...aiMessages, { role: 'user', content: q }];
    setAiMessages(updated);
    setAiInput('');
    setAiTyping(true);
    try {
      const res = await fetch('/api/ai-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Something went wrong, try again.' }]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong, try again.' }]);
    }
    setAiTyping(false);
  };

  const contactBtn = (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button onClick={() => { setMode('ai'); setSelected(null); }} style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        background: 'var(--accent)', border: 'none',
        color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
      }}>
        Ask AI — instant reply ✦
      </button>
      {user ? (
        <button onClick={startChat} disabled={loadingChat} style={{
          width: '100%', padding: '10px 14px', borderRadius: 8,
          background: 'var(--accent-soft)', border: '1.5px solid var(--accent)',
          color: 'var(--accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>
          {loadingChat ? 'Opening chat...' : 'Contact moderation →'}
        </button>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</a> to contact moderation
        </p>
      )}
    </div>
  );

  return (
    <>
      {open && (
        <div className="support-panel" style={{
          position: 'fixed', right: 24, zIndex: 200,
          width: 340, maxHeight: 520,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px', background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Support 24/7</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {mode === 'chat' ? 'Chat with moderation' : mode === 'ai' ? 'AI Support · instant reply' : 'How can we help?'}
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <IconClose size={18}/>
            </button>
          </div>

          {mode === 'faq' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
              {selected === null ? (
                <>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, marginTop: 0 }}>
                    Pick a topic or contact a moderator directly.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FAQ.map((item, i) => (
                      <button key={i} onClick={() => setSelected(i)} style={{
                        textAlign: 'left', width: '100%', padding: '10px 12px',
                        background: 'var(--bg-soft)', border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: 13, cursor: 'pointer', lineHeight: 1.4,
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {item.q}
                      </button>
                    ))}
                  </div>
                  {contactBtn}
                </>
              ) : (
                <>
                  <button onClick={() => setSelected(null)} style={{
                    background: 'none', border: 'none', color: 'var(--accent)',
                    fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4,
                  }}>← Back</button>
                  <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{FAQ[selected].q}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{FAQ[selected].a}</div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>Still need help?</p>
                  {contactBtn}
                </>
              )}
            </div>
          )}

          {mode === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  alignSelf: 'flex-start', background: 'var(--bg-soft)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '8px 12px', fontSize: 13, maxWidth: '85%', lineHeight: 1.5,
                }}>
                  Hi! A moderator will get back to you shortly. Describe your issue and we'll help.
                </div>
                {messages.map(m => (
                  <div key={m.id} style={{
                    alignSelf: m.is_mod ? 'flex-start' : 'flex-end',
                    background: m.is_mod ? 'var(--bg-soft)' : 'var(--accent)',
                    color: m.is_mod ? 'var(--text)' : '#fff',
                    border: m.is_mod ? '1px solid var(--border)' : 'none',
                    borderRadius: 10, padding: '8px 12px',
                    fontSize: 13, maxWidth: '85%', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word',
                  }}>
                    {m.is_mod && (
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Moderator
                      </div>
                    )}
                    {m.text}
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>
              <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1, height: 36, border: '1px solid var(--border)', borderRadius: 8,
                    padding: '0 10px', fontSize: 13, outline: 'none', background: 'var(--bg-soft)',
                  }}
                />
                <button onClick={send} disabled={!text.trim() || sending} style={{
                  width: 36, height: 36, borderRadius: 8, background: 'var(--accent)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  opacity: (!text.trim() || sending) ? 0.5 : 1,
                }}>
                  <IconSend size={15}/>
                </button>
              </div>
              <div style={{ padding: '6px 12px 10px', flexShrink: 0 }}>
                <button onClick={() => { setMode('faq'); setSelected(null); }} style={{
                  background: 'none', border: 'none', color: 'var(--text-faint)',
                  fontSize: 12, cursor: 'pointer', padding: 0,
                }}>← Back to FAQ</button>
              </div>
            </>
          )}

          {mode === 'ai' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  alignSelf: 'flex-start', background: 'var(--bg-soft)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '8px 12px', fontSize: 13, maxWidth: '85%', lineHeight: 1.5,
                }}>
                  Hey! Ask me anything about the site — I'll reply right away.
                </div>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-soft)',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                    borderRadius: 10, padding: '8px 12px',
                    fontSize: 13, maxWidth: '85%', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {m.content}
                  </div>
                ))}
                {aiTyping && (
                  <div style={{
                    alignSelf: 'flex-start', background: 'var(--bg-soft)',
                    border: '1px solid var(--border)', borderRadius: 10,
                    padding: '8px 14px', fontSize: 18, color: 'var(--text-muted)',
                    letterSpacing: 2,
                  }}>
                    •••
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>
              <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAi()}
                  placeholder="Ask a question..."
                  style={{
                    flex: 1, height: 36, border: '1px solid var(--border)', borderRadius: 8,
                    padding: '0 10px', fontSize: 13, outline: 'none', background: 'var(--bg-soft)',
                  }}
                />
                <button onClick={sendAi} disabled={!aiInput.trim() || aiTyping} style={{
                  width: 36, height: 36, borderRadius: 8, background: 'var(--accent)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  opacity: (!aiInput.trim() || aiTyping) ? 0.5 : 1,
                }}>
                  <IconSend size={15}/>
                </button>
              </div>
              <div style={{ padding: '6px 12px 10px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => { setMode('faq'); setSelected(null); }} style={{
                  background: 'none', border: 'none', color: 'var(--text-faint)',
                  fontSize: 12, cursor: 'pointer', padding: 0,
                }}>← Back to FAQ</button>
                {user && (
                  <button onClick={startChat} style={{
                    background: 'none', border: 'none', color: 'var(--accent)',
                    fontSize: 12, cursor: 'pointer', padding: 0,
                  }}>Talk to a person →</button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="support-btn" style={{ position: 'fixed', right: 24, zIndex: 200, opacity: (!open && hidden) ? 0 : 1, pointerEvents: (!open && hidden) ? 'none' : 'auto', transition: 'opacity .25s, bottom .25s' }}>
        {unread > 0 && !open && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff',
            width: 20, height: 20, borderRadius: '50%',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff', zIndex: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          title="Support 24/7"
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {open ? <IconClose size={20}/> : <IconMessage size={20}/>}
        </button>
      </div>
    </>
  );
}
