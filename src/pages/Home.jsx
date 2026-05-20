import { useEffect, useState, useCallback, useRef } from 'react';

// on iOS touch-action: pan-x doesn't work on overflow containers,
// so we manually detect direction and scroll the page for vertical swipes
function HRow({ gap = 12, pb = 4, children }) {
  return (
    <div className="hrow" style={{ display: 'flex', gap, overflowX: 'auto', paddingBottom: pb, scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
      {children}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { IconPlus, IconHeart } from '../components/Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../lib/categories';
import { useMeta } from '../hooks/useMeta';
import { useReportedListings } from '../hooks/useReportedListings';
import { useCurrency, getCurrencySymbol } from '../contexts/CurrencyContext';

// compact horizontal card used in the "Browse by category" rows at the bottom
function CatCard({ listing }) {
  const { currency } = useCurrency();
  const [fav, setFav] = useState(() => isFavorite(listing.id));
  const isBoosted = listing.boosted_until && new Date(listing.boosted_until) > new Date();
  const hasPrice = !listing.is_free && listing.price != null && listing.price !== '';
  const date = new Date(listing.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return (
    <Link to={`/listing/${listing.id}`} style={{
      display: 'block', textDecoration: 'none', color: 'var(--text)',
      width: 160, flexShrink: 0, borderRadius: 12, overflow: 'hidden',
      background: 'var(--bg-card)',
      border: isBoosted ? '2px solid #f59e0b' : '1px solid var(--border)',
      boxShadow: isBoosted ? '0 0 0 3px #fef3c7' : 'none',
      touchAction: 'pan-x pan-y',
    }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', background: 'var(--bg-soft)', overflow: 'hidden', touchAction: 'pan-x pan-y' }}>
        {listing.photos?.[0]
          ? <img src={listing.photos[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 24 }}>📷</div>}
        {isBoosted && (
          <div style={{ position: 'absolute', top: 7, left: 7, background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.03em' }}>TOP</div>
        )}
        {listing.delivery && (
          <div style={{ position: 'absolute', bottom: 7, left: 7, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>Delivery</div>
        )}
        <button
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); setFav(toggleFavorite(listing.id)); }}
        >
          <IconHeart size={13} fill={fav} style={{ color: fav ? '#ef4444' : 'var(--text-muted)' }} />
        </button>
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
          {listing.is_free ? 'Free' : hasPrice ? `${getCurrencySymbol(listing.currency) || currency?.symbol || ''}${Number(listing.price).toLocaleString()}` : <span style={{ color: 'var(--text)', fontWeight: 500 }}>Negotiable</span>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{listing.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 4 }}>{listing.location?.split(',')[0]}</span>
          <span style={{ flexShrink: 0 }}>{date}</span>
        </div>
      </div>
    </Link>
  );
}

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
  const [catListings, setCatListings] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  const { user, profile } = useAuth();
  const { currency } = useCurrency();
  const reportedIds = useReportedListings();
  useMeta({ title: 'Home', description: 'Buy and sell anything near you — electronics, vehicles, clothing, jobs and more.' });

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // load listings the user recently viewed, preserving the order they visited them
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    if (!ids.length) return;
    supabase.from('listings').select('*').in('id', ids).eq('status', 'active').then(({ data }) => {
      if (!data?.length) return;
      const sorted = ids.map(id => data.find(l => l.id === id)).filter(Boolean);
      setRecentListings(sorted);
    });
  }, []);

  // separate fetch for the category sections — bigger pool, boosted sort done in JS to avoid DB quirks
  useEffect(() => {
    supabase.from('listings').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (!error && data) setCatListings(data);
      });
  }, []);

  // re-runs whenever city, sort, or price filter changes — tries city match first, falls back to all
  const fetchListings = useCallback(async (headerCity, sort = sortBy, min = priceMin, max = priceMax) => {
    setLoading(true);
    const filterStr = headerCity ?? (localStorage.getItem('app_city') || '');

    const applyFilters = (q) => {
      if (min !== '') q = q.gte('price', Number(min));
      if (max !== '') q = q.lte('price', Number(max));
      if (sort === 'price_asc') q = q.order('price', { ascending: true });
      else if (sort === 'price_desc') q = q.order('price', { ascending: false });
      else q = q.order('created_at', { ascending: false }); // 'boosted' handled client-side
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
  }, [sortBy, priceMin, priceMax]);

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
      // currency match always floats first
      const code = currency?.code;
      if (code) {
        const aMatch = a.currency === code;
        const bMatch = b.currency === code;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }
      // boosted sort: float active boosts to top
      if (sortBy === 'boosted' || sortBy === 'newest') {
        const aBoosted = a.boosted_until && new Date(a.boosted_until) > now;
        const bBoosted = b.boosted_until && new Date(b.boosted_until) > now;
        if (aBoosted && !bBoosted) return -1;
        if (!aBoosted && bBoosted) return 1;
      }
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

      {isMobile && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Categories
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/c/${cat.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '12px 4px', borderRadius: 12,
                  border: '1px solid var(--border)', background: '#fff',
                  textDecoration: 'none', color: 'var(--text)',
                  fontSize: 11, fontWeight: 500, textAlign: 'center',
                  lineHeight: 1.3, minHeight: 72,
                }}
              >
                <cat.Icon size={22} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentListings.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Recently viewed
          </h2>
          {isMobile ? (
            <HRow gap={10} pb={10}>
              {recentListings.filter(l => !reportedIds.has(l.id)).slice(0, 8).map(l => (
                <Link key={l.id} to={`/listing/${l.id}`} style={{ textDecoration: 'none', color: 'var(--text)', flexShrink: 0, width: 130 }}>
                  <div style={{ width: 130, height: 96, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-soft)', border: '1px solid var(--border)', marginBottom: 6, position: 'relative' }}>
                    {l.photos?.[0]
                      ? <img src={l.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 28 }}>📷</div>}
                    {l.delivery && <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>Delivery</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    {l.is_free ? 'Free' : (l.price != null && l.price !== '') ? `${getCurrencySymbol(l.currency) || currency?.symbol || ''}${Number(l.price).toLocaleString()}` : <span style={{ color: 'var(--text)', fontWeight: 500 }}>Negotiable</span>}
                  </div>
                </Link>
              ))}
            </HRow>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {recentListings.filter(l => !reportedIds.has(l.id)).slice(0, 8).map(l => (
                <Link key={l.id} to={`/listing/${l.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                  <div style={{ width: '100%', aspectRatio: '130 / 96', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-soft)', border: '1px solid var(--border)', marginBottom: 6, position: 'relative' }}>
                    {l.photos?.[0]
                      ? <img src={l.photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 28 }}>📷</div>}
                    {l.delivery && <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>Delivery</div>}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    {l.is_free ? 'Free' : (l.price != null && l.price !== '') ? `${getCurrencySymbol(l.currency) || currency?.symbol || ''}${Number(l.price).toLocaleString()}` : <span style={{ color: 'var(--text)', fontWeight: 500 }}>Negotiable</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 12px' }}>
        Recent listings
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <SortSelect value={sortBy} onChange={setSortBy} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative' }}>
            {currency && <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>{currency.symbol}</span>}
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
            {currency && <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)', pointerEvents: 'none' }}>{currency.symbol}</span>}
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

      {catListings !== null && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 24 }}>
            Browse by category
          </h2>
          {CATEGORIES.map(cat => {
            const now = new Date();
            const code = currency?.code;
            const items = catListings
              .filter(l => l.category === cat.slug && !reportedIds.has(l.id))
              .sort((a, b) => {
                if (code) {
                  const aMatch = a.currency === code;
                  const bMatch = b.currency === code;
                  if (aMatch && !bMatch) return -1;
                  if (!aMatch && bMatch) return 1;
                }
                const ab = a.boosted_until && new Date(a.boosted_until) > now;
                const bb = b.boosted_until && new Date(b.boosted_until) > now;
                if (ab && !bb) return -1;
                if (!ab && bb) return 1;
                return new Date(b.created_at) - new Date(a.created_at);
              })
              .slice(0, 24);
            if (!items.length) return null;
            return (
              <div key={cat.slug} style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <cat.Icon size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} /> {cat.name}
                  </h3>
                  <Link to={`/c/${cat.slug}`} className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 16px' }}>
                    See all →
                  </Link>
                </div>
                <HRow gap={12} pb={isMobile ? 10 : 4}>
                  {items.map(l => <CatCard key={l.id} listing={l} />)}
                </HRow>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .hrow::-webkit-scrollbar { height: 4px; }
        .hrow::-webkit-scrollbar-track { background: transparent; border-radius: 2px; }
        .hrow::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; transition: background 0.2s; }
        .hrow::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </Layout>
  );
}