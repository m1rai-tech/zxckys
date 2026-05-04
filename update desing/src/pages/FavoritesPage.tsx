import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';
import Sidebar from '../components/Sidebar';
import ListingCard from '../components/ListingCard';

export default function FavoritesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('olx_favorites');
    if (!stored) { setLoading(false); return; }
    const ids = JSON.parse(stored).map((f: { listing_id: string }) => f.listing_id);
    if (ids.length === 0) { setLoading(false); return; }
    fetchFavorites(ids);
  }, []);

  const fetchFavorites = async (ids: string[]) => {
    setLoading(true);
    try {
      const { data } = await supabase.from('listings').select('*').in('id', ids).eq('status', 'active');
      setListings((data as Listing[]) || []);
    } catch { setListings([]); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>Улюблене</h1>
        <p style={styles.count}>{listings.length} оголошень</p>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤍</div>
            <h3 className="empty-state-title">Улюблене порожнє</h3>
            <p className="empty-state-text">Натисніть 🤍 щоб зберегти оголошення</p>
            <Link to="/" className="btn btn-primary">Переглянути оголошення</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  main: { flex: 1, padding: '24px 28px', maxWidth: 1200 },
  title: { fontSize: 22, fontWeight: 700 },
  count: { fontSize: 13, color: '#9ca3af', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
};
