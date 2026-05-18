import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { supabase } from '../lib/supabase';
import { useMeta } from '../hooks/useMeta';
import { useReportedListings } from '../hooks/useReportedListings';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const city = params.get('city') || '';
  const priceMin = params.get('priceMin') || '';
  const priceMax = params.get('priceMax') || '';
  const delivery = params.get('delivery') === '1';
  const sort = params.get('sort') || 'newest';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const reportedIds = useReportedListings();

  const subtitle = [q ? `«${q}»` : null, city || null].filter(Boolean).join(' · ');
  useMeta({
    title: subtitle ? `${subtitle} — Search` : 'Search',
    description: `Search results${subtitle ? ` for ${subtitle}` : ''} on Marketplace`,
  });

  const setParam = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      let query;
      if (q) {
        const { data: rpc } = await supabase.rpc('search_listings', { q, city: city || null });
        // apply client-side filters on RPC result since it's a function
        let rows = rpc || [];
        if (priceMin) rows = rows.filter(r => r.price != null && r.price >= Number(priceMin));
        if (priceMax) rows = rows.filter(r => r.price != null && r.price <= Number(priceMax));
        if (delivery) rows = rows.filter(r => r.delivery);
        if (sort === 'price_asc') rows.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        else if (sort === 'price_desc') rows.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        else if (sort === 'oldest') rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        setListings(rows);
      } else {
        query = supabase.from('listings').select('*').eq('status', 'active');
        if (city) query = query.ilike('location', `%${city}%`);
        if (priceMin) query = query.gte('price', Number(priceMin));
        if (priceMax) query = query.lte('price', Number(priceMax));
        if (delivery) query = query.eq('delivery', true);

        const [col, asc] = {
          newest:     ['created_at', false],
          oldest:     ['created_at', true],
          price_asc:  ['price', true],
          price_desc: ['price', false],
        }[sort] || ['created_at', false];

        const { data } = await query
          .order('boosted_until', { ascending: false, nullsFirst: false })
          .order(col, { ascending: asc })
          .limit(60);
        setListings(data || []);
      }

      setLoading(false);
    })();
  }, [q, city, priceMin, priceMax, delivery, sort]);

  const hasFilters = priceMin || priceMax || delivery || sort !== 'newest';

  return (
    <Layout>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="page-title">Search results</div>
          <div className="page-subtitle">{subtitle || 'All listings'} — {listings.length} found</div>
        </div>
        <button
          className={`btn btn-ghost btn-sm${hasFilters ? ' btn-accent-outline' : ''}`}
          onClick={() => setFiltersOpen(o => !o)}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters{hasFilters ? ' ·' : ''}
        </button>
      </div>

      {filtersOpen && (
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
          padding: 16, marginBottom: 16, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
        }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Price from</label>
            <input className="input" type="number" min="0" placeholder="0"
              value={priceMin} onChange={e => setParam('priceMin', e.target.value)}/>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Price to</label>
            <input className="input" type="number" min="0" placeholder="Any"
              value={priceMax} onChange={e => setParam('priceMax', e.target.value)}/>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Sort</label>
            <select className="select" value={sort} onChange={e => setParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 40 }}>
              <input type="checkbox" checked={delivery} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                onChange={e => setParam('delivery', e.target.checked ? '1' : '')}/>
              Delivery only
            </label>
          </div>
          {hasFilters && (
            <div className="field" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" style={{ height: 40 }} onClick={() => {
                const next = new URLSearchParams(params);
                ['priceMin','priceMax','delivery','sort'].forEach(k => next.delete(k));
                setParams(next);
              }}>Clear filters</button>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : listings.length === 0 ? (
        <Empty title="Nothing found" text="Try different filters or a broader search"/>
      ) : (
        <div className="listings-grid">
          {listings.filter(l => !reportedIds.has(l.id)).map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}
