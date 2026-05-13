import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let data;
      if (q) {
        const { data: rpc } = await supabase.rpc('search_listings', {
          q,
          city: city || null,
        });
        data = rpc;
      } else {
        let query = supabase.from('listings').select('*').eq('status', 'active');
        if (city) query = query.ilike('location', city);
        const { data: rows } = await query.order('created_at', { ascending: false }).limit(60);
        data = rows;
      }
      setListings(data || []);
      setLoading(false);
    })();
  }, [q, city]);

  const subtitle = [q ? `«${q}»` : null, city || null].filter(Boolean).join(' · ');

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Результати пошуку</div>
          <div className="page-subtitle">{subtitle || 'Усі оголошення'} — {listings.length} знайдено</div>
        </div>
      </div>
      {loading ? (
        <div className="text-muted">Завантаження...</div>
      ) : listings.length === 0 ? (
        <Empty title="Нічого не знайдено" text="Спробуйте інший запит або змініть місто"/>
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}