import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { IconPlus } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('listings')
        .select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(36);
      setListings(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <div style={{
        background: 'var(--accent-soft)',
        border: '1px solid #c8e0d4',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
            Подайте оголошення безкоштовно
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Тисячі покупців з усієї України
          </div>
        </div>
        <Link to={user ? '/create' : '/login'} className="btn btn-primary">
          <IconPlus size={16}/> Подати оголошення
        </Link>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Свіжі оголошення
        </h2>
        <Link to="/search" style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>
          Усі оголошення →
        </Link>
      </div>

      {loading ? (
        <div className="listings-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              height: 280,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}/>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Empty
          title="Поки що немає оголошень"
          text="Будьте першим, хто розмістить оголошення!"
          action={<Link to={user ? '/create' : '/login'} className="btn btn-primary">Подати оголошення</Link>}
        />
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </Layout>
  );
}
