import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Empty } from '../components/Empty';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IconTrash, IconImage, IconStar, IconFlag, IconCheck, IconUser, IconMessage, IconClose, IconSend } from '../components/Icons';

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ listings: 0, users: 0, conversations: 0, reviews: 0 });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Chats tab
  const [allConvs, setAllConvs] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [convReportedIds, setConvReportedIds] = useState(new Set());

  // Ban modal
  const [banModal, setBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [banDuration, setBanDuration] = useState('24h');
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';

  useEffect(() => {
    if (authLoading) return;
    if (!user) { nav('/login'); return; }
    if (profile && !isAdmin) { nav('/'); return; }
  }, [user, profile, isAdmin, nav, authLoading]);

  const loadStats = async () => {
    const [l, u, c, r] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      listings: l.count || 0,
      users: u.count || 0,
      conversations: c.count || 0,
      reviews: r.count || 0,
    });
  };

  const loadListings = async () => {
    setLoading(true);
    let q = supabase.from('listings').select('*, profiles(name,email)').order('created_at', { ascending: false }).limit(100);
    if (search) q = q.ilike('title', `%${search}%`);
    const { data } = await q;
    setListings(data || []);
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data } = await q;
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) loadStats(); }, [isAdmin]);
  useEffect(() => { if (isAdmin && tab === 'listings') loadListings(); }, [isAdmin, tab, search]);
  useEffect(() => { if (isAdmin && tab === 'users') loadUsers(); }, [isAdmin, tab, search]);
  useEffect(() => { if (isAdmin && tab === 'reports') loadReports(); }, [isAdmin, tab]);
  useEffect(() => { if (isAdmin && tab === 'reviews') loadReviews(); }, [isAdmin, tab]);
  useEffect(() => { if (isAdmin && tab === 'support') loadTickets(); }, [isAdmin, tab]);
  useEffect(() => { if (isAdmin && tab === 'chats') loadAllConvs(); }, [isAdmin, tab]);
  useEffect(() => {
    if (!activeTicket) return;
    loadTicketMessages(activeTicket.id);
    const iv = setInterval(() => loadTicketMessages(activeTicket.id), 4000);
    return () => clearInterval(iv);
  }, [activeTicket?.id]);
  useEffect(() => {
    if (!activeConv) return;
    loadConvMessages(activeConv.id);
  }, [activeConv?.id]);

  const deleteListing = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    await supabase.from('listings').delete().eq('id', id);
    loadListings(); loadStats();
  };

  const changeRole = async (uid, role) => {
    if (profile?.role !== 'admin') { alert('Only an admin can change roles'); return; }
    await supabase.from('profiles').update({ role }).eq('id', uid);
    loadUsers();
  };

  const setListingStatus = async (id, status) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    loadListings();
  };

  const loadReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, listing:listings(id, title, photos), reporter:profiles!reports_reporter_id_fkey(id, name, email), reported_user:profiles!reports_reported_user_id_fkey(id, name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100);
    setReports(data || []);
    setLoading(false);
  };

  const dismissReport = async (reportId) => {
    await supabase.from('reports').update({
      status: 'dismissed',
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', reportId);
    loadReports(); loadStats();
  };

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, seller:profiles!reviews_seller_id_fkey(id, name), reviewer:profiles!reviews_reviewer_id_fkey(id, name)')
      .order('created_at', { ascending: false })
      .limit(100);
    setReviews(data || []);
    setLoading(false);
  };

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*, user:profiles!support_tickets_user_id_fkey(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(100);
    setTickets(data || []);
    setLoading(false);
  };

  const loadTicketMessages = async (ticketId) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setTicketMessages(data || []);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !activeTicket || sendingReply) return;
    setSendingReply(true);
    await supabase.from('support_messages').insert({
      ticket_id: activeTicket.id,
      sender_id: user.id,
      is_mod: true,
      text: replyText.trim(),
    });
    setReplyText('');
    setSendingReply(false);
    loadTicketMessages(activeTicket.id);
  };

  const closeTicket = async (ticketId) => {
    await supabase.from('support_tickets').delete().eq('id', ticketId);
    if (activeTicket?.id === ticketId) setActiveTicket(null);
    loadTickets();
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    loadReviews(); loadStats();
  };

  const deleteReportedListing = async (listingId) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await supabase.from('listings').delete().eq('id', listingId);
    loadReports(); loadStats();
  };

  const loadAllConvs = async () => {
    setLoading(true);
    const [{ data: convs }, { data: reported }] = await Promise.all([
      supabase.from('conversations')
        .select('*, buyer:profiles!conversations_buyer_id_fkey(id,name,avatar_url,is_banned,banned_until), seller:profiles!conversations_seller_id_fkey(id,name,avatar_url,is_banned,banned_until), listing:listings(id,title)')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('reports')
        .select('conversation_id')
        .not('conversation_id', 'is', null)
        .eq('status', 'pending'),
    ]);
    const reportedSet = new Set((reported || []).map(r => r.conversation_id));
    const sorted = (convs || []).sort((a, b) => {
      const ar = reportedSet.has(a.id), br = reportedSet.has(b.id);
      if (ar !== br) return ar ? -1 : 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    setAllConvs(sorted);
    setConvReportedIds(reportedSet);
    setLoading(false);
    return sorted;
  };

  const loadConvMessages = async (convId) => {
    const { data } = await supabase.from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setConvMessages(data || []);
  };

  const openBanModal = (targetUser) => {
    setBanTarget(targetUser);
    setBanDuration('24h');
    setBanReason('');
    setBanModal(true);
  };

  const syncActiveConv = (updated) => {
    if (!activeConv) return;
    const fresh = (updated || []).find(c => c.id === activeConv.id);
    if (fresh) setActiveConv(fresh);
  };

  const banUser = async () => {
    if (!banTarget) return;
    setBanning(true);
    const durations = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
    const bannedUntil = banDuration === 'permanent' ? null : new Date(Date.now() + durations[banDuration]).toISOString();
    await supabase.from('profiles').update({
      is_banned: true,
      banned_until: bannedUntil,
      ban_reason: banReason.trim() || 'Violation of terms',
    }).eq('id', banTarget.id);
    setBanning(false);
    setBanModal(false);
    setBanTarget(null);
    if (tab === 'users') loadUsers();
    if (tab === 'chats') { const updated = await loadAllConvs(); syncActiveConv(updated); }
  };

  const unbanUser = async (uid) => {
    await supabase.from('profiles').update({ is_banned: false, banned_until: null, ban_reason: null }).eq('id', uid);
    if (tab === 'chats') { const updated = await loadAllConvs(); syncActiveConv(updated); }
    else loadUsers();
  };

  if (authLoading || (user && !profile)) return <Layout><div className="text-muted">Loading...</div></Layout>;
  if (!isAdmin) return <Layout><div className="text-muted">Access denied</div></Layout>;

  return (
    <Layout full>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Admin Panel</h1>
          <span style={{
            background: profile?.role === 'admin' ? 'var(--accent)' : '#d97706',
            color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
          }}>{profile?.role === 'admin' ? 'Admin' : 'Moderator'}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Platform management</p>

        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab==='overview'?'active':''}`} onClick={() => setTab('overview')}>Overview</button>
          <button className={`tab ${tab==='listings'?'active':''}`} onClick={() => setTab('listings')}>Listings</button>
          <button className={`tab ${tab==='users'?'active':''}`} onClick={() => setTab('users')}>Users</button>
          <button className={`tab ${tab==='reports'?'active':''}`} onClick={() => setTab('reports')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconFlag size={14}/> Reports
          </button>
          <button className={`tab ${tab==='reviews'?'active':''}`} onClick={() => setTab('reviews')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconStar size={14}/> Reviews
          </button>
          <button className={`tab ${tab==='support'?'active':''}`} onClick={() => { setTab('support'); setActiveTicket(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconMessage size={14}/> Support
          </button>
          <button className={`tab ${tab==='chats'?'active':''}`} onClick={() => { setTab('chats'); setActiveConv(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconUser size={14}/> All Chats
          </button>
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard label="Listings" value={stats.listings} accent/>
            <StatCard label="Users" value={stats.users}/>
            <StatCard label="Conversations" value={stats.conversations}/>
            <StatCard label="Reviews" value={stats.reviews}/>
          </div>
        )}

        {(tab === 'listings' || tab === 'users') && (
          <div style={{ marginBottom: 16 }}>
            <input className="input" placeholder={tab === 'listings' ? 'Search by title...' : 'Search by name or email...'}
              value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }}/>
          </div>
        )}

        {tab === 'listings' && (
          loading ? <div className="text-muted">Loading...</div> :
          listings.length === 0 ? <Empty title="No listings"/> : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>Photo</th>
                    <th style={th}>Title</th>
                    <th style={th}>Author</th>
                    <th style={th}>Price</th>
                    <th style={th}>Status</th>
                    <th style={th}>Date</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={td}>
                        <div style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                          {l.photos?.[0] ? <img src={l.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <IconImage size={20}/>}
                        </div>
                      </td>
                      <td style={td}>
                        <Link to={`/listing/${l.id}`} style={{ fontWeight: 500, color: 'var(--text)' }}>{l.title}</Link>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{l.location}</div>
                      </td>
                      <td style={td}>
                        <div>{l.profiles?.name || '—'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{l.profiles?.email}</div>
                      </td>
                      <td style={td}>
                        {l.is_free ? 'Free' : l.price ? `${Number(l.price).toLocaleString('en-US')}` : 'Negotiable'}
                      </td>
                      <td style={td}>
                        <select value={l.status} onChange={e => setListingStatus(l.id, e.target.value)}
                          className="select" style={{ height: 32, padding: '0 8px', fontSize: 12 }}>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td style={td}>{new Date(l.created_at).toLocaleDateString('en-US')}</td>
                      <td style={td}>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l.id)}>
                          <IconTrash size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'users' && (
          loading ? <div className="text-muted">Loading...</div> :
          users.length === 0 ? <Empty title="No users"/> : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>User</th>
                    <th style={th}>Email</th>
                    <th style={th}>Phone</th>
                    <th style={th}>Rating</th>
                    <th style={th}>Deals</th>
                    <th style={th}>Role</th>
                    <th style={th}>Joined</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: u.is_banned ? '#fff7ed' : undefined }}>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                            {u.avatar_url ? <img src={u.avatar_url}/> : (u.name?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <Link to={`/u/${u.id}`} style={{ fontWeight: 500 }}>{u.name}</Link>
                            {u.is_banned && (
                              <div style={{ fontSize: 11, color: '#b91c1c', fontWeight: 600 }}>
                                {u.banned_until ? `Banned until ${new Date(u.banned_until).toLocaleDateString('en-US')}` : 'Permanently banned'}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>{u.phone || '—'}</td>
                      <td style={td}>
                        {u.rating > 0 ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706' }}>
                            <IconStar size={12} fill/> {Number(u.rating).toFixed(1)}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={td}>{u.deals_count || 0}</td>
                      <td style={td}>
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                          disabled={profile?.role !== 'admin' || u.id === user?.id}
                          className="select" style={{ height: 32, padding: '0 8px', fontSize: 12, width: 130 }}>
                          <option value="user">user</option>
                          <option value="moderator">moderator</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={td}>{new Date(u.created_at).toLocaleDateString('en-US')}</td>
                      <td style={td}>
                        {u.id !== user?.id && (
                          u.is_banned ? (
                            <button className="btn btn-ghost btn-sm" onClick={() => unbanUser(u.id)} style={{ whiteSpace: 'nowrap' }}>
                              <IconCheck size={13}/> Unban
                            </button>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => openBanModal(u)} style={{ whiteSpace: 'nowrap' }}>
                              <IconFlag size={13}/> Ban
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
        {tab === 'reports' && (
          loading ? <div className="text-muted">Loading...</div> :
          reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <IconFlag size={40} style={{ opacity: 0.3, marginBottom: 12 }}/>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No pending reports</div>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>Type</th>
                    <th style={th}>Reporter</th>
                    <th style={th}>Reason</th>
                    <th style={th}>Date</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={td}>
                        {r.reported_user ? (
                          <div>
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 4, display: 'inline-block' }}>USER</span>
                            <div>
                              <Link to={`/u/${r.reported_user.id}`} style={{ fontWeight: 500, color: 'var(--text)', fontSize: 13 }}>{r.reported_user.name}</Link>
                            </div>
                          </div>
                        ) : r.listing ? (
                          <div>
                            <span style={{ background: '#fef9c3', color: '#713f12', padding: '1px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 4, display: 'inline-block' }}>LISTING</span>
                            <Link to={`/listing/${r.listing.id}`} target="_blank"
                              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontWeight: 500 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--bg-soft)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {r.listing.photos?.[0]
                                  ? <img src={r.listing.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                                  : <IconImage size={14}/>}
                              </div>
                              <span style={{ fontSize: 13 }}>{r.listing.title}</span>
                            </Link>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Deleted</span>}
                      </td>
                      <td style={td}>
                        <div>{r.reporter?.name || '—'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.reporter?.email}</div>
                      </td>
                      <td style={td}>
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                          {r.reason}
                        </span>
                      </td>
                      <td style={td}>{new Date(r.created_at).toLocaleDateString('en-US')}</td>
                      <td style={td}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn btn-ghost btn-sm" title="Dismiss"
                            onClick={() => dismissReport(r.id)}>
                            <IconCheck size={14}/> Dismiss
                          </button>
                          {r.listing && (
                            <button className="btn btn-danger btn-sm" title="Delete listing"
                              onClick={() => deleteReportedListing(r.listing.id)}>
                              <IconTrash size={14}/> Delete
                            </button>
                          )}
                          {r.reported_user && (
                            <button className="btn btn-danger btn-sm" onClick={() => openBanModal(r.reported_user)}>
                              <IconFlag size={14}/> Ban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'reviews' && (
          loading ? <div className="text-muted">Loading...</div> :
          reviews.length === 0 ? <Empty title="No reviews"/> : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>Reviewer</th>
                    <th style={th}>Seller</th>
                    <th style={th}>Rating</th>
                    <th style={th}>Comment</th>
                    <th style={th}>Date</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={td}>
                        <Link to={`/u/${r.reviewer?.id}`} style={{ fontWeight: 500, color: 'var(--text)' }}>
                          {r.reviewer?.name || '—'}
                        </Link>
                      </td>
                      <td style={td}>
                        <Link to={`/u/${r.seller?.id}`} style={{ color: 'var(--text)' }}>
                          {r.seller?.name || '—'}
                        </Link>
                      </td>
                      <td style={td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706' }}>
                          <IconStar size={13} fill/> {r.rating}/5
                        </span>
                      </td>
                      <td style={{ ...td, maxWidth: 260 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: r.comment ? 'var(--text)' : 'var(--text-faint)' }}>
                          {r.comment || '—'}
                        </div>
                      </td>
                      <td style={td}>{new Date(r.created_at).toLocaleDateString('en-US')}</td>
                      <td style={td}>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>
                          <IconTrash size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === 'support' && (
          loading ? <div className="text-muted">Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '280px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
              {/* Ticket list */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
                  Tickets ({tickets.length})
                </div>
                {tickets.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No support tickets</div>
                ) : (
                  tickets.map(t => (
                    <div key={t.id}
                      onClick={() => setActiveTicket(t)}
                      style={{
                        padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        background: activeTicket?.id === t.id ? 'var(--accent-soft)' : '#fff',
                        borderLeft: activeTicket?.id === t.id ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'background .1s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.user?.name || 'Unknown'}</div>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
                          background: t.status === 'open' ? '#dcfce7' : 'var(--bg-soft)',
                          color: t.status === 'open' ? '#16a34a' : 'var(--text-muted)',
                        }}>{t.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.user?.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {new Date(t.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat panel */}
              {activeTicket && (
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 520 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{activeTicket.user?.name || 'Unknown user'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activeTicket.user?.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {activeTicket.status === 'open' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => closeTicket(activeTicket.id)}>
                          <IconCheck size={14}/> Close
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setActiveTicket(null)}>
                        <IconClose size={14}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ticketMessages.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, margin: 'auto' }}>No messages yet</div>
                    )}
                    {ticketMessages.map(m => (
                      <div key={m.id} style={{
                        alignSelf: m.is_mod ? 'flex-end' : 'flex-start',
                        background: m.is_mod ? 'var(--accent)' : 'var(--bg-soft)',
                        color: m.is_mod ? '#fff' : 'var(--text)',
                        border: m.is_mod ? 'none' : '1px solid var(--border)',
                        borderRadius: 10, padding: '8px 12px',
                        fontSize: 13, maxWidth: '75%', lineHeight: 1.5,
                      }}>
                        {m.is_mod && <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 2, textTransform: 'uppercase' }}>You</div>}
                        {m.text}
                      </div>
                    ))}
                  </div>
                  {activeTicket.status === 'open' && (
                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                        placeholder="Reply to user..."
                        className="input"
                        style={{ flex: 1, height: 36, fontSize: 13 }}
                      />
                      <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={!replyText.trim() || sendingReply}>
                        <IconSend size={14}/>
                      </button>
                    </div>
                  )}
                  {activeTicket.status !== 'open' && (
                    <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
                      Ticket closed
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {tab === 'chats' && (
          loading ? <div className="text-muted">Loading...</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: activeConv ? '300px 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
              {/* Conversation list */}
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
                  Conversations ({allConvs.length})
                </div>
                {allConvs.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No conversations</div>
                ) : allConvs.map(c => {
                  const isReported = convReportedIds.has(c.id);
                  return (
                    <div key={c.id}
                      onClick={() => setActiveConv(c)}
                      style={{
                        padding: '11px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        background: activeConv?.id === c.id ? 'var(--accent-soft)' : isReported ? '#fff7ed' : '#fff',
                        borderLeft: isReported ? '3px solid #f97316' : '3px solid transparent',
                        transition: 'background .1s',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {c.buyer?.name || '?'} ↔ {c.seller?.name || '?'}
                        </div>
                        {isReported && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: 6, flexShrink: 0, marginLeft: 6 }}>REPORTED</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.listing?.title || 'No listing'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message viewer */}
              {activeConv && (
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 600 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: 12 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                        {activeConv.listing?.title || 'No listing'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {[{ role: 'Buyer', p: activeConv.buyer }, { role: 'Seller', p: activeConv.seller }].map(({ role, p }) => p && (
                          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-soft)', border: `1px solid ${p.is_banned ? '#fca5a5' : 'var(--border)'}`, borderRadius: 8, padding: '5px 10px' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden', flexShrink: 0 }}>
                              {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : (p.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1 }}>{role}</div>
                              <Link to={`/u/${p.id}`} target="_blank" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>{p.name || 'Unknown'}</Link>
                              {p.is_banned && <span style={{ marginLeft: 4, fontSize: 10, background: '#fee2e2', color: '#b91c1c', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>BANNED</span>}
                            </div>
                            {p.is_banned ? (
                              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => unbanUser(p.id)}>
                                <IconCheck size={11}/> Unban
                              </button>
                            ) : (
                              <button className="btn btn-danger btn-sm" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => openBanModal(p)}>
                                <IconFlag size={11}/> Ban
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, alignSelf: 'flex-start' }} onClick={() => setActiveConv(null)}>
                      <IconClose size={14}/>
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {convMessages.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: 13, margin: 'auto' }}>No messages</div>
                    )}
                    {convMessages.map(m => {
                      const isBuyer = m.sender_id === activeConv.buyer_id;
                      const senderName = isBuyer ? (activeConv.buyer?.name || 'Buyer') : (activeConv.seller?.name || 'Seller');
                      const timeStr = new Date(m.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                      if (m.is_system) {
                        return (
                          <div key={m.id} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', padding: '2px 0' }}>{m.text}</div>
                        );
                      }
                      return (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isBuyer ? 'flex-start' : 'flex-end' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 2 }}>{senderName} · {timeStr}</div>
                          <div style={{ background: isBuyer ? 'var(--bg-soft)' : 'var(--accent-soft)', border: `1px solid ${isBuyer ? 'var(--border)' : '#c8e0d4'}`, borderRadius: 10, padding: '7px 11px', fontSize: 13, maxWidth: '75%', lineHeight: 1.5 }}>
                            {m.image_url && <img src={m.image_url} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, display: 'block', marginBottom: m.text ? 6 : 0 }}/>}
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        )}

      </div>

      {/* Ban modal */}
      {banModal && banTarget && (
        <div onClick={() => setBanModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '28px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconFlag size={22} style={{ color: '#dc2626' }}/>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, textAlign: 'center' }}>Ban user</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Banning <strong>{banTarget.name}</strong>
            </p>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Duration</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[['1h','1 Hour'],['24h','24 Hours'],['7d','7 Days'],['30d','30 Days'],['permanent','Permanent']].map(([val, label]) => (
                  <button key={val} onClick={() => setBanDuration(val)}
                    style={{ padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${banDuration === val ? 'var(--accent)' : 'var(--border)'}`, background: banDuration === val ? 'var(--accent-soft)' : 'var(--bg-soft)', color: banDuration === val ? 'var(--accent)' : 'var(--text)', fontSize: 13, fontWeight: banDuration === val ? 600 : 400, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Reason</div>
              <input
                className="input"
                placeholder="Reason (optional)"
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setBanModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={banUser} disabled={banning} className="btn btn-danger" style={{ flex: 1, opacity: banning ? 0.7 : 1 }}>
                {banning ? 'Banning...' : 'Ban user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

const th ={ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' };
const td = { padding: '12px 14px', verticalAlign: 'middle' };

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--accent-soft)' : '#fff',
      border: '1px solid ' + (accent ? '#c8e0d4' : 'var(--border)'),
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6, color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}
