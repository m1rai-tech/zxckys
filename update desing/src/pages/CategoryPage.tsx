import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import { getCategoryBySlug } from '../data/categories';
import Sidebar from '../components/Sidebar';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [location, setLocation] = useState('');
  const [withDelivery, setWithDelivery] = useState(false);

  const category = getCategoryBySlug(slug || '');

  useEffect(() => {
    if (category) fetchListings();
  }, [slug, searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('category_id', category?.id)
        .eq('status', 'active');

      const q = searchParams.get('q');
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      const pf = searchParams.get('price_from');
      if (pf) query = query.gte('price', parseInt(pf));
      const pt = searchParams.get('price_to');
      if (pt) query = query.lte('price', parseInt(pt));
      const loc = searchParams.get('location');
      if (loc) query = query.ilike('location', `%${loc}%`);
      if (searchParams.get('delivery') === 'true') query = query.eq('has_delivery', true);

      const { data } = await query.order('created_at', { ascending: false });
      if (data) setListings(data as Listing[]);
      else setListings(getDemo());
    } catch {
      setListings(getDemo());
    } finally {
      setLoading(false);
    }
  };

  const getDemo = (): Listing[] => [
    {
      id: 'demo1', title: `${category?.name || 'Товар'} — приклад 1`,
      description: 'Опис', price: 1500, is_free: false,
      category_id: category?.id || '', category_name: category?.name || '',
      location: 'Київ', user_id: '1', status: 'active', images: [],
      attributes: {}, has_delivery: true, show_phone: true, views: 50,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
      id: 'demo2', title: `${category?.name || 'Товар'} — приклад 2`,
      description: 'Опис', price: 2500, is_free: false,
      category_id: category?.id || '', category_name: category?.name || '',
      location: 'Харків', user_id: '2', status: 'active', images: [],
      attributes: {}, has_delivery: false, show_phone: true, views: 30,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const applyFilters = () => {
    const p = new URLSearchParams();
    if (priceFrom) p.set('price_from', priceFrom);
    if (priceTo) p.set('price_to', priceTo);
    if (location) p.set('location', location);
    if (withDelivery) p.set('delivery', 'true');
    setSearchParams(p);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setPriceFrom(''); setPriceTo(''); setLocation(''); setWithDelivery(false);
    setSearchParams({});
  };

  if (!category) return (
    <div className="container" style={{ padding: '60px 0' }}>
      <div className="empty-state">
        <div className="empty-state-title">Категорію не знайдено</div>
        <Link to="/" className="btn btn-primary">На головну</Link>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{category.name}</h1>
            <p style={styles.count}>{listings.length} оголошень</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
            Фільтри
          </button>
        </div>

        {showFilters && (
          <div style={styles.filters}>
            <div style={styles.filterRow}>
              <div>
                <label style={styles.filterLabel}>Ціна від</label>
                <input type="number" className="form-input" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={styles.filterLabel}>Ціна до</label>
                <input type="number" className="form-input" value={priceTo} onChange={e => setPriceTo(e.target.value)} placeholder="∞" />
              </div>
              <div>
                <label style={styles.filterLabel}>Місто</label>
                <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Київ" />
              </div>
            </div>
            <div style={styles.filterBottom}>
              <label className="form-checkbox">
                <input type="checkbox" checked={withDelivery} onChange={e => setWithDelivery(e.target.checked)} />
                Тільки з доставкою
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Скинути</button>
                <button className="btn btn-primary btn-sm" onClick={applyFilters}>Застосувати</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">Оголошень не знайдено</h3>
            <Link to="/listing/new" className="btn btn-primary">Подати оголошення</Link>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700 },
  count: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  filters: { background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 },
  filterRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  filterLabel: { fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6, display: 'block' },
  filterBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
};
