import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { Empty } from '../components/Empty';
import { getCategory } from '../lib/categories';
import { getAutoBrandOptions, getAutoModelOptions } from '../data/autoCatalog';
import { getAutoBodyOptions } from '../data/autoBodyCatalog';
import { supabase } from '../lib/supabase';

const FUEL = ['Бензин', 'Дизель', 'Газ / Метан', 'Газ / Пропан', 'Електро', 'Гібрид'];
const GEARBOX = ['Механіка', 'Автомат', 'Варіатор', 'Робот'];
const DRIVE = ['Передній', 'Задній', 'Повний'];
const AUTO_CONDITION = ['Нове', 'Б/в', 'Після ДТП'];
const BODY_OPTIONS = getAutoBodyOptions();
const BRAND_OPTIONS = getAutoBrandOptions({ includeAll: true });

export default function Category() {
  const { slug } = useParams();
  const cat = getCategory(slug);

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  // Standard filters
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [location, setLocation] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [sort, setSort] = useState('new');

  // Attr filters (key → value)
  const [attrF, setAttrF] = useState({});
  // Year range (auto)
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Reset attr filters when category changes
  useEffect(() => {
    setAttrF({});
    setYearFrom('');
    setYearTo('');
  }, [slug]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('listings').select('*, extras:listing_extras(*)').eq('status', 'active');
      if (slug) q = q.eq('category', slug);
      if (priceFrom) q = q.gte('price', Number(priceFrom));
      if (priceTo) q = q.lte('price', Number(priceTo));
      if (location) q = q.ilike('location', `%${location}%`);
      if (delivery) q = q.eq('delivery', true);
      if (sort === 'cheap') q = q.order('price', { ascending: true });
      else if (sort === 'expensive') q = q.order('price', { ascending: false });
      else q = q.order('created_at', { ascending: false });
      const { data } = await q.limit(200);
      setAll(data || []);
      setLoading(false);
    })();
  }, [slug, priceFrom, priceTo, location, delivery, sort]);

  const listings = useMemo(() => {
    return all.filter(l => {
      const exMap = {};
      (l.extras || []).forEach(e => { exMap[e.key] = e.value; });

      for (const [key, val] of Object.entries(attrF)) {
        if (!val) continue;
        const ev = exMap[key] || '';
        const attr = cat?.attrs.find(a => a.key === key);
        if (attr?.type === 'text') {
          if (!ev.toLowerCase().includes(val.toLowerCase())) return false;
        } else {
          if (ev.toLowerCase() !== val.toLowerCase()) return false;
        }
      }

      if (yearFrom || yearTo) {
        const y = Number(exMap['year']);
        if (!y) return false;
        if (yearFrom && y < Number(yearFrom)) return false;
        if (yearTo && y > Number(yearTo)) return false;
      }

      return true;
    });
  }, [all, attrF, yearFrom, yearTo, cat]);

  const setAttr = (key, val) => setAttrF(prev => ({ ...prev, [key]: val }));
  const selectedMake = attrF['make'] || '';
  const modelOptions = getAutoModelOptions(selectedMake, { includeAll: true });

  if (!cat) return <Layout><Empty title="Категорія не знайдена"/></Layout>;

  const genericAttrs = cat.attrs.filter(
    a => a.filterable && a.filterType !== 'range' &&
      a.type !== 'auto-make' && a.type !== 'auto-model' && a.type !== 'auto-body'
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">{cat.name}</div>
          <div className="page-subtitle">{loading ? '...' : `${listings.length} оголошень`}</div>
        </div>
      </div>

      <div className="cf-wrap">
        {/* ── Стандартні фільтри ── */}
        <div className="cf-row">
          <div className="cf-group">
            <label>Ціна, грн</label>
            <div className="cf-range">
              <input className="input" type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="від" min="0"/>
              <span>—</span>
              <input className="input" type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)} placeholder="до" min="0"/>
            </div>
          </div>
          <div className="cf-group">
            <label>Місто</label>
            <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Будь-яке"/>
          </div>
          <div className="cf-group">
            <label>Сортування</label>
            <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="new">Спочатку нові</option>
              <option value="cheap">Спочатку дешеві</option>
              <option value="expensive">Спочатку дорогі</option>
            </select>
          </div>
          <div className="cf-check">
            <input type="checkbox" id="del" checked={delivery} onChange={e => setDelivery(e.target.checked)}/>
            <label htmlFor="del">Є доставка</label>
          </div>
        </div>

        {/* ── Фільтри авто ── */}
        {slug === 'auto' && (
          <div className="cf-row">
            <div className="cf-group">
              <label>Марка</label>
              <select className="select" value={selectedMake}
                onChange={e => { setAttr('make', e.target.value); setAttr('model', ''); }}>
                {BRAND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Модель</label>
              <select className="select" value={attrF['model'] || ''}
                onChange={e => setAttr('model', e.target.value)} disabled={!selectedMake}>
                {modelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Тип кузова</label>
              <select className="select" value={attrF['body'] || ''} onChange={e => setAttr('body', e.target.value)}>
                <option value="">Будь-який</option>
                {BODY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Рік випуску</label>
              <div className="cf-range">
                <input className="input" type="number" value={yearFrom} onChange={e => setYearFrom(e.target.value)} placeholder="від" min="1900" max="2025"/>
                <span>—</span>
                <input className="input" type="number" value={yearTo} onChange={e => setYearTo(e.target.value)} placeholder="до" min="1900" max="2025"/>
              </div>
            </div>
            <div className="cf-group">
              <label>Паливо</label>
              <select className="select" value={attrF['fuel'] || ''} onChange={e => setAttr('fuel', e.target.value)}>
                <option value="">Будь-яке</option>
                {FUEL.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>КПП</label>
              <select className="select" value={attrF['gearbox'] || ''} onChange={e => setAttr('gearbox', e.target.value)}>
                <option value="">Будь-яка</option>
                {GEARBOX.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Привід</label>
              <select className="select" value={attrF['drive'] || ''} onChange={e => setAttr('drive', e.target.value)}>
                <option value="">Будь-який</option>
                {DRIVE.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="cf-group">
              <label>Стан</label>
              <select className="select" value={attrF['condition'] || ''} onChange={e => setAttr('condition', e.target.value)}>
                <option value="">Будь-який</option>
                {AUTO_CONDITION.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Інші категорії — generic attrs ── */}
        {slug !== 'auto' && genericAttrs.length > 0 && (
          <div className="cf-row">
            {genericAttrs.map(a => (
              <div key={a.key} className="cf-group">
                <label>{a.label}</label>
                {a.type === 'select' ? (
                  <select className="select" value={attrF[a.key] || ''} onChange={e => setAttr(a.key, e.target.value)}>
                    <option value="">Будь-який</option>
                    {a.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="input" value={attrF[a.key] || ''} onChange={e => setAttr(a.key, e.target.value)} placeholder="Будь-який"/>
                )}
              </div>
            ))}
          </div>
        )}
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

      <style>{`
        .cf-wrap {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .cf-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 14px 16px;
          background: #fff;
          align-items: flex-end;
        }
        .cf-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 130px;
          flex: 1;
        }
        .cf-group label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cf-range {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cf-range .input {
          flex: 1;
          min-width: 0;
        }
        .cf-range span {
          color: var(--text-faint);
          flex-shrink: 0;
          font-size: 13px;
        }
        .cf-check {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-bottom: 10px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .cf-check input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
          cursor: pointer;
        }
        .cf-check label {
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin: 0;
        }
        @media (max-width: 640px) {
          .cf-group { min-width: calc(50% - 6px); }
          .cf-row { padding: 12px; gap: 10px; }
        }
      `}</style>
    </Layout>
  );
}
