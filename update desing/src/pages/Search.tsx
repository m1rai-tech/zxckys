import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard, Listing } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from('listings').select('*').eq('status', 'active');
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      const { data } = await query.order('created_at', { ascending: false }).limit(60);
      setListings((data as any) || []);
      setLoading(false);
    })();
  }, [q]);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Результати пошуку</div>
          <div className="page-subtitle">{q ? `За запитом «${q}»` : 'Усі оголошення'} — {listings.length} знайдено</div>
        </div>
      </div>
      {loading ? (
        <div className="text-muted">Завантаження...</div>
      ) : listings.length === 0 ? (
        <Empty title="Нічого не знайдено" text="Спробуйте інший запит"/>
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}
