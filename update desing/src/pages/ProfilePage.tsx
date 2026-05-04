import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile, Listing, Review } from '../types';
import ListingCard from '../components/ListingCard';
import Sidebar from '../components/Sidebar';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchProfile(userId);
  }, [userId]);

  const fetchProfile = async (id: string) => {
    setLoading(true);
    try {
      const { data: pd, error: pe } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (!pe && pd) setProfile(pd as Profile);
      else setProfile({ id, name: 'Користувач', email: '', rating: 0, deals_count: 0, created_at: '', updated_at: '', role: 'user' });

      const { data: ld } = await supabase.from('listings').select('*').eq('user_id', id).eq('status', 'active').order('created_at', { ascending: false });
      setListings((ld as Listing[]) || []);

      const { data: rd } = await supabase.from('reviews').select('*').eq('seller_id', id).order('created_at', { ascending: false });
      setReviews((rd as Review[]) || []);
    } catch {
      setProfile({ id: id || '', name: 'Користувач', email: '', rating: 0, deals_count: 0, created_at: '', updated_at: '', role: 'user' });
    } finally { setLoading(false); }
  };

  const renderStars = (r: number) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < r ? '#f59e0b' : '#e5e5e5' }}>★</span>
  ));

  const formatDate = (d: string) => new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return <div className="container" style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>;
  if (!profile) return <div className="container" style={{ padding: '60px 0' }}><div className="empty-state"><div className="empty-state-title">Не знайдено</div><Link to="/" className="btn btn-primary">На головну</Link></div></div>;

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {profile.avatar_url ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : profile.name[0]}
          </div>
          <div style={styles.info}>
            <h1 style={styles.name}>{profile.name}</h1>
            <div style={styles.rating}>
              {renderStars(Math.round(profile.rating))}
              <span style={styles.ratingText}>{profile.rating.toFixed(1)} ({profile.deals_count} угод)</span>
            </div>
            {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
            <p style={styles.since}>На сайті з {formatDate(profile.created_at)}</p>
          </div>
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setActiveTab('listings')} style={{ ...styles.tab, borderBottomColor: activeTab === 'listings' ? '#2d6a4f' : 'transparent', color: activeTab === 'listings' ? '#2d6a4f' : '#9ca3af' }}>
            Оголошення ({listings.length})
          </button>
          <button onClick={() => setActiveTab('reviews')} style={{ ...styles.tab, borderBottomColor: activeTab === 'reviews' ? '#2d6a4f' : 'transparent', color: activeTab === 'reviews' ? '#2d6a4f' : '#9ca3af' }}>
            Відгуки ({reviews.length})
          </button>
        </div>

        {activeTab === 'listings' ? (
          listings.length === 0 ? <div className="empty-state"><div className="empty-state-title">Немає оголошень</div></div> :
          <div style={styles.grid}>{listings.map(l => <ListingCard key={l.id} listing={l} />)}</div>
        ) : (
          reviews.length === 0 ? <div className="empty-state"><div className="empty-state-title">Немає відгуків</div></div> :
          <div style={styles.reviews}>
            {reviews.map(r => (
              <div key={r.id} style={styles.review}>
                <div style={styles.reviewHeader}>
                  <div style={styles.reviewerAvatar}>{r.reviewer?.name?.[0] || '?'}</div>
                  <div>
                    <div style={styles.reviewerName}>{r.reviewer?.name || 'Анонім'}</div>
                    <div style={{ fontSize: 14 }}>{renderStars(r.rating)}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>{formatDate(r.created_at)}</span>
                </div>
                <p style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
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
  main: { flex: 1, padding: '24px 28px', maxWidth: 1000 },
  header: { display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, overflow: 'hidden', flexShrink: 0 },
  info: { flex: 1 },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  rating: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { marginLeft: 6, fontSize: 13, color: '#6b7280' },
  bio: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  since: { fontSize: 12, color: '#9ca3af', margin: 0 },
  tabs: { display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 },
  tab: { padding: '12px 0', fontSize: 15, fontWeight: 500, background: 'transparent', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', cursor: 'pointer', marginBottom: -1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
  reviews: { display: 'flex', flexDirection: 'column', gap: 16 },
  review: { padding: 20, background: '#fff', border: '1px solid var(--border)', borderRadius: 10 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#2d6a4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 },
  reviewerName: { fontWeight: 600, fontSize: 14 },
};
