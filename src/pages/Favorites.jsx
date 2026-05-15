import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { getFavorites } from '../lib/favorites';
import { IconHeart } from '../components/Icons';

export default function Favorites() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const ids = getFavorites();
    if (ids.length === 0) { setListings([]); setLoading(false); return; }
    const { data } = await supabase.from('listings').select('*').in('id', ids);
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    window.addEventListener('favorites-changed', load);
    return () => window.removeEventListener('favorites-changed', load);
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Favorites</div>
          <div className="page-subtitle">{listings.length} saved listings</div>
        </div>
      </div>
      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : listings.length === 0 ? (
        <Empty
          icon={<IconHeart size={48}/>}
          title="No favorites yet"
          text="Tap the heart on listings to save them here"
          action={<Link to="/" className="btn btn-primary">Browse listings</Link>}
        />
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}
