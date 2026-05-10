import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Empty } from '../components/Empty';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IconTrash, IconImage, IconStar } from '../components/Icons';

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ listings: 0, users: 0, conversations: 0, reviews: 0 });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
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

  const deleteListing = async (id) => {
    if (!confirm('Точно видалити це оголошення?')) return;
    await supabase.from('listings').delete().eq('id', id);
    loadListings(); loadStats();
  };

  const changeRole = async (uid, role) => {
    if (profile?.role !== 'admin') { alert('Тільки адмін може міняти ролі'); return; }
    await supabase.from('profiles').update({ role }).eq('id', uid);
    loadUsers();
  };

  const setListingStatus = async (id, status) => {
    await supabase.from('listings').update({ status }).eq('id', id);
    loadListings();
  };

  if (authLoading || (user && !profile)) return <Layout><div className="text-muted">Завантаження...</div></Layout>;
  if (!isAdmin) return <Layout><div className="text-muted">Доступ заборонено</div></Layout>;

  return (
    <Layout full>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Адмін-панель</h1>
          <span style={{
            background: profile?.role === 'admin' ? 'var(--accent)' : '#d97706',
            color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
          }}>{profile?.role === 'admin' ? 'Admin' : 'Moderator'}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Керування платформою</p>

        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab ${tab==='overview'?'active':''}`} onClick={() => setTab('overview')}>Огляд</button>
          <button className={`tab ${tab==='listings'?'active':''}`} onClick={() => setTab('listings')}>Оголошення</button>
          <button className={`tab ${tab==='users'?'active':''}`} onClick={() => setTab('users')}>Користувачі</button>
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard label="Оголошень" value={stats.listings} accent/>
            <StatCard label="Користувачів" value={stats.users}/>
            <StatCard label="Розмов" value={stats.conversations}/>
            <StatCard label="Відгуків" value={stats.reviews}/>
          </div>
        )}

        {(tab === 'listings' || tab === 'users') && (
          <div style={{ marginBottom: 16 }}>
            <input className="input" placeholder={tab === 'listings' ? 'Пошук за назвою...' : 'Пошук за іменем або email...'}
              value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }}/>
          </div>
        )}

        {tab === 'listings' && (
          loading ? <div className="text-muted">Завантаження...</div> :
          listings.length === 0 ? <Empty title="Немає оголошень"/> : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>Фото</th>
                    <th style={th}>Назва</th>
                    <th style={th}>Автор</th>
                    <th style={th}>Ціна</th>
                    <th style={th}>Статус</th>
                    <th style={th}>Дата</th>
                    <th style={th}>Дії</th>
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
                        {l.is_free ? 'Безкоштовно' : l.price ? `${Number(l.price).toLocaleString('uk-UA')} грн` : 'Договірна'}
                      </td>
                      <td style={td}>
                        <select value={l.status} onChange={e => setListingStatus(l.id, e.target.value)}
                          className="select" style={{ height: 32, padding: '0 8px', fontSize: 12 }}>
                          <option value="active">Активне</option>
                          <option value="sold">Продано</option>
                          <option value="archived">Архів</option>
                        </select>
                      </td>
                      <td style={td}>{new Date(l.created_at).toLocaleDateString('uk-UA')}</td>
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
          loading ? <div className="text-muted">Завантаження...</div> :
          users.length === 0 ? <Empty title="Немає користувачів"/> : (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={th}>Користувач</th>
                    <th style={th}>Email</th>
                    <th style={th}>Телефон</th>
                    <th style={th}>Рейтинг</th>
                    <th style={th}>Угод</th>
                    <th style={th}>Роль</th>
                    <th style={th}>Реєстрація</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                            {u.avatar_url ? <img src={u.avatar_url}/> : (u.name?.[0] || 'U').toUpperCase()}
                          </div>
                          <Link to={`/u/${u.id}`} style={{ fontWeight: 500 }}>{u.name}</Link>
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
                      <td style={td}>{new Date(u.created_at).toLocaleDateString('uk-UA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}

const th = { padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' };
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
        {value.toLocaleString('uk-UA')}
      </div>
    </div>
  );
}
