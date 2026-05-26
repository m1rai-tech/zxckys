import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, getCategory } from '../lib/categories';
import { CURRENCIES, useCurrency } from '../contexts/CurrencyContext';
import { supabase } from '../lib/supabase';
import { IconClose, IconPlus, IconImage, IconCheck, IconLocation } from '../components/Icons';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { compressImage } from '../lib/imageUtils';

function CustomSelect({ value, onChange, options, placeholder = '—' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
          width: '100%', height: 40, padding: '0 12px',
          background: '#fff',
          border: '1px solid',
          borderColor: open ? 'var(--accent)' : 'var(--border)',
          borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontSize: 14,
          color: value ? 'var(--text)' : 'var(--text-muted)',
          transition: 'border-color .15s',
        }}
      >
        <span>{value || placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 1000, maxHeight: 220, overflowY: 'auto',
          scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
        }}>
          {['', ...options].map(o => {
            const isSelected = (value || '') === o;
            return (
              <div
                key={o || '__empty__'}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  padding: '9px 12px', cursor: 'pointer', fontSize: 13,
                  background: isSelected ? 'var(--accent-soft)' : 'transparent',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  fontWeight: isSelected ? 600 : 400, transition: 'background .1s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{o || '—'}</span>
                {isSelected && value && <IconCheck size={13} style={{ flexShrink: 0, color: 'var(--accent)' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CreateListing({ edit = false }) {
  const { user, loading } = useAuth();
  const { currency: buyerCurrency } = useCurrency();
  const nav = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [listingCurrency, setListingCurrency] = useState(() => buyerCurrency?.code ?? 'USD');
  const [isFree, setIsFree] = useState(false);
  const [negotiable, setNegotiable] = useState(false);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [showPhone, setShowPhone] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [extras, setExtras] = useState({});
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [tappedPhoto, setTappedPhoto] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) nav('/login');
  }, [user, nav, loading]);

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
          if (data.currency) setListingCurrency(data.currency);
        }
        const { data: ex } = await supabase.from('listing_extras').select('*').eq('listing_id', id);
        if (ex) {
          const map = {};
          ex.forEach((e) => { map[e.key] = e.value; });
          setExtras(map);
        }
      })();
    }
  }, [edit, id]);

  const cat = getCategory(category);

  // Compress then upload photos; always stores as JPEG capped at 1920px.
  const uploadFiles = async (files) => {
    if (!user || files.length === 0 || uploading) return;
    setUploading(true);
    setErr('');
    const remaining = Math.max(0, 12 - photos.length);
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) { setUploading(false); return; }

    let failed = 0;
    for (const f of toUpload) {
      let blob;
      try {
        blob = await compressImage(f, { maxWidth: 1920, maxHeight: 1920, quality: 0.82 });
      } catch {
        failed++;
        continue;
      }
      const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
      const path = `${user.id}/${safe}`;
      const { error } = await supabase.storage
        .from('listing-media')
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: false });
      if (error) { failed++; continue; }
      const { data } = supabase.storage.from('listing-media').getPublicUrl(path);
      setPhotos((prev) => [...prev, data.publicUrl].slice(0, 12));
    }

    if (failed > 0) setErr(`Failed to upload ${failed} photo(s). Check file format.`);
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) uploadFiles(files);
  };

  const movePhoto = (from, to) => {
    if (to < 0 || to >= photos.length) return;
    const arr = [...photos];
    [arr[from], arr[to]] = [arr[to], arr[from]];
    setPhotos(arr);
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!user) return;
    if (!isFree && !negotiable && Number(price) < 0) { setErr('Price cannot be negative'); return; }
    setErr('');
    if (photos.length === 0) { setErr('Add at least one photo'); return; }
    if (!title.trim()) { setErr('Enter a listing title'); return; }
    if (!category) { setErr('Select a category'); return; }
    if (!location) { setErr('Select a city'); return; }
    setSaving(true);

    const payload = {
      user_id: user.id, title, description,
      price: isFree || negotiable ? null : (price ? Number(price) : null),
      currency: isFree || negotiable ? null : listingCurrency,
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
      // always wipe and re-insert extras so we don't leave stale attributes behind
      await supabase.from('listing_extras').delete().eq('listing_id', listingId);
      const rows = Object.entries(extras).filter(([_, v]) => v).map(([key, value]) => ({ listing_id: listingId, key, value }));
      if (rows.length) await supabase.from('listing_extras').insert(rows);
    }

    setSaving(false);
    nav(`/listing/${listingId}`);
  };

  const fmtPrice = () => {
    if (isFree) return 'Free';
    if (negotiable) return 'Negotiable';
    if (!price) return 'Enter price';
    const sym = CURRENCIES.find(c => c.code === listingCurrency)?.symbol ?? '$';
    return `${sym}${Number(price).toLocaleString('en-US')}`;
  };

  if (loading) return <Layout><div className="text-muted">Loading...</div></Layout>;

  return (
    <Layout full>
      <div className="create-page">
        <div className="create-head">
          <h1>{edit ? 'Edit Listing' : 'New Listing'}</h1>
          <p>Fill in the details — it only takes a few minutes</p>
        </div>

        {err && <div className="alert alert-error" style={{ maxWidth: 1200, margin: '0 auto 16px' }}>{err}</div>}

        <div className="create-grid">
          <form className="create-form" onSubmit={submit}>
            <section className="create-section">
              <div className="section-head">
                <span className="section-num">1</span>
                <div>
                  <div className="section-title-2">Photos</div>
                  <div className="section-sub">Up to 12 photos. The first photo will be the main one. Drag to reorder.</div>
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
                  <div className="upload-title">{uploading ? 'Uploading...' : 'Drag photos here'}</div>
                  <div className="upload-sub">or click to select files (up to 12)</div>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); e.target.value = ''; }}/>
                </label>
              ) : (
                <div className="photo-grid-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
                  {photos.map((p, i) => (
                    <div key={p}
                      // tapped class shows the overlay — needed on mobile where CSS :hover doesn't fire
      className={`photo-item-2 photo-size-mobile${tappedPhoto === i ? ' tapped' : ''}`}
                      style={{
                        position: 'relative', width: 200, height: 200, flexShrink: 0,
                        borderRadius: 10, overflow: 'hidden', boxSizing: 'border-box',
                        border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                        backgroundImage: `url(${p})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      onClick={(e) => {
                        if (e.target.closest('.overlay-btn')) return;
                        setTappedPhoto(tappedPhoto === i ? null : i);
                      }}
                    >
                      {i === 0 && <span className="main-badge">Main</span>}
                      <div className="photo-overlay">
                        {i > 0 && <button type="button" onClick={() => { movePhoto(i, i-1); setTappedPhoto(null); }} className="overlay-btn" title="Move left">←</button>}
                        {i < photos.length - 1 && <button type="button" onClick={() => { movePhoto(i, i+1); setTappedPhoto(null); }} className="overlay-btn" title="Move right">→</button>}
                        <button type="button" onClick={() => { setPhotos(prev => prev.filter((_,j)=>j!==i)); setTappedPhoto(null); }} className="overlay-btn danger" title="Delete">
                          <IconClose size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {photos.length < 12 && (
                    <label className="photo-size-mobile" style={{
                      width: 200, height: 200, flexShrink: 0, display: 'flex',
                      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 4, border: '1.5px dashed var(--border-strong)', borderRadius: 10,
                      color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                      transition: 'all .15s', textAlign: 'center', boxSizing: 'border-box',
                    }}>
                      <IconPlus size={20}/>
                      <span>{uploading ? 'Uploading...' : `Add (${photos.length}/12)`}</span>
                      <input type="file" accept="image/*" multiple style={{display:'none'}}
                        onChange={(e) => { if (e.target.files) uploadFiles(Array.from(e.target.files)); e.target.value = ''; }}/>
                    </label>
                  )}
                </div>
              )}
            </section>

            <section className="create-section">
              <div className="section-head">
                <span className="section-num">2</span>
                <div>
                  <div className="section-title-2">Basic Information</div>
                  <div className="section-sub">What are you selling?</div>
                </div>
              </div>

              <div className="field">
                <label>Listing title *</label>
                <input className="input" required value={title} onChange={e=>setTitle(e.target.value)}
                  placeholder="e.g. iPhone 13 Pro 256 GB" maxLength={80}/>
                <div className="hint">{title.length}/80 characters</div>
              </div>

              <div className="field">
                <label>Category *</label>
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
                <label>Description</label>
                <textarea className="textarea" value={description} onChange={e=>setDescription(e.target.value)}
                  placeholder="Describe the item in detail: condition, what's included, features..." rows={6} maxLength={3000}/>
                <div className="hint">{description.length}/3000 characters</div>
              </div>
            </section>

            <section className="create-section">
              <div className="section-head">
                <span className="section-num">3</span>
                <div>
                  <div className="section-title-2">Price</div>
                  <div className="section-sub">Choose a price type</div>
                </div>
              </div>

              <div className="price-options">
                <button type="button" className={`price-opt ${!isFree && !negotiable?'selected':''}`}
                  onClick={() => { setIsFree(false); setNegotiable(false); }}>
                  <div className="price-opt-title">Fixed</div>
                  <div className="price-opt-sub">Exact price</div>
                </button>
                <button type="button" className={`price-opt ${negotiable?'selected':''}`}
                  onClick={() => { setNegotiable(true); setIsFree(false); }}>
                  <div className="price-opt-title">Negotiable</div>
                  <div className="price-opt-sub">Open to offers</div>
                </button>
                <button type="button" className={`price-opt ${isFree?'selected':''}`}
                  onClick={() => { setIsFree(true); setNegotiable(false); }}>
                  <div className="price-opt-title">Free</div>
                  <div className="price-opt-sub">Giving away</div>
                </button>
              </div>

              {!isFree && !negotiable && (
                <>
                  <div className="field" style={{ marginTop: 16 }}>
                    <label>Currency</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {CURRENCIES.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          className={`price-opt${listingCurrency === c.code ? ' selected' : ''}`}
                          style={{ flex: 1, padding: '10px 14px' }}
                          onClick={() => setListingCurrency(c.code)}
                        >
                          <div className="price-opt-title">{c.symbol} {c.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 12 }}>
                    <label>Amount *</label>
                    <div className="price-input">
                      <input
                        className="input"
                        type="text"
                        value={price}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          const [int, dec] = val.split('.');
                          const limitedInt = int.slice(0, dec !== undefined ? 7 : 9);
                          setPrice(limitedInt + (dec !== undefined ? '.' + dec.slice(0, 2) : ''));
                        }}
                        placeholder="0"
                      />
                      <span className="price-currency">
                        {CURRENCIES.find(c => c.code === listingCurrency)?.symbol ?? '$'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="create-section">
              <div className="section-head">
                <span className="section-num">4</span>
                <div>
                  <div className="section-title-2">Location & Delivery</div>
                  <div className="section-sub">Where is the item located?</div>
                </div>
              </div>

              <div className="field">
                <label>City *</label>
                <LocationAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Start typing a city..."
                  style={{ width: '100%' }}
                />
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={delivery} onChange={e=>setDelivery(e.target.checked)}/>
                <div>
                  <div className="toggle-title">Delivery available</div>
                  <div className="toggle-sub">I will ship to the buyer via courier or postal service</div>
                </div>
              </label>
            </section>

            {cat && cat.attrs.length > 0 && (
              <section className="create-section">
                <div className="section-head">
                  <span className="section-num">5</span>
                  <div>
                    <div className="section-title-2">Attributes</div>
                    <div className="section-sub">Helps buyers make a faster decision</div>
                  </div>
                </div>

                <div className="attrs-grid">
                  {cat.attrs.map(a => (
                    <div key={a.key} className="field" style={{ margin: 0 }}>
                      <label>{a.label}</label>
                      {a.type === 'select' ? (
                        <CustomSelect
                          value={extras[a.key] || ''}
                          options={a.options || []}
                          onChange={v => setExtras({ ...extras, [a.key]: v })}
                        />
                      ) : (
                        <input className="input" value={extras[a.key] || ''}
                          maxLength={60}
                          onChange={e=>setExtras({ ...extras, [a.key]: e.target.value.slice(0, 60) })}/>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="create-section">
              <div className="section-head">
                <span className="section-num">{cat && cat.attrs.length>0 ? 6 : 5}</span>
                <div>
                  <div className="section-title-2">Contacts</div>
                  <div className="section-sub">How buyers can reach you</div>
                </div>
              </div>

              <label className="toggle-row">
                <input type="checkbox" checked={showPhone} onChange={e=>setShowPhone(e.target.checked)}/>
                <div>
                  <div className="toggle-title">Show phone number</div>
                  <div className="toggle-sub">Buyers will be able to call you directly</div>
                </div>
              </label>
              <div className="hint" style={{ marginTop: 8 }}>
                Chat is always available regardless of this setting
              </div>
            </section>

            <div className="mobile-submit">
              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={saving}>
                {saving ? 'Saving...' : (edit ? 'Save changes' : 'Post Listing')}
              </button>
            </div>
          </form>

          <aside className="create-preview">
            <div className="preview-card">
              <div className="preview-label">Listing preview</div>
              <div className="preview-listing">
                <div className="preview-img">
                  {photos[0] ? <img src={photos[0]} alt=""/> : (
                    <div className="preview-img-empty"><IconImage size={32}/></div>
                  )}
                </div>
                <div className="preview-body">
                  <div className={`preview-price ${isFree?'free':''}`}>{fmtPrice()}</div>
                  <div className="preview-title">{title || 'Listing title'}</div>
                  <div className="preview-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconLocation size={12}/> {location || 'City'}
                    </span>
                    {delivery && <span className="tag" style={{ padding: '2px 8px', fontSize: 11 }}>Delivery</span>}
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => submit()} className="btn btn-primary btn-block btn-lg" disabled={saving} style={{ marginTop: 16 }}>
                {saving ? 'Saving...' : (edit ? 'Save changes' : 'Post Ad')}
              </button>
              <button type="button" onClick={() => nav(-1)} className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
                Cancel
              </button>

              <div className="preview-tips">
                <div className="tip-title">Tips for a great listing</div>
                <ul>
                  <li>Add quality photos from different angles</li>
                  <li>Describe the condition and what's included</li>
                  <li>Set a fair price</li>
                  <li>Be honest about any defects</li>
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
        .create-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
        .create-form { display: flex; flex-direction: column; gap: 16px; padding-bottom: 32px; }
        .create-section { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .section-head { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .section-num { width: 32px; height: 32px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
        .section-title-2 { font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
        .section-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; border: 2px dashed var(--border-strong); border-radius: 12px; background: var(--bg-soft); cursor: pointer; transition: all .15s; text-align: center; }
        .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: var(--accent-soft); }
        .upload-icon { width: 56px; height: 56px; border-radius: 14px; background: #fff; color: var(--accent); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 1px solid var(--border); }
        .upload-title { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
        .upload-sub { font-size: 13px; color: var(--text-muted); }
        .photo-grid-2 { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; justify-content: flex-start; }
        .photo-item-2 { position: relative; width: 100px; height: 100px; min-height: 100px; flex-shrink: 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--bg-soft); box-sizing: border-box; }
        .photo-item-2.main { border: 2px solid var(--accent); }
        .photo-item-2 > img { width: 100% !important; height: 100% !important; max-height: 100px !important; object-fit: cover !important; display: block; }
        .main-badge { position: absolute; top: 6px; left: 6px; background: var(--accent); color: #fff; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; z-index: 2; }
        .photo-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%); opacity: 0; transition: opacity .15s; display: flex; align-items: flex-end; justify-content: center; gap: 4px; padding: 8px; box-sizing: border-box; }
        .photo-item-2:hover .photo-overlay, .photo-item-2.tapped .photo-overlay { opacity: 1; }
        .overlay-btn { width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.95); color: #111; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .overlay-btn.danger { background: var(--danger); color: #fff; }
        .photo-add-2 { width: 100px; height: 100px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 1.5px dashed var(--border-strong); border-radius: 10px; color: var(--text-muted); font-size: 12px; cursor: pointer; transition: all .15s; text-align: center; box-sizing: border-box; }
        .photo-add-2:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
        .cat-picker { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; }
        .cat-tile { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 8px; border: 1.5px solid var(--border); border-radius: 10px; background: #fff; color: var(--text); font-size: 12px; font-weight: 500; transition: all .15s; text-align: center; }
        .cat-tile svg { color: var(--text-muted); transition: color .15s; }
        .cat-tile:hover { border-color: var(--border-strong); }
        .cat-tile.selected { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
        .cat-tile.selected svg { color: var(--accent); }
        .cat-check { position: absolute; top: 6px; right: 6px; color: var(--accent); }
        .price-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .price-opt { padding: 14px; border: 1.5px solid var(--border); border-radius: 10px; background: #fff; text-align: left; transition: all .15s; }
        .price-opt:hover { border-color: var(--border-strong); }
        .price-opt.selected { border-color: var(--accent); background: var(--accent-soft); }
        .price-opt-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .price-opt.selected .price-opt-title { color: var(--accent); }
        .price-opt-sub { font-size: 12px; color: var(--text-muted); }
        .price-input { position: relative; }
        .price-input input { padding-right: 50px; font-size: 16px; font-weight: 600; }
        .price-currency { position: absolute; right: 15px; top: 50%; transform: translateY(calc(-50% + 1px)); color: var(--text-muted); font-size: 13px; font-weight: 500; }
        .toggle-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: border-color .15s; }
        .toggle-row:hover { border-color: var(--border-strong); }
        .toggle-row input { margin-top: 3px; width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
        .toggle-title { font-weight: 600; font-size: 14px; }
        .toggle-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .attrs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .create-preview { position: sticky; top: 88px; }
        .preview-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .preview-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-faint); margin-bottom: 12px; }
        .preview-listing { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .preview-img { aspect-ratio: 4/3; background: var(--bg-soft); }
        .preview-img img { width: 100%; height: 100%; object-fit: cover; }
        .preview-img-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-faint); }
        .preview-body { padding: 12px; }
        .preview-price { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .preview-price.free { color: var(--accent); }
        .preview-title { font-size: 13px; color: var(--text); margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .preview-meta { font-size: 12px; color: var(--text-muted); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .preview-tips { margin-top: 20px; padding: 14px; background: var(--bg-soft); border-radius: 10px; }
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
          .photo-grid-2 { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          .photo-size-mobile { width: 100% !important; height: auto !important; aspect-ratio: 1 !important; padding-bottom: 0 !important; }
        }
      `}</style>
    </Layout>
  );
}
