import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Listing } from '../types';
import Sidebar from '../components/Sidebar';

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'archived'>('all');

  useEffect(() => {
    if (user) fetchListings();
  }, [user, statusFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data } = await query;
      setListings((data as Listing[]) || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    fetchListings();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити оголошення?')) return;
    await supabase.from('listings').delete().eq('id', id);
    fetchListings();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  const formatPrice = (p: number | null, f: boolean) => f ? 'Безкоштовно' : (p ? `${p.toLocaleString('uk-UA')} ₴` : '—');

  if (!user) { navigate('/login'); return null; }

  const statusBadge = (s: string) => {
    const cls = s === 'active' ? 'badge-green' : s === 'sold' ? 'badge-red' : 'badge-gray';
    const label = s === 'active' ? 'Активне' : s === 'sold' ? 'Продано' : 'Архів';
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Мої оголошення</h1>
          </div>
          <Link to="/listing/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Додати
          </Link>
        </div>

        <div style={styles.filters}>
          {(['all', 'active', 'sold', 'archived'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              ...styles.filterBtn,
              background: statusFilter === s ? '#1a1a1a' : 'transparent',
              color: statusFilter === s ? '#fff' : '#6b7280',
            }}>
              {s === 'all' ? 'Всі' : s === 'active' ? 'Активні' : s === 'sold' ? 'Продані' : 'Архів'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Немає оголошень</div>
            <Link to="/listing/new" className="btn btn-primary">Додати оголошення</Link>
          </div>
        ) : (
          <div style={styles.list}>
            {listings.map(l => (
              <div key={l.id} style={styles.item}>
                <div style={styles.itemImg}>
                  {l.images?.[0] ? <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#d1d5db' }}>📷</span>}
                </div>
                <div style={styles.itemContent}>
                  <div style={styles.itemTop}>
                    <Link to={`/listing/${l.id}`} style={styles.itemTitle}>{l.title}</Link>
                    {statusBadge(l.status)}
                  </div>
                  <p style={styles.itemPrice}>{formatPrice(l.price, l.is_free)}</p>
                  <p style={styles.itemMeta}>{l.location} • {formatDate(l.created_at)} • {l.views} переглядів</p>
                </div>
                <div style={styles.itemActions}>
                  <Link to={`/listing/${l.id}/edit`} className="btn btn-secondary btn-sm">Редагувати</Link>
                  {l.status === 'active' && <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(l.id, 'sold')}>Продано</button>}
                  {l.status === 'sold' && <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(l.id, 'active')}>Активувати</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(l.id)} style={{ color: '#dc2626' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  main: { flex: 1, padding: '24px 28px', maxWidth: 1200 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700 },
  filters: { display: 'flex', gap: 8, marginBottom: 20 },
  filterBtn: { padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 100ms' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { display: 'flex', gap: 16, padding: 16, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, flexWrap: 'wrap' },
  itemImg: { width: 100, height: 75, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, overflow: 'hidden' },
  itemContent: { flex: 1, minWidth: 200 },
  itemTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  itemTitle: { fontSize: 15, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' },
  itemPrice: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  itemMeta: { fontSize: 12, color: '#9ca3af', margin: 0 },
  itemActions: { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' },
};
