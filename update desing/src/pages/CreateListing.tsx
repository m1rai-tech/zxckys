import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, getCategory } from '../lib/categories';
import { supabase } from '../lib/supabase';
import { IconClose, IconPlus, IconImage, IconCheck, IconLocation } from '../components/Icons';

const CITIES = ['Київ','Львів','Одеса','Харків','Дніпро','Запоріжжя','Вінниця','Полтава','Чернігів','Тернопіль','Івано-Франківськ','Ужгород','Луцьк','Рівне','Чернівці','Хмельницький','Житомир','Суми','Черкаси','Кропивницький','Миколаїв','Херсон'];

export default function CreateListing({ edit = false }: { edit?: boolean }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [showPhone, setShowPhone] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { if (!user) nav('/login'); }, [user, nav]);

  useEffect(() => {
    if (edit && id) {
      (async () => {
        const { data } = await supabase.from('listings').select('*').eq('id', id).single();
        if (data) {
          setTitle(data.title); setDescription(data.description || '');
          setPrice(data.price?.toString() || ''); setIsFree(data.is_free);
          setNegotiable(data.price == null && !data.is_free);
          setCategory(data.category); setLocation(data.location);
          setDelivery(data.delivery); setShowPhone(data.show_phone);
          setPhotos(data.photos || []);
        }
        const { data: ex } = await supabase.from('listing_extras').select('*').eq('listing_id', id);
        if (ex) {
          const map: Record<string, string> = {};
          ex.forEach((e: any) => { map[e.key] = e.value; });
          setExtras(map);
        }
      })();
    }
  }, [edit, id]);

  const cat = getCategory(category);

  const uploadFiles = async (files: File[]) => {
    if (!user || files.length === 0) return;
    setUploading(true);
    setErr('');
    const remaining = Math.max(0, 12 - photos.length);
    const toUpload = files.slice(0, remaining);

    // Parallel upload with unique paths
    const results = await Promise.all(
      toUpload.map(async (f) => {
        const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
        const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const path = `${user.id}/${safe}`;
        const { error } = await supabase.storage
          .from('listing-media')
          .upload(path, f, { cacheControl: '3600', upsert: false });
        if (error) {
          console.error('upload error', error);
          return null;
        }
        const { data } = supabase.storage.from('listing-media').getPublicUrl(path);
        return data.publicUrl;
      })
    );

    const successful = results.filter((u): u is string => !!u);
    if (successful.length) {
      setPhotos((prev) => [...prev, ...successful].slice(0, 12));
    }
    if (successful.length < toUpload.length) {
      setErr(`Не вдалося завантажити ${toUpload.length - successful.length} фото. Перевірте розмір та формат.`);
    }
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) uploadFiles(files);
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const arr = [...photos];
    [arr[from], arr[to]] = [arr[to], arr[from]];
    setPhotos(arr);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    setErr('');
    if (!title.trim()) { setErr('Введіть назву оголошення'); return; }
    if (!category) { setErr('Оберіть категорію'); return; }
    if (!location) { setErr('Оберіть місто'); return; }
    setSaving(true);

    const payload: any = {
      user_id: user.id, title, description,
      price: isFree || negotiable ? null : (price ? Number(price) : null),
      is_free: isFree, category, location, photos,
      delivery, show_phone: showPhone,
    };

    let listingId = id;
    if (edit && id) {
      const { error } = await supabase.from('listings').update(payload).eq('id', id);
      if (error) { setErr(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from('listings').insert(payload).select().single();
      if (error) { setErr(error.message); setSaving(false); return; }
      listingId = data.id;
    }

    if (listingId) {
      await supabase.from('listing_extras').delete().eq('listing_id', listingId);
      const rows = Object.entries(extras).filter(([_, v]) => v).map(([key, value]) => ({ listing_id: listingId, key, value }));
      if (rows.length) await supabase.from('listing_extras').insert(rows);
    }

    setSaving(false);
    nav(`/listing/${listingId}`);
  };

  const fmtPrice = () => {
    if (isFree) return 'Безкоштовно';
    if (negotiable || !price) return 'Договірна';
    return `${Number(price).toLocaleString('uk-UA')} грн`;
  };

  return (
    <Layout full>
      <div className="create-page">
        <div className="create-head">
          <h1>{edit ? 'Редагування оголошення' : 'Нове оголошення'}</h1>
          <p>Заповніть інформацію — це займе декілька хвилин</p>
        </div>

        {err && <div className="alert alert-error" style={{ maxWidth: 1200, margin: '0 auto 16px' }}>{err}</div>}

        <div className="create-grid">
          <form className="create-form" onSubmit={submit}>
            {/* SECTION 1: PHOTOS */}
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">1</span>
                <div>
                  <div className="section-title-2">Фотографії</div>
                  <div className="section-sub">До 12 фото. Перше фото буде головним. Перетягніть, щоб змінити порядок.</div>
                </div>
              </div>

              {photos.length === 0 ? (
                <label
                  className={`upload-zone ${dragOver?'drag':''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <div className="upload-icon"><IconImage size={32}/></div>
                  <div className="upload-title">{uploading ? 'Завантаження...' : 'Перетягніть фото сюди'}</div>
                  <div className="upload-sub">або натисніть, щоб обрати файли (до 12)</div>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) uploadFiles(Array.from(e.target.files));
                      e.target.value = '';
                    }}/>
                </label>
              ) : (
                <div className="photo-grid-2">
                  {photos.map((p, i) => (
                    <div key={p} className={`photo-item-2 ${i===0?'main':''}`}>
                      <img src={p} alt={`Фото ${i+1}`} loading="lazy"/>
                      {i === 0 && <span className="main-badge">Головне</span>}
                      <div className="photo-overlay">
                        {i > 0 && <button type="button" onClick={() => movePhoto(i, i-1)} className="overlay-btn" title="Вліво">←</button>}
                        {i < photos.length - 1 && <button type="button" onClick={() => movePhoto(i, i+1)} className="overlay-btn" title="Вправо">→</button>}
                        <button type="button" onClick={() => setPhotos(prev => prev.filter((_,j)=>j!==i))} className="overlay-btn danger" title="Видалити">
                          <IconClose size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {photos.length < 12 && (
                    <label className="photo-add-2">
                      <IconPlus size={20}/>
                      <span>{uploading ? 'Завантаження...' : `Додати (${photos.length}/12)`}</span>
                      <input type="file" accept="image/*" multiple style={{display:'none'}}
                        onChange={(e) => {
                          if (e.target.files) uploadFiles(Array.from(e.target.files));
                          e.target.value = '';
                        }}/>
                    </label>
                  )}
                </div>
              )}
            </section>

            {/* SECTION 2: BASIC INFO */}
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">2</span>
                <div>
                  <div className="section-title-2">Основна інформація</div>
                  <div className="section-sub">Що ви продаєте?</div>
                </div>
              </div>

              <div className="field">
                <label>Назва оголошення *</label>
                <input className="input" required value={title} onChange={e=>setTitle(e.target.value)}
                  placeholder="Наприклад: iPhone 13 Pro 256 GB" maxLength={80}/>
                <div className="hint">{title.length}/80 символів</div>
              </div>

              <div className="field">
                <label>Категорія *</label>
                <div className="cat-picker">
                  {CATEGORIES.map(c => (
                    <button key={c.slug} type="button"
                      className={`cat-tile ${category===c.slug?'selected':''}`}
                      onClick={() => setCategory(c.slug)}>
                      <c.Icon size={22}/>
                      <span>{c.name}</span>
                      {category===c.slug && <IconCheck size={14} className="cat-check"/>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Опис</label>
                <textarea className="textarea" value={description} onChange={e=>setDescription(e.target.value)}
                  placeholder="Розкажіть детально про товар: стан, комплектацію, особливості..." rows={6} maxLength={3000}/>
                <div className="hint">{description.length}/3000 символів</div>
              </div>
            </section>

            {/* SECTION 3: PRICE */}
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">3</span>
                <div>
                  <div className="section-title-2">Ціна</div>
                  <div className="section-sub">Оберіть тип ціни</div>
                </div>
              </div>

              <div className="price-options">
                <button type="button" className={`price-opt ${!isFree && !negotiable?'selected':''}`}
                  onClick={() => { setIsFree(false); setNegotiable(false); }}>
                  <div className="price-opt-title">Фіксована</div>
                  <div className="price-opt-sub">Точна ціна</div>
                </button>
                <button type="button" className={`price-opt ${negotiable?'selected':''}`}
                  onClick={() => { setNegotiable(true); setIsFree(false); }}>
                  <div className="price-opt-title">Договірна</div>
                  <div className="price-opt-sub">Обговорюється</div>
                </button>
                <button type="button" className={`price-opt ${isFree?'selected':''}`}
                  onClick={() => { setIsFree(true); setNegotiable(false); }}>
                  <div className="price-opt-title">Безкоштовно</div>
                  <div className="price-opt-sub">Віддам даром</div>
                </button>
              </div>

              {!isFree && !negotiable && (
                <div className="field" style={{ marginTop: 16 }}>
                  <label>Сума, грн *</label>
                  <div className="price-input">
                    <input className="input" type="number" min="0" value={price}
                      onChange={e=>setPrice(e.target.value)} placeholder="0"/>
                    <span className="price-currency">грн</span>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 4: LOCATION & DELIVERY */}
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">4</span>
                <div>
                  <div className="section-title-2">Локація і доставка</div>
                  <div className="section-sub">Де знаходиться товар?</div>
                </div>
              </div>

              <div className="field">
                <label>Місто *</label>
                <select className="select" value={location} onChange={e=>setLocation(e.target.value)}>
                  <option value="">Оберіть місто</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={delivery} onChange={e=>setDelivery(e.target.checked)}/>
                <div>
                  <div className="toggle-title">Доступна доставка</div>
                  <div className="toggle-sub">Відправлю покупцеві Новою поштою або іншим перевізником</div>
                </div>
              </label>
            </section>

            {/* SECTION 5: ATTRIBUTES (dynamic) */}
            {cat && cat.attrs.length > 0 && (
              <section className="create-section">
                <div className="section-head">
                  <span className="section-num">5</span>
                  <div>
                    <div className="section-title-2">Характеристики</div>
                    <div className="section-sub">Допоможе покупцю швидше прийняти рішення</div>
                  </div>
                </div>

                <div className="attrs-grid">
                  {cat.attrs.map(a => (
                    <div key={a.key} className="field" style={{ margin: 0 }}>
                      <label>{a.label}</label>
                      {a.type === 'select' ? (
                        <select className="select" value={extras[a.key] || ''}
                          onChange={e=>setExtras({ ...extras, [a.key]: e.target.value })}>
                          <option value="">—</option>
                          {a.options?.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="input" value={extras[a.key] || ''}
                          onChange={e=>setExtras({ ...extras, [a.key]: e.target.value })}/>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 6: CONTACTS */}
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">{cat && cat.attrs.length>0 ? 6 : 5}</span>
                <div>
                  <div className="section-title-2">Контакти</div>
                  <div className="section-sub">Як з вами зв'язатися</div>
                </div>
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={showPhone} onChange={e=>setShowPhone(e.target.checked)}/>
                <div>
                  <div className="toggle-title">Показувати номер телефону</div>
                  <div className="toggle-sub">Покупці зможуть подзвонити вам напряму</div>
                </div>
              </label>
              <div className="hint" style={{ marginTop: 8 }}>
                Чат буде доступний завжди, незалежно від цього налаштування
              </div>
            </section>

            {/* MOBILE SUBMIT */}
            <div className="mobile-submit">
              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
                {saving ? 'Збереження...' : (edit ? 'Зберегти зміни' : 'Опублікувати оголошення')}
              </button>
            </div>
          </form>

          {/* PREVIEW */}
          <aside className="create-preview">
            <div className="preview-card">
              <div className="preview-label">Прев'ю оголошення</div>
              <div className="preview-listing">
                <div className="preview-img">
                  {photos[0] ? <img src={photos[0]} alt=""/> : (
                    <div className="preview-img-empty"><IconImage size={32}/></div>
                  )}
                </div>
                <div className="preview-body">
                  <div className={`preview-price ${isFree?'free':''}`}>{fmtPrice()}</div>
                  <div className="preview-title">{title || 'Назва оголошення'}</div>
                  <div className="preview-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconLocation size={12}/> {location || 'Місто'}
                    </span>
                    {delivery && <span className="tag" style={{ padding: '2px 8px', fontSize: 11 }}>Доставка</span>}
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => submit()} className="btn btn-primary btn-block btn-lg" disabled={saving} style={{ marginTop: 16 }}>
                {saving ? 'Збереження...' : (edit ? 'Зберегти зміни' : 'Опублікувати')}
              </button>
              <button type="button" onClick={() => nav(-1)} className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
                Скасувати
              </button>

              <div className="preview-tips">
                <div className="tip-title">Поради для гарного оголошення</div>
                <ul>
                  <li>Додайте якісні фото з різних ракурсів</li>
                  <li>Опишіть стан та комплектацію</li>
                  <li>Вкажіть реальну ціну</li>
                  <li>Будьте чесні щодо недоліків</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .create-page { max-width: 1200px; margin: 0 auto; padding: 0 8px; }
        .create-head { padding: 24px 8px 8px; }
        .create-head h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 4px; }
        .create-head p { color: var(--text-muted); }

        .create-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }

        .create-form { display: flex; flex-direction: column; gap: 16px; }

        .create-section {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }
        .section-head {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .section-num {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        }
        .section-title-2 { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
        .section-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

        /* Upload zone */
        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          border: 2px dashed var(--border-strong);
          border-radius: 12px;
          background: var(--bg-soft);
          cursor: pointer;
          transition: all .15s;
          text-align: center;
        }
        .upload-zone:hover, .upload-zone.drag {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .upload-icon {
          width: 56px; height: 56px;
          border-radius: 14px;
          background: #fff;
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          border: 1px solid var(--border);
        }
        .upload-title { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
        .upload-sub { font-size: 13px; color: var(--text-muted); }

        /* Photo grid */
        .photo-grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px;
          width: 100%;
        }
        .photo-item-2 {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          isolation: isolate;
        }
        .photo-item-2.main { border: 2px solid var(--accent); }
        .photo-item-2 > img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .main-badge {
          position: absolute;
          top: 6px; left: 6px;
          background: var(--accent);
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 2;
        }
        .photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%);
          opacity: 0;
          transition: opacity .15s;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          padding: 8px;
        }
        .photo-item-2:hover .photo-overlay { opacity: 1; }
        .overlay-btn {
          width: 28px; height: 28px;
          border-radius: 6px;
          background: rgba(255,255,255,0.95);
          color: #111;
          font-size: 14px;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
        }
        .overlay-btn.danger { background: var(--danger); color: #fff; }
        .photo-add-2 {
          width: 100%;
          aspect-ratio: 1 / 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 1.5px dashed var(--border-strong);
          border-radius: 10px;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all .15s;
          text-align: center;
          padding: 8px;
        }
        .photo-add-2:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

        /* Category picker */
        .cat-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }
        .cat-tile {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 14px 8px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: #fff;
          color: var(--text);
          font-size: 12px;
          font-weight: 500;
          transition: all .15s;
          text-align: center;
        }
        .cat-tile svg { color: var(--text-muted); transition: color .15s; }
        .cat-tile:hover { border-color: var(--border-strong); }
        .cat-tile.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--accent);
        }
        .cat-tile.selected svg { color: var(--accent); }
        .cat-check {
          position: absolute;
          top: 6px; right: 6px;
          color: var(--accent);
        }

        /* Price options */
        .price-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .price-opt {
          padding: 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: #fff;
          text-align: left;
          transition: all .15s;
        }
        .price-opt:hover { border-color: var(--border-strong); }
        .price-opt.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .price-opt-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .price-opt.selected .price-opt-title { color: var(--accent); }
        .price-opt-sub { font-size: 12px; color: var(--text-muted); }

        .price-input { position: relative; }
        .price-input input { padding-right: 50px; font-size: 16px; font-weight: 600; }
        .price-currency {
          position: absolute;
          right: 14px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
        }

        /* Toggle row */
        .toggle-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color .15s;
        }
        .toggle-row:hover { border-color: var(--border-strong); }
        .toggle-row input { margin-top: 3px; width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
        .toggle-title { font-weight: 600; font-size: 14px; }
        .toggle-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        .attrs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        /* Preview */
        .create-preview { position: sticky; top: 88px; }
        .preview-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
        }
        .preview-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-faint);
          margin-bottom: 12px;
        }
        .preview-listing {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .preview-img {
          aspect-ratio: 4/3;
          background: var(--bg-soft);
        }
        .preview-img img { width: 100%; height: 100%; object-fit: cover; }
        .preview-img-empty {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-faint);
        }
        .preview-body { padding: 12px; }
        .preview-price { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .preview-price.free { color: var(--accent); }
        .preview-title {
          font-size: 13px;
          color: var(--text);
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .preview-meta {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .preview-tips {
          margin-top: 20px;
          padding: 14px;
          background: var(--bg-soft);
          border-radius: 10px;
        }
        .tip-title { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
        .preview-tips ul { padding-left: 18px; color: var(--text-muted); font-size: 12px; line-height: 1.7; }

        .mobile-submit { display: none; }

        @media (max-width: 900px) {
          .create-grid { grid-template-columns: 1fr; }
          .create-preview { display: none; }
          .mobile-submit { display: block; padding: 8px 0 24px; }
          .create-section { padding: 18px; }
        }
        @media (max-width: 540px) {
          .price-options { grid-template-columns: 1fr; }
          .cat-picker { grid-template-columns: repeat(2, 1fr); }
          .create-head h1 { font-size: 22px; }
        }
      `}</style>
    </Layout>
  );
}
