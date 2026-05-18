import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { IconPlus } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../lib/categories';
import { useMeta } from '../hooks/useMeta';
import { useReportedListings } from '../hooks/useReportedListings';
import { useCurrency } from '../contexts/CurrencyContext';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'boosted', label: 'Featured first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function SortSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = SORT_OPTIONS.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36,
          padding: '0 10px',
          border: '1.5px solid var(--border)',
          borderRadius: 8,
          background: 'var(--bg-card)',
          color: 'var(--text)',
          fontSize: 13,
          cursor: 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'border-color .15s, background .15s',
        }}
      >
        <span>{selected?.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform .15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 1000,
          minWidth: '100%',
          overflow: 'hidden',
        }}>
          {SORT_OPTIONS.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: '9px 12px',
                cursor: 'pointer',
                fontSize: 13,
                background: value === o.value ? 'var(--accent-soft)' : 'transparent',
                color: value === o.value ? 'var(--accent)' : 'var(--text)',
                fontWeight: value === o.value ? 600 : 400,
                transition: 'background .1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (value !== o.value) e.currentTarget.style.background = 'var(--bg-soft)'; }}
              onMouseLeave={e => { if (value !== o.value) e.currentTarget.style.background = 'transparent'; }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [recentListings, setRecentListings] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);

  const { user, profile } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const reportedIds = useReportedListings();
  useMeta({ title: 'Home', description: 'Buy and sell anything near you — electronics, vehicles, clothing, jobs and more.' });

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    if (!ids.length) return;
    supabase.from('listings').select('*').in('id', ids).eq('status', 'active').then(({ data }) => {
      if (!data?.length) return;
      const sorted = ids.map(id => data.find(l => l.id === id)).filter(Boolean);
      setRecentListings(sorted);
    });
  }, []);

  const fetchListings = useCallback(async (headerCity, sort = sortBy, min = priceMin, max = priceMax) => {
    setLoading(true);
    const headerOrSaved = headerCity ?? (localStorage.getItem('app_city') || '');
    const filterStr = headerOrSaved || (profile?.city || '');

    const applyFilters = (q) => {
      if (min !== '') q = q.gte('price', Number(min));
      if (max !== '') q = q.lte('price', Number(max));
      if (sort === 'price_asc') q = q.order('price', { ascending: true });
      else if (sort === 'price_desc') q = q.order('price', { ascending: false });
      else if (sort === 'boosted') q = q.order('boosted_until', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
      else q = q.order('created_at', { ascending: false });
      return q.limit(48);
    };

    if (filterStr) {
      const parts = filterStr.split(',').map(p => p.trim());
      const cityName = parts[0];
      const country = parts.length > 1 ? parts[parts.length - 1] : '';

      const { data: cityData } = await applyFilters(
        supabase.from('listings').select('*').eq('status', 'active').ilike('location', `%${cityName}%`)
      );
      if (cityData?.length) { setListings(cityData); setLoading(false); return; }

      if (country) {
        const { data: countryData } = await applyFilters(
          supabase.from('listings').select('*').eq('status', 'active').ilike('location', `%${country}%`)
        );
        if (countryData?.length) { setListings(countryData); setLoading(false); return; }
      }
    }

    const { data } = await applyFilters(
      supabase.from('listings').select('*').eq('status', 'active')
    );
    setListings(data || []);
    setLoading(false);
  }, [profile?.city, sortBy, priceMin, priceMax]);

  useEffect(() => {
    fetchListings();
    const onCityChange = (e) => fetchListings(e.detail);
    window.addEventListener('city-changed', onCityChange);
    return () => window.removeEventListener('city-changed', onCityChange);
  }, [fetchListings]);

  const hasFilters = sortBy !== 'newest' || priceMin !== '' || priceMax !== '';

  const clearFilters = () => {
    setSortBy('newest');
    setPriceMin('');
    setPriceMax('');
  };

  const handlePriceMin = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const [int, dec] = val.split('.');
    const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
    setPriceMin(limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : ''));
  };

  const handlePriceMax = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const [int, dec] = val.split('.');
    const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
    setPriceMax(limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : ''));
  };

  const now = new Date();
  const filtered = listings
    .filter(l => !reportedIds.has(l.id))
    .sort((a, b) => {
      const aBoosted = a.boosted_until && new Date(a.boosted_until) > now;
      const bBoosted = b.boosted_until && new Date(b.boosted_until) > now;
      if (aBoosted && !bBoosted) return -1;
      if (!aBoosted && bBoosted) return 1;
      return 0;
    });
  useEffect(() => { setVisibleCount(12); }, [listings]);

  return (
    <Layout>
      <div className="post-banner" style={{
        background: 'var(--accent-soft)', border: '1px solid #c8e0d4',
        borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
            Post a listing for free
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Thousands of buyers waiting
          </div>
        </div>
        <Link to={user ? '/create' : '/login'} className="btn btn-primary">
          <IconPlus size={16} /> Post Ad
        </Link>
      </div>

      <div className="mobile-categories" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>
          Categories
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {CATEGORIES.map(c => (
            <Link key={c.slug} to={`/c/${c.slug}`} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 8, padding: '14px 8px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', textDecoration: 'none',
              color: 'var(--text)', fontSize: 12, fontWeight: 500,
              textAlign: 'center', transition: 'border-color .15s, background .15s', minHeight: 72,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              <c.Icon size={24} style={{ color: 'var(--accent)' }} />
              <span style={{ lineHeight: 1.3 }}>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {recentListings.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Recently viewed
          </h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {recentListings.filter(l => !reportedIds.has(l.id)).map(l => (
              <Link key={l.id} to={`/listing/${l.id}`} style={{ textDecoration: 'none', color: 'var(--text)', flexShrink: 0, width: 130 }}>
                <div style={{ width: 130, height: 96, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-soft)', border: '1px solid var(--border)', marginBottom: 6 }}>
                  {l.photos?.[0]
                    ? <img src={l.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 28 }}>📷</div>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{l.title}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                  {l.is_free ? 'Free' : l.price ? `${currency.symbol}${Number(l.price).toLocaleString()}` : '—'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
          Recent listings
        </h2>
        <Link to="/search" style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>
          All →
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SortSelect value={sortBy} onChange={setSortBy} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>{currency.symbol}</span>
            <input
              type="text"
              placeholder="Min"
              value={priceMin}
              onChange={handlePriceMin}
              style={{ width: 80, height: 36, border: '1.5px solid var(--border)', borderRadius: 8, paddingLeft: 22, paddingRight: 6, fontSize: 13, background: 'var(--bg-card)', outline: 'none' }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>{currency.symbol}</span>
            <input
              type="text"
              placeholder="Max"
              value={priceMax}
              onChange={handlePriceMax}
              style={{ width: 80, height: 36, border: '1.5px solid var(--border)', borderRadius: 8, paddingLeft: 22, paddingRight: 6, fontSize: 13, background: 'var(--bg-card)', outline: 'none' }}
            />
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} style={{ height: 36, padding: '0 12px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'none', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            × Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="listings-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              background: 'var(--bg-soft)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', height: 280,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          title="No listings found"
          text={hasFilters ? 'Try adjusting your filters' : 'Be the first to post a listing!'}
          action={hasFilters
            ? <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
            : <Link to={user ? '/create' : '/login'} className="btn btn-primary">Post Ad</Link>}
        />
      ) : (
        <>
          <div className="listings-grid">
            {filtered.slice(0, visibleCount).map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
            {visibleCount < filtered.length && (
              <button
                className="btn btn-ghost"
                style={{ padding: '10px 32px', fontWeight: 600, fontSize: 14 }}
                onClick={() => setVisibleCount(n => n + 6)}
              >
                Show more
              </button>
            )}
            {visibleCount > 12 && (
              <button
                className="btn btn-ghost"
                style={{ padding: '10px 32px', fontWeight: 600, fontSize: 14 }}
                onClick={() => setVisibleCount(12)}
              >
                Hide
              </button>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .mobile-categories { display: none; }
        @media (max-width: 900px) { .mobile-categories { display: block; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </Layout>
  );
}