import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { CATEGORIES, getCategory } from '../lib/categories';
import { supabase } from '../lib/supabase';

export default function Category() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [location, setLocation] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [sort, setSort] = useState('new');

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('listings').select('*').eq('status', 'active');
      if (slug) q = q.eq('category', slug);
      if (priceFrom) q = q.gte('price', Number(priceFrom));
      if (priceTo) q = q.lte('price', Number(priceTo));
      if (location) q = q.ilike('location', `%${location}%`);
      if (delivery) q = q.eq('delivery', true);
      if (sort === 'cheap') q = q.order('price', { ascending: true });
      else if (sort === 'expensive') q = q.order('price', { ascending: false });
      else q = q.order('created_at', { ascending: false });
      const { data } = await q.limit(60);
      setListings(data || []);
      setLoading(false);
    })();
  }, [slug, priceFrom, priceTo, location, delivery, sort]);

  if (!cat) return <Layout><Empty title="Категорія не знайдена"/></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{cat.name}</div>
          <div className="page-subtitle">{listings.length} оголошень</div>
        </div>
      </div>

      <div className="filters">
        <div className="filters-row">
          <div className="field" style={{ margin: 0 }}>
            <label>Ціна від</label>
            <input className="input" type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="0"/>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Ціна до</label>
            <input className="input" type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)} placeholder="∞"/>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Місто</label>
            <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Будь-яке"/>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Сортування</label>
            <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="new">Спочатку нові</option>
              <option value="cheap">Спочатку дешеві</option>
              <option value="expensive">Спочатку дорогі</option>
            </select>
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="delivery" checked={delivery} onChange={e => setDelivery(e.target.checked)}/>
            <label htmlFor="delivery" style={{ margin: 0 }}>Лише з доставкою</label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Завантаження...</div>
      ) : listings.length === 0 ? (
        <Empty title="Немає оголошень" text="Спробуйте змінити фільтри"/>
      ) : (
        <div className="listings-grid">
          {listings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}

export { CATEGORIES };
