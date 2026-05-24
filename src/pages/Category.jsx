import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { CATEGORIES, getCategory } from '../lib/categories';
import { supabase } from '../lib/supabase';
import { useReportedListings } from '../hooks/useReportedListings';
import { useCurrency } from '../contexts/CurrencyContext';

function FilterField({ attr, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (attr.filter === 'select') {
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            type="button"
            style={{
              width: '100%',
              height: 40,
              padding: '0 12px',
              background: '#fff',
              border: '1px solid',
              borderColor: open ? 'var(--accent)' : 'var(--border)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: 14,
              color: 'var(--text)',
              transition: 'border-color .15s',
            }}
            onClick={() => setOpen(o => !o)}
          >
            <span>{value || 'All'}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              zIndex: 1000,
              maxHeight: 220,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--border) transparent',
            }}>
              {['', ...attr.options].map(o => (
                <div
                  key={o || '__all__'}
                  onClick={() => { onChange(attr.key, o); setOpen(false); }}
                  style={{
                    padding: '9px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                    background: (value || '') === o ? 'var(--accent-soft)' : 'transparent',
                    color: (value || '') === o ? 'var(--accent)' : 'var(--text)',
                    fontWeight: (value || '') === o ? 600 : 400,
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => { if ((value || '') !== o) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                  onMouseLeave={e => { if ((value || '') !== o) e.currentTarget.style.background = 'transparent'; }}
                >
                  {o || 'All'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (attr.filter === 'range') {
    const from = value?.from || '';
    const to = value?.to || '';
    const handleRange = (val) => {
      const clean = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const [int, dec] = clean.split('.');
      const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
      return limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : '');
    };
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" type="text" placeholder="from" value={from}
            onChange={e => onChange(attr.key, { from: handleRange(e.target.value), to })} style={{ flex: 1 }} />
          <input className="input" type="text" placeholder="to" value={to}
            onChange={e => onChange(attr.key, { from, to: handleRange(e.target.value) })} style={{ flex: 1 }} />
        </div>
      </div>
    );
  }

  if (attr.filter === 'text') {
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <input className="input" placeholder={attr.placeholder || 'Search...'} value={value || ''}
          maxLength={60}
          onChange={e => onChange(attr.key, e.target.value.slice(0, 60))} />
      </div>
    );
  }

  return null;
}

export default function Category() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportedIds = useReportedListings();
  const { currency } = useCurrency();

  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [location, setLocation] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [sort, setSort] = useState('new');
  const [attrFilters, setAttrFilters] = useState({});

  const filterableAttrs = cat?.attrs.filter(a => a.filter) || [];
  const hasAttrFilters = filterableAttrs.length > 0;

  const hasActiveAttrFilters = Object.values(attrFilters).some(v => {
    if (!v) return false;
    if (typeof v === 'object') return v.from || v.to;
    return true;
  });

  useEffect(() => {
    setAttrFilters({});
  }, [slug]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('listings').select('*, listing_extras(*)').eq('status', 'active');
      if (slug) q = q.eq('category', slug);
      if (priceFrom) q = q.gte('price', Number(priceFrom));
      if (priceTo) q = q.lte('price', Number(priceTo));
      if (location) q = q.ilike('location', `%${location}%`);
      if (delivery) q = q.eq('delivery', true);
      if (sort === 'cheap') q = q.order('price', { ascending: true });
      else if (sort === 'expensive') q = q.order('price', { ascending: false });
      else q = q.order('created_at', { ascending: false });
      const { data } = await q.limit(200);
      setAllListings(data || []);
      setLoading(false);
    })();
  }, [slug, priceFrom, priceTo, location, delivery, sort]);

  const setAttrFilter = (key, val) => {
    setAttrFilters(prev => ({ ...prev, [key]: val }));
  };

  const resetAttrFilters = () => setAttrFilters({});

  const filteredListings = hasActiveAttrFilters
    ? allListings.filter(listing => {
      const extras = listing.listing_extras || [];
      return filterableAttrs.every(attr => {
        const fv = attrFilters[attr.key];
        if (!fv) return true;

        if (attr.filter === 'range') {
          if (!fv.from && !fv.to) return true;
          const entry = extras.find(e => e.key === attr.key);
          if (!entry?.value) return false;
          const num = Number(entry.value);
          if (fv.from && num < Number(fv.from)) return false;
          if (fv.to && num > Number(fv.to)) return false;
          return true;
        }

        if (attr.filter === 'select') {
          const entry = extras.find(e => e.key === attr.key);
          return entry?.value === fv;
        }

        if (attr.filter === 'text') {
          const entry = extras.find(e => e.key === attr.key);
          return entry?.value?.toLowerCase().includes(fv.toLowerCase());
        }

        return true;
      });
    })
    : allListings;

  if (!cat) return <Layout><Empty title="Category not found" /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{cat.name}</div>
          <div className="page-subtitle">{filteredListings.length} listings</div>
        </div>
      </div>

      <div className="filters">
        <div className="filters-row">
          <div className="field" style={{ margin: 0 }}>
            <label>Price from</label>
            <input className="input" type="text" value={priceFrom} onChange={e => {
              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              const [int, dec] = val.split('.');
              const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
              setPriceFrom(limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : ''));
            }} placeholder="0" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Price to</label>
            <input className="input" type="text" value={priceTo} onChange={e => {
              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
              const [int, dec] = val.split('.');
              const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
              setPriceTo(limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : ''));
            }} placeholder="∞" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>City</label>
            <input className="input" value={location} maxLength={60} onChange={e => setLocation(e.target.value.slice(0, 60))} placeholder="Any" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Sort</label>
            {(() => {
              const sortOptions = [
                { value: 'new', label: 'Newest first' },
                { value: 'cheap', label: 'Cheapest first' },
                { value: 'expensive', label: 'Most expensive first' },
              ];
              const [sortOpen, setSortOpen] = useState(false);
              const sortRef = useRef(null);
              useEffect(() => {
                if (!sortOpen) return;
                const h = (e) => { if (!sortRef.current?.contains(e.target)) setSortOpen(false); };
                document.addEventListener('mousedown', h);
                return () => document.removeEventListener('mousedown', h);
              }, [sortOpen]);
              const selected = sortOptions.find(o => o.value === sort);
              return (
                <div ref={sortRef} style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setSortOpen(o => !o)} style={{
                    width: '100%', height: 40, padding: '0 12px', background: '#fff',
                    border: '1px solid', borderColor: sortOpen ? 'var(--accent)' : 'var(--border)',
                    borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', cursor: 'pointer', fontSize: 14, color: 'var(--text)',
                    transition: 'border-color .15s',
                  }}>
                    <span>{selected?.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform .15s', transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {sortOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                      background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 1000, overflowY: 'auto',
                      scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
                    }}>
                      {sortOptions.map(o => (
                        <div key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                          style={{
                            padding: '9px 12px', cursor: 'pointer', fontSize: 13,
                            background: sort === o.value ? 'var(--accent-soft)' : 'transparent',
                            color: sort === o.value ? 'var(--accent)' : 'var(--text)',
                            fontWeight: sort === o.value ? 600 : 400, transition: 'background .1s',
                          }}
                          onMouseEnter={e => { if (sort !== o.value) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                          onMouseLeave={e => { if (sort !== o.value) e.currentTarget.style.background = 'transparent'; }}
                        >{o.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <div className="checkbox-row">
            <input type="checkbox" id="delivery" checked={delivery} onChange={e => setDelivery(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
            <label htmlFor="delivery" style={{ margin: 0 }}>With delivery only</label>
          </div>
        </div>

        {hasAttrFilters && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attributes
              </span>
              {hasActiveAttrFilters && (
                <button onClick={resetAttrFilters}
                  style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Reset
                </button>
              )}
            </div>
            <div className="filters-row">
              {filterableAttrs.map(attr => (
                <FilterField key={attr.key} attr={attr} value={attrFilters[attr.key]} onChange={setAttrFilter} />
              ))}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : filteredListings.length === 0 ? (
        <Empty title="No listings" text="Try changing the filters"
          action={hasActiveAttrFilters && (
            <button className="btn btn-ghost" onClick={resetAttrFilters}>Reset filters</button>
          )} />
      ) : (
        <div className="listings-grid">
          {filteredListings
            .filter(l => !reportedIds.has(l.id))
            .sort((a, b) => {
              const code = currency?.code;
              if (!code) return 0;
              const aMatch = a.currency === code;
              const bMatch = b.currency === code;
              if (aMatch && !bMatch) return -1;
              if (!aMatch && bMatch) return 1;
              return 0;
            })
            .map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </Layout>
  );
}

export { CATEGORIES };
