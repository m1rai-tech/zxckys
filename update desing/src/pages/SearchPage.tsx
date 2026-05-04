import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Listing } from '../types';
import ListingCard from '../components/ListingCard';
import Sidebar from '../components/Sidebar';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (searchParams.get('q')) performSearch(searchParams.get('q')!);
    else setLoading(false);
  }, [searchParams]);

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(50);
      setListings((data as Listing[]) || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const q = searchParams.get('q') || '';

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <input
            type="text"
            className="form-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Що шукаєте?"
          />
          <button type="submit" className="btn btn-primary">Знайти</button>
        </form>

        {q && (
          <div style={styles.resultsInfo}>
            Результати: <strong>"{q}"</strong> — {listings.length} оголошень
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : q && listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Нічого не знайдено</div>
            <p className="empty-state-text">Спробуйте змінити запит</p>
          </div>
        ) : listings.length > 0 ? (
          <div style={styles.grid}>
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">Введіть запит для пошуку</div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  main: { flex: 1, padding: '24px 28px', maxWidth: 1200 },
  searchBar: { display: 'flex', gap: 12, marginBottom: 20 },
  resultsInfo: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
};
