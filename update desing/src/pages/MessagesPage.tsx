import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Conversation, Message, Listing, Profile } from '../types';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [conversations, setConversations] = useState<(Conversation & { listing?: Listing; otherUser?: Profile })[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const listingId = searchParams.get('listing');
  const sellerId = searchParams.get('seller');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          listings:listing_id (*),
          buyer:buyer_id (id, name, avatar_url),
          seller:seller_id (id, name, avatar_url)
        `)
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const processed = data.map((conv: Record<string, unknown>) => ({
          ...conv,
          listing: conv.listings as Listing,
          otherUser: conv.buyer_id === user?.id ? conv.seller : conv.buyer,
        })) as (Conversation & { listing?: Listing; otherUser?: Profile })[];
        setConversations(processed);
      } else {
        // Demo data
        setConversations(getDemoConversations());
      }
    } catch (err) {
      setConversations(getDemoConversations());
    } finally {
      setLoading(false);
    }
  };

  const getDemoConversations = (): (Conversation & { listing?: Listing; otherUser?: Profile })[] => [
    {
      id: '1',
      listing_id: '1',
      buyer_id: '2',
      seller_id: '1',
      deal_status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      listing: {
        id: '1',
        title: 'iPhone 15 Pro Max',
        description: '',
        price: 55000,
        is_free: false,
        category_id: 'electronics',
        category_name: 'Техніка',
        location: 'Київ',
        user_id: '1',
        status: 'active',
        images: [],
        attributes: {},
        has_delivery: true,
        show_phone: true,
        views: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      otherUser: {
        id: '2',
        name: 'Марія',
        email: 'maria@example.com',
        rating: 4.5,
        deals_count: 12,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        role: 'user',
      },
    },
  ];

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    } else {
      // Demo messages
      setMessages([
        {
          id: '1',
          conversation_id: conversationId,
          sender_id: '2',
          content: 'Привіт! Товар ще в наявності?',
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          conversation_id: conversationId,
          sender_id: user?.id || '1',
          content: 'Так, є в наявності. Можливо забрати самовивезенням або доставкою.',
          is_read: true,
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ]);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Message }) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();
  };

  const handleStartConversation = async () => {
    if (!user || !listingId || !sellerId) return;

    setSending(true);
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .single();

      if (existing) {
        setSelectedConversation(existing.id);
      } else {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId,
          })
          .select('id')
          .single();

        if (!error && data) {
          setSelectedConversation(data.id);
          fetchConversations();
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (!error) {
        setNewMessage('');
        // Update conversation
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', selectedConversation);
      } else {
        // Demo mode - add message locally
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessage.trim(),
          is_read: false,
          created_at: new Date().toISOString(),
        }]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: 'sent' | 'completed') => {
    if (!selectedConversation) return;
    
    await supabase
      .from('conversations')
      .update({ deal_status: status })
      .eq('id', selectedConversation);
    
    fetchConversations();
  };

  if (!user) {
    return (
      <div className="container" style={styles.empty}>
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3 className="empty-state-title">Увійдіть в акаунт</h3>
          <p className="empty-state-text">Щоб переглядати повідомлення</p>
          <Link to="/login" className="btn btn-primary">Увійти</Link>
        </div>
      </div>
    );
  }

  const currentConversation = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="container" style={styles.page}>
      <h1 style={styles.title}>Повідомлення</h1>
      
      <div style={styles.layout}>
        {/* Conversations List */}
        <div style={styles.list}>
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">Немає повідомлень</h3>
              <p className="empty-state-text">Почніть спілкування з продавцями</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                style={{
                  ...styles.conversation,
                  backgroundColor: selectedConversation === conv.id ? 'var(--color-card)' : 'transparent',
                }}
              >
                <div style={styles.convAvatar}>
                  {conv.otherUser?.avatar_url ? (
                    <img src={conv.otherUser.avatar_url} alt="" />
                  ) : (
                    conv.otherUser?.name?.charAt(0) || '?'
                  )}
                </div>
                <div style={styles.convContent}>
                  <div style={styles.convHeader}>
                    <span style={styles.convName}>{conv.otherUser?.name || 'Користувач'}</span>
                    <span style={styles.convTime}>
                      {new Date(conv.updated_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={styles.convListing}>{conv.listing?.title}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat */}
        <div style={styles.chat}>
          {selectedConversation && currentConversation ? (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatUserInfo}>
                  <div style={styles.chatAvatar}>
                    {currentConversation.otherUser?.avatar_url ? (
                      <img src={currentConversation.otherUser.avatar_url} alt="" />
                    ) : (
                      currentConversation.otherUser?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <div style={styles.chatName}>{currentConversation.otherUser?.name}</div>
                    <Link 
                      to={`/listing/${currentConversation.listing_id}`}
                      style={styles.chatListing}
                    >
                      {currentConversation.listing?.title}
                    </Link>
                  </div>
                </div>
                <div style={styles.statusBadge}>
                  {currentConversation.deal_status === 'open' && 'Очікує'}
                  {currentConversation.deal_status === 'sent' && 'Відправлено'}
                  {currentConversation.deal_status === 'completed' && 'Завершено'}
                </div>
              </div>

              {/* Messages */}
              <div style={styles.messages}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.message,
                      alignSelf: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender_id === user?.id ? 'var(--color-accent)' : 'var(--color-card)',
                      color: msg.sender_id === user?.id ? 'white' : 'var(--color-text)',
                    }}
                  >
                    {msg.image_url && (
                      <img src={msg.image_url} alt="" style={styles.messageImage} />
                    )}
                    <p style={styles.messageText}>{msg.content}</p>
                    <span style={{
                      ...styles.messageTime,
                      color: msg.sender_id === user?.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                    }}>
                      {new Date(msg.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Deal Actions */}
              {currentConversation.deal_status !== 'completed' && (
                <div style={styles.dealActions}>
                  {currentConversation.seller_id === user?.id && currentConversation.deal_status === 'open' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusChange('sent')}
                    >
                      📦 Позначити як відправлено
                    </button>
                  )}
                  {currentConversation.buyer_id === user?.id && currentConversation.deal_status === 'sent' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusChange('completed')}
                    >
                      ✅ Підтвердити отримання
                    </button>
                  )}
                </div>
              )}

              {/* Input */}
              <div style={styles.inputArea}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Написати повідомлення..."
                  style={styles.input}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                >
                  Надіслати
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noChat}>
              <div className="empty-state-icon">💬</div>
              <p>Оберіть розмову</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 16px',
    minHeight: 'calc(100vh - 64px)',
  },
  empty: {
    padding: '80px 0',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '24px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
    height: 'calc(100vh - 160px)',
    minHeight: '500px',
  },
  list: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'auto',
    backgroundColor: 'var(--color-white)',
  },
  conversation: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  convAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 600,
    flexShrink: 0,
    overflow: 'hidden',
  },
  convContent: {
    flex: 1,
    minWidth: 0,
  },
  convHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  convName: {
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  convTime: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  convListing: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chat: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-white)',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid var(--color-border)',
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  chatAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    overflow: 'hidden',
  },
  chatName: {
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  chatListing: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
  },
  statusBadge: {
    padding: '4px 10px',
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  messages: {
    flex: 1,
    padding: '16px',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-lg)',
  },
  messageImage: {
    maxWidth: '200px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '8px',
  },
  messageText: {
    margin: 0,
    fontSize: '0.9375rem',
    lineHeight: 1.4,
  },
  messageTime: {
    fontSize: '0.625rem',
    marginTop: '4px',
    display: 'block',
  },
  dealActions: {
    padding: '12px 16px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    gap: '8px',
  },
  inputArea: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid var(--color-border)',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9375rem',
  },
  noChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  },
};
