import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { IconStar, IconCalendar, IconLocation, IconSettings, IconPlus } from '../components/Icons';

export function MyProfile() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('active');
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav('/login'); return; }
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('user_id', user.id).eq('status', tab).order('created_at', { ascending: false });
      setListings(data || []);
    })();
  }, [user, tab, nav, loading]);

  if (!profile) return <Layout><div className="text-muted">Loading...</div></Layout>;

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
              <div className="label">Deals</div>
            </div>
            <div className="profile-stat">
              <div className="num">{Number(profile.rating || 0).toFixed(1)}</div>
              <div className="label">Rating</div>
            </div>
            <div className="profile-stat">
              <div className="num">{listings.length}</div>
              <div className="label">Listings</div>
            </div>
          </div>
        </div>
        <Link to="/settings" className="btn btn-ghost">
          <IconSettings size={16}/> Settings
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button className={`tab ${tab==='active'?'active':''}`} onClick={() => setTab('active')}>Active</button>
          <button className={`tab ${tab==='sold'?'active':''}`} onClick={() => setTab('sold')}>Sold</button>
          <button className={`tab ${tab==='archived'?'active':''}`} onClick={() => setTab('archived')}>Archived</button>
        </div>
        <Link to="/create" className="btn btn-primary"><IconPlus size={16}/> Add</Link>
      </div>

      {listings.length === 0 ? (
        <Empty 
          title={tab === 'active' ? "No active listings" : tab === 'sold' ? "No sold listings" : "Archive is empty"}
          text={tab === 'active' ? "Create a new listing to see it here" : tab === 'sold' ? "Your sold items will appear here" : "Move listings to archive"}
        />
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

  if (!profile) return <Layout><div className="text-muted">Loading...</div></Layout>;

  const isBannedNow = profile.is_banned && (!profile.banned_until || new Date(profile.banned_until) > new Date());

  return (
    <Layout>
      {isBannedNow && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🚫</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#b91c1c' }}>Account suspended</div>
            <div style={{ fontSize: 13, color: '#7f1d1d', marginTop: 2 }}>
              {profile.banned_until
                ? `This account has been suspended until ${new Date(profile.banned_until).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'This account has been permanently suspended by moderation'}
            </div>
          </div>
        </div>
      )}
      <div className="profile-header">
        <div className="avatar avatar-lg" style={{ opacity: isBannedNow ? 0.5 : 1 }}>
          {profile.avatar_url ? <img src={profile.avatar_url} alt=""/> : (profile.name?.[0] || 'U').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{profile.name}</div>
            {isBannedNow && <span style={{ fontSize: 12, fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '2px 10px', borderRadius: 20, border: '1px solid #fca5a5' }}>SUSPENDED</span>}
          </div>
          <div className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {profile.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconLocation size={12}/> {profile.city}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCalendar size={12}/> Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          {profile.bio && <div style={{ marginTop: 8 }}>{profile.bio}</div>}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="num">{profile.deals_count || 0}</div>
              <div className="label">Deals</div>
            </div>
            <div className="profile-stat">
              <div className="num" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconStar size={18} fill className="rating"/> {Number(profile.rating || 0).toFixed(1)}
              </div>
              <div className="label">Rating</div>
            </div>
            <div className="profile-stat">
              <div className="num">{listings.length}</div>
              <div className="label">Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='listings'?'active':''}`} onClick={() => setTab('listings')}>Listings ({listings.length})</button>
        <button className={`tab ${tab==='reviews'?'active':''}`} onClick={() => setTab('reviews')}>Reviews ({reviews.length})</button>
      </div>

      {tab === 'listings' ? (
        listings.length === 0 ? <Empty title="No active listings"/> : (
          <div className="listings-grid">
            {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
          </div>
        )
      ) : (
        reviews.length === 0 ? <Empty title="No reviews yet"/> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                    {r.reviewer?.avatar_url ? <img src={r.reviewer.avatar_url}/> : (r.reviewer?.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.reviewer?.name}</div>
                    <div className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('en-US')}</div>
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
