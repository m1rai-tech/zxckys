import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { IconStar, IconCalendar, IconLocation, IconSettings, IconPlus } from '../components/Icons';

export function MyProfile() {
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('active');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('user_id', user.id).eq('status', tab).order('created_at', { ascending: false });
      setListings(data || []);
    })();
  }, [user, tab, nav]);

  if (!profile) return <Layout><div className="text-muted">Завантаження...</div></Layout>;

  return (
    <Layout>
      <div className="profile-header">
        <div className="avatar avatar-lg">
          {profile.avatar_url ? <img src={profile.avatar_url} alt=""/> : (profile.name?.[0] || 'U').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{profile.name}</div>
          <div className="text-muted text-sm">{profile.email}</div>
          {profile.bio && <div style={{ marginTop: 8 }}>{profile.bio}</div>}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="num">{profile.deals_count || 0}</div>
              <div className="label">Угод</div>
            </div>
            <div className="profile-stat">
              <div className="num">{Number(profile.rating || 0).toFixed(1)}</div>
              <div className="label">Рейтинг</div>
            </div>
            <div className="profile-stat">
              <div className="num">{listings.length}</div>
              <div className="label">Оголошень</div>
            </div>
          </div>
        </div>
        <Link to="/settings" className="btn btn-ghost">
          <IconSettings size={16}/> Налаштування
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button className={`tab ${tab==='active'?'active':''}`} onClick={() => setTab('active')}>Активні</button>
          <button className={`tab ${tab==='sold'?'active':''}`} onClick={() => setTab('sold')}>Продані</button>
          <button className={`tab ${tab==='archived'?'active':''}`} onClick={() => setTab('archived')}>Архів</button>
        </div>
        <Link to="/create" className="btn btn-primary"><IconPlus size={16}/> Додати</Link>
      </div>

      {listings.length === 0 ? (
        <Empty title="Архів порожній" text="Перемістіть оголошення в архів"/>
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}

export function SellerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('listings');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setProfile(data);
      const { data: l } = await supabase.from('listings').select('*').eq('user_id', id).eq('status', 'active').order('created_at', { ascending: false });
      setListings(l || []);
      const { data: r } = await supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(name,avatar_url)').eq('seller_id', id).order('created_at', { ascending: false });
      setReviews(r || []);
    })();
  }, [id]);

  if (!profile) return <Layout><div className="text-muted">Завантаження...</div></Layout>;

  return (
    <Layout>
      <div className="profile-header">
        <div className="avatar avatar-lg">
          {profile.avatar_url ? <img src={profile.avatar_url} alt=""/> : (profile.name?.[0] || 'U').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{profile.name}</div>
          <div className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {profile.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconLocation size={12}/> {profile.city}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCalendar size={12}/> На сайті з {new Date(profile.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}</span>
          </div>
          {profile.bio && <div style={{ marginTop: 8 }}>{profile.bio}</div>}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="num">{profile.deals_count || 0}</div>
              <div className="label">Угод</div>
            </div>
            <div className="profile-stat">
              <div className="num" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconStar size={18} fill className="rating"/> {Number(profile.rating || 0).toFixed(1)}
              </div>
              <div className="label">Рейтинг</div>
            </div>
            <div className="profile-stat">
              <div className="num">{listings.length}</div>
              <div className="label">Активних</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='listings'?'active':''}`} onClick={() => setTab('listings')}>Оголошення ({listings.length})</button>
        <button className={`tab ${tab==='reviews'?'active':''}`} onClick={() => setTab('reviews')}>Відгуки ({reviews.length})</button>
      </div>

      {tab === 'listings' ? (
        listings.length === 0 ? <Empty title="Немає активних оголошень"/> : (
          <div className="listings-grid">
            {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
          </div>
        )
      ) : (
        reviews.length === 0 ? <Empty title="Поки немає відгуків"/> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                    {r.reviewer?.avatar_url ? <img src={r.reviewer.avatar_url}/> : (r.reviewer?.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.reviewer?.name}</div>
                    <div className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('uk-UA')}</div>
                  </div>
                  <div className="rating" style={{ marginLeft: 'auto', display: 'flex' }}>
                    {[1,2,3,4,5].map(i => <IconStar key={i} size={16} fill={i <= r.rating}/>)}
                  </div>
                </div>
                {r.comment && <div>{r.comment}</div>}
              </div>
            ))}
          </div>
        )
      )}
    </Layout>
  );
}
