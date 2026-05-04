import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import Sidebar from '../components/Sidebar';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(40);
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
      id: '1', title: 'iPhone 15 Pro Max 256GB',
      description: 'Новий, в запечатаній коробці', price: 55000, is_free: false,
      category_id: 'electronics', category_name: 'Техніка',
      location: 'Київ', user_id: '1', status: 'active',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'],
      attributes: { 'Стан': 'Новий' }, has_delivery: true, show_phone: true, views: 123,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
      id: '2', title: 'Volkswagen Golf 7, 2018',
      description: 'Чудовий стан', price: 380000, is_free: false,
      category_id: 'auto', category_name: 'Авто',
      location: 'Харків', user_id: '2', status: 'active',
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'],
      attributes: {}, has_delivery: false, show_phone: true, views: 456,
      created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3', title: 'Куртка зимова чоловіча L',
      description: 'Нова, з бирками', price: 2500, is_free: false,
      category_id: 'clothing', category_name: 'Одяг',
      location: 'Одеса', user_id: '3', status: 'active',
      images: ['https://images.unsplash.com/photo-1544923246-77307dd628b8?w=400'],
      attributes: {}, has_delivery: true, show_phone: false, views: 78,
      created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '4', title: 'PlayStation 5 з двома джойстиками',
      description: 'Б/в у гарному стані', price: 18000, is_free: false,
      category_id: 'gaming', category_name: 'Геймінг',
      location: 'Львів', user_id: '4', status: 'active',
      images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'],
      attributes: {}, has_delivery: true, show_phone: true, views: 200,
      created_at: new Date(Date.now() - 259200000).toISOString(), updated_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Останні оголошення</h1>
            <p style={styles.subtitle}>Актуальні пропозиції від продавців</p>
          </div>
          <Link to="/listing/new" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Подати оголошення
          </Link>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3 className="empty-state-title">Оголошень поки немає</h3>
            <p className="empty-state-text">Станьте першим!</p>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700 },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
};
