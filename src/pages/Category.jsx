import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { CATEGORIES, getCategory } from '../lib/categories';
import { supabase } from '../lib/supabase';

function FilterField({ attr, value, onChange }) {
  if (attr.filter === 'select') {
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <select className="select" value={value || ''} onChange={e => onChange(attr.key, e.target.value)}>
          <option value="">Всі</option>
          {attr.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (attr.filter === 'range') {
    const from = value?.from || '';
    const to = value?.to || '';
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" type="number" placeholder="від" value={from}
            onChange={e => onChange(attr.key, { from: e.target.value, to })}
            style={{ flex: 1 }}/>
          <input className="input" type="number" placeholder="до" value={to}
            onChange={e => onChange(attr.key, { from, to: e.target.value })}
            style={{ flex: 1 }}/>
        </div>
      </div>
    );
  }

  if (attr.filter === 'text') {
    return (
      <div className="field" style={{ margin: 0 }}>
        <label>{attr.label}</label>
        <input className="input" placeholder={attr.placeholder || 'Пошук...'} value={value || ''}
          onChange={e => onChange(attr.key, e.target.value)}/>
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

  if (!cat) return <Layout><Empty title="Категорія не знайдена"/></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{cat.name}</div>
          <div className="page-subtitle">{filteredListings.length} оголошень</div>
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

        {hasAttrFilters && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }}/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Характеристики
              </span>
              {hasActiveAttrFilters && (
                <button onClick={resetAttrFilters}
                  style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  Скинути
                </button>
              )}
            </div>
            <div className="filters-row">
              {filterableAttrs.map(attr => (
                <FilterField key={attr.key} attr={attr} value={attrFilters[attr.key]} onChange={setAttrFilter}/>
              ))}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-muted">Завантаження...</div>
      ) : filteredListings.length === 0 ? (
        <Empty title="Немає оголошень" text="Спробуйте змінити фільтри"
          action={hasActiveAttrFilters && (
            <button className="btn btn-ghost" onClick={resetAttrFilters}>Скинути фільтри</button>
          )}/>
      ) : (
        <div className="listings-grid">
          {filteredListings.map(l => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </Layout>
  );
}

export { CATEGORIES };
