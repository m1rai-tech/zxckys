import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { categories, getCategoryById } from '../data/categories';
import { Listing } from '../types';
import Sidebar from '../components/Sidebar';

const locations = ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Вінниця', 'Запоріжжя', 'Полтава', 'Івано-Франківськ', 'Чернівці', 'Суми', 'Рівне'];

export default function CreateListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [step, setStep] = useState(1);
  const [imgUrl, setImgUrl] = useState('');
  const [hoverPhoto, setHoverPhoto] = useState(-1);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [catId, setCatId] = useState('');
  const [loc, setLoc] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [attrs, setAttrs] = useState<Record<string, string | number>>({});
  const [delivery, setDelivery] = useState(false);
  const [showPhone, setShowPhone] = useState(true);

  const category = getCategoryById(catId);

  useEffect(() => {
    if (isEditing && id) fetchListing(id);
  }, []);

  const fetchListing = async (listingId: string) => {
    try {
      const { data } = await supabase.from('listings').select('*').eq('id', listingId).single();
      if (data) {
        const l = data as Listing;
        setTitle(l.title); setDescription(l.description);
        setPrice(l.price?.toString() || ''); setIsFree(l.is_free);
        setCatId(l.category_id); setLoc(l.location);
        setImages(l.images || []); setAttrs(l.attributes || {});
        setDelivery(l.has_delivery); setShowPhone(l.show_phone);
      }
    } catch { /* demo */ }
    finally { setFetching(false); }
  };

  const addImg = () => {
    if (imgUrl.trim() && images.length < 12) {
      setImages([...images, imgUrl.trim()]);
      setImgUrl('');
    }
  };

  const removeImg = (i: number) => setImages(images.filter((_, x) => x !== i));
  const swapImg = (a: number, b: number) => {
    const c = [...images]; [c[a], c[b]] = [c[b], c[a]]; setImages(c);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category) return;
    setLoading(true);
    const data = {
      title, description,
      price: isFree ? null : parseFloat(price) || null,
      is_free: isFree, category_id: catId, category_name: category.name,
      location: loc, images, attributes: attrs,
      has_delivery: delivery, show_phone: showPhone,
      user_id: user.id, status: 'active' as const,
    };
    try {
      if (isEditing && id) {
        await supabase.from('listings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
        navigate(`/listing/${id}`);
      } else {
        const { data: res } = await supabase.from('listings').insert(data).select('id').single();
        navigate(`/listing/${res?.id}`);
      }
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  if (!user) { navigate('/login'); return null; }
  if (fetching) return <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>;

  const s1ok = title && catId && loc && (isFree || price);
  const s3ok = description.length >= 10 && s1ok;

  return (
    <div style={S.page}>
      <Sidebar />
      <main style={S.main}>
        {/* Steps */}
        <div style={S.steps}>
          {[
            { n: 1, l: 'Основне' },
            { n: 2, l: 'Фото' },
            { n: 3, l: 'Підсумок' },
          ].map((s, i) => (
            <button key={s.n} onClick={() => step >= s.n && setStep(s.n)} style={{
              ...S.stepBtn,
              ...(step === s.n ? S.stepActive : {}),
              ...(step > s.n ? S.stepDone : {}),
            }}>
              <span style={{ ...S.stepDot, ...(step > s.n ? { background: '#2d6a4f', color: '#fff' } : {}) }}>
                {step > s.n ? '✓' : s.n}
              </span>
              {s.l}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <h2 style={S.cardTitle}>Основна інформація</h2>
                <p style={S.cardSub}>Заповніть основні дані оголошення</p>
              </div>
              <div style={S.body}>
                <div style={S.row}>
                  <div style={S.col}>
                    <label style={S.label}>Назва <span style={{ color: '#dc2626' }}>*</span></label>
                    <input className="form-input" value={title} onChange={e => setTitle(e.target.value.slice(0, 100))} placeholder="Наприклад: iPhone 15 Pro Max 256GB" />
                    <div style={S.hint}>{title.length}/100</div>
                  </div>
                  <div style={S.col}>
                    <label style={S.label}>Категорія <span style={{ color: '#dc2626' }}>*</span></label>
                    <select className="form-input form-select" value={catId} onChange={e => setCatId(e.target.value)}>
                      <option value="">Оберіть категорію</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={S.row}>
                  <div style={S.col}>
                    <label style={S.label}>Місто <span style={{ color: '#dc2626' }}>*</span></label>
                    <select className="form-input form-select" value={loc} onChange={e => setLoc(e.target.value)}>
                      <option value="">Оберіть місто</option>
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={S.col}>
                    <label style={S.label}>Ціна, ₴</label>
                    <div style={S.priceWrap}>
                      <label style={S.freeCheck}>
                        <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                        Безкоштовно
                      </label>
                      {!isFree && (
                        <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" min="0" style={{ maxWidth: 180 }} />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={S.label}>Опис <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea className="form-input form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Опишіть товар детально: стан, комплект, причина продажу..." rows={6} />
                  <div style={S.hint}>{description.length} символів (мін. 10)</div>
                </div>
              </div>
              <div style={S.foot}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Скасувати</button>
                <button type="button" className="btn btn-primary" disabled={!s1ok} onClick={() => setStep(2)}>Далі →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <h2 style={S.cardTitle}>Фотографії</h2>
                <p style={S.cardSub}>Додайте до 12 фото. Перше фото — головне. Використовуйте ← → для зміни порядку.</p>
              </div>
              <div style={S.body}>
                <div style={S.photoGrid}>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      style={S.photoCard}
                      onMouseEnter={() => setHoverPhoto(i)}
                      onMouseLeave={() => setHoverPhoto(-1)}
                    >
                      <img src={img} alt="" style={S.photoImg} />
                      {i === 0 && <span style={S.mainTag}>Головне</span>}
                      {hoverPhoto === i && (
                        <div style={S.photoActions}>
                          <button type="button" style={S.pBtn} onClick={() => removeImg(i)} title="Видалити">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                          {i > 0 && <button type="button" style={S.pBtn} onClick={() => swapImg(i, i - 1)} title="Вліво">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                          </button>}
                          {i < images.length - 1 && <button type="button" style={S.pBtn} onClick={() => swapImg(i, i + 1)} title="Вправо">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>}
                        </div>
                      )}
                    </div>
                  ))}

                  {images.length < 12 && (
                    <div style={S.addCard}>
                      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                        <input type="url" className="form-input" value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="URL" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImg())} style={{ fontSize: 12, padding: '6px 8px' }} />
                        <button type="button" style={{ ...S.pBtn, width: 30, height: 30 }} onClick={addImg}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                      <span style={S.photoCount}>{images.length}/12</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={S.foot}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Назад</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Далі →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <h2 style={S.cardTitle}>Деталі та підсумок</h2>
                <p style={S.cardSub}>Перевірте дані перед публікацією</p>
              </div>
              <div style={S.body}>
                {/* Category attrs */}
                {category && category.attributes.length > 0 && (
                  <div style={S.attrBlock}>
                    <h3 style={S.attrTitle}>Характеристики — {category.icon} {category.name}</h3>
                    <div style={S.attrsGrid}>
                      {category.attributes.map(a => (
                        <div key={a.name}>
                          <label style={S.label}>{a.name} {a.required && <span style={{ color: '#dc2626' }}>*</span>}</label>
                          {a.type === 'select' && a.options ? (
                            <select className="form-input form-select" value={attrs[a.name]?.toString() || ''} onChange={e => setAttrs({ ...attrs, [a.name]: e.target.value })}>
                              <option value="">—</option>
                              {a.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type={a.type === 'number' ? 'number' : 'text'} className="form-input" value={attrs[a.name]?.toString() || ''} onChange={e => setAttrs({ ...attrs, [a.name]: a.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div style={S.toggleBlock}>
                  <h3 style={S.attrTitle}>Налаштування</h3>
                  <label style={S.toggleItem}>
                    <div style={S.toggleLeft}>
                      <div style={S.toggleTitle}>Доставка</div>
                      <div style={S.toggleDesc}>Покупець зможе замовити доставку</div>
                    </div>
                    <div style={{ ...S.toggle, ...(delivery ? S.toggleOn : {}) }} onClick={() => setDelivery(!delivery)}>
                      <div style={{ ...S.toggleKnob, ...(delivery ? { transform: 'translateX(20px)' } : {}) }} />
                    </div>
                  </label>
                  <label style={S.toggleItem}>
                    <div style={S.toggleLeft}>
                      <div style={S.toggleTitle}>Показати телефон</div>
                      <div style={S.toggleDesc}>Інші побачать ваш номер</div>
                    </div>
                    <div style={{ ...S.toggle, ...(showPhone ? S.toggleOn : {}) }} onClick={() => setShowPhone(!showPhone)}>
                      <div style={{ ...S.toggleKnob, ...(showPhone ? { transform: 'translateX(20px)' } : {}) }} />
                    </div>
                  </label>
                </div>

                {/* Summary */}
                <div style={S.summaryBlock}>
                  <h3 style={S.attrTitle}>Підсумок оголошення</h3>
                  <div style={S.summaryGrid}>
                    <div style={S.sumItem}><span style={S.sumLabel}>Назва</span>{title}</div>
                    <div style={S.sumItem}><span style={S.sumLabel}>Категорія</span>{category?.icon} {category?.name}</div>
                    <div style={S.sumItem}><span style={S.sumLabel}>Місто</span>{loc}</div>
                    <div style={S.sumItem}><span style={S.sumLabel}>Ціна</span>{isFree ? 'Безкоштовно' : `${price || '0'} ₴`}</div>
                    <div style={S.sumItem}><span style={S.sumLabel}>Опис</span>{description.length} символів</div>
                    <div style={S.sumItem}><span style={S.sumLabel}>Фото</span>{images.length}</div>
                  </div>
                </div>
              </div>
              <div style={S.foot}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Назад</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15, fontWeight: 600 }} disabled={loading || !s3ok}>
                  {loading ? 'Публікація...' : (isEditing ? '💾 Зберегти' : '🚀 Опублікувати')}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  main: { flex: 1, padding: '24px 28px', maxWidth: 820 },
  steps: { display: 'flex', gap: 0, marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' },
  stepBtn: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#d1d5db', transition: 'all 150ms' },
  stepActive: { color: '#2d6a4f', fontWeight: 600 },
  stepDone: { color: '#2d6a4f' },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: '#f3f4f6', flexShrink: 0 },
  card: { background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardHead: { padding: '24px 28px 0' },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#9ca3af', marginBottom: 24 },
  body: { padding: '0 28px 24px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  col: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' },
  hint: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  priceWrap: { display: 'flex', alignItems: 'center', gap: 16 },
  freeCheck: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 },
  foot: { display: 'flex', justifyContent: 'space-between', padding: '16px 28px', borderTop: '1px solid var(--border)', background: '#fafbfc' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 },
  photoCard: { position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: '#f9fafb' },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  mainTag: { position: 'absolute', top: 6, left: 6, padding: '2px 7px', background: '#2d6a4f', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 4, letterSpacing: '0.3px' },
  photoActions: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  pBtn: { width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' },
  addCard: { aspectRatio: '1', borderRadius: 10, border: '2px dashed #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  photoCount: { fontSize: 10, color: '#9ca3af', fontWeight: 600 },
  attrBlock: { marginBottom: 24 },
  attrTitle: { fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#374151', paddingBottom: 8, borderBottom: '1px solid var(--border)' },
  attrsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  toggleBlock: { marginBottom: 24 },
  toggleItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' },
  toggleLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  toggleTitle: { fontSize: 14, fontWeight: 500 },
  toggleDesc: { fontSize: 12, color: '#9ca3af' },
  toggle: { width: 44, height: 24, borderRadius: 12, background: '#e5e7eb', position: 'relative', transition: 'background 150ms', flexShrink: 0 },
  toggleOn: { background: '#2d6a4f' },
  toggleKnob: { width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' },
  summaryBlock: { background: '#f9fafb', borderRadius: 10, padding: 20 },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' },
  sumItem: { fontSize: 13 },
  sumLabel: { color: '#9ca3af', display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 },
};
