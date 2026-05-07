import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  IconHeart, IconLocation, IconCalendar, IconPhone, IconMessage,
  IconEdit, IconTrash, IconStar, IconImage, IconClose, IconCheck
} from '../components/Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';

export default function ListingDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [extras, setExtras] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [fav, setFav] = useState(false);

  // Sold flow
  const [soldModal, setSoldModal] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [confirmingBuyer, setConfirmingBuyer] = useState(null); // buyer to confirm

  // Review flow
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    setFav(isFavorite(id));
    setPhotoIdx(0);
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (!data) return;
      setListing(data);
      const { data: s } = await supabase.from('profiles').select('*').eq('id', data.user_id).maybeSingle();
      setSeller(s);
      const { data: e } = await supabase.from('listing_extras').select('*').eq('listing_id', id);
      setExtras(e || []);
      const { data: sim } = await supabase.from('listings').select('*')
        .eq('category', data.category).eq('status', 'active').neq('id', id).limit(8);
      setSimilar(sim || []);
    })();
  }, [id]);

  // Load existing review for current user as buyer
  useEffect(() => {
    if (!listing || !user || listing.status !== 'sold' || listing.buyer_id !== user.id) return;
    (async () => {
      const { data } = await supabase.from('reviews')
        .select('*').eq('listing_id', id).eq('reviewer_id', user.id).maybeSingle();
      if (data) setExistingReview(data);
    })();
  }, [listing, user, id]);

  if (!listing) return <Layout full><div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Завантаження...</div></Layout>;

  const photos = listing.photos || [];
  const isOwner = user?.id === listing.user_id;
  const isMod = profile?.role === 'admin' || profile?.role === 'moderator';
  const isBuyer = user?.id === listing.buyer_id && listing.status === 'sold';

  const fmtPrice = () => {
    if (listing.is_free) return 'Безкоштовно';
    if (listing.price == null || listing.price === '') return 'Договірна';
    const num = Number(listing.price);
    if (isNaN(num)) return 'Договірна';
    return `${num.toLocaleString('uk-UA')} грн`;
  };

  const startChat = async () => {
    if (!user) { nav('/login'); return; }
    if (isOwner) return;
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('listing_id', id).eq('buyer_id', user.id).maybeSingle();
    if (existing) { nav(`/chat?c=${existing.id}`); return; }
    const { data, error } = await supabase.from('conversations').insert({
      listing_id: id, buyer_id: user.id, seller_id: listing.user_id,
    }).select().single();
    if (!error && data) nav(`/chat?c=${data.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Видалити це оголошення? Дія незворотна.')) return;
    await supabase.from('listings').delete().eq('id', id);
    nav('/');
  };

  // Open sold modal — load buyers from conversations
  const openSoldModal = async () => {
    const { data } = await supabase.from('conversations')
      .select('buyer_id, buyer:profiles!conversations_buyer_id_fkey(id,name,avatar_url)')
      .eq('listing_id', id);
    const unique = [];
    const seen = new Set();
    (data || []).forEach(c => {
      if (c.buyer && !seen.has(c.buyer.id)) { seen.add(c.buyer.id); unique.push(c.buyer); }
    });
    setBuyers(unique);
    setSelectedBuyer(unique[0]?.id || null);
    setSoldModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'sold' && listing.status !== 'sold') {
      openSoldModal();
      return;
    }
    setListing({ ...listing, status: newStatus });
    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id);
  };

  const confirmSold = async () => {
    const buyerId = selectedBuyer;
    setSoldModal(false);
    const update = { status: 'sold', buyer_id: buyerId || null };
    setListing({ ...listing, ...update });
    await supabase.from('listings').update(update).eq('id', listing.id);
    // Increment seller's deals_count
    if (seller) {
      await supabase.from('profiles').update({ deals_count: (seller.deals_count || 0) + 1 }).eq('id', seller.id);
      setSeller({ ...seller, deals_count: (seller.deals_count || 0) + 1 });
    }
  };

  const submitReview = async () => {
    if (!reviewRating) return;
    setSubmittingReview(true);
    await supabase.from('reviews').insert({
      seller_id: listing.user_id,
      reviewer_id: user.id,
      listing_id: id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    });
    // Recalculate seller rating
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('seller_id', listing.user_id);
    if (allReviews?.length) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await supabase.from('profiles').update({ rating: parseFloat(avg.toFixed(2)) }).eq('id', listing.user_id);
    }
    setSubmittingReview(false);
    setReviewModal(false);
    setReviewDone(true);
    setExistingReview({ rating: reviewRating, comment: reviewComment });
  };

  return (
    <Layout full>
      <div className="ld-page">
        <div className="ld-breadcrumbs">
          <Link to="/">Головна</Link>
          <span>›</span>
          <Link to={`/c/${listing.category}`}>{listing.category}</Link>
          <span>›</span>
          <span className="ld-crumb-current">{listing.title}</span>
        </div>

        <div className="ld-grid">
          <div>
            <div className="ld-gallery">
              <div className="ld-main-photo" onClick={() => photos.length && setLightbox(true)}>
                {photos[photoIdx] ? (
                  <img src={photos[photoIdx]} alt={listing.title}/>
                ) : (
                  <div className="ld-no-photo">
                    <IconImage size={48}/>
                    <div>Фото відсутнє</div>
                  </div>
                )}
                {photos.length > 1 && (
                  <>
                    <button className="ld-arrow ld-arrow-prev" onClick={(e) => { e.stopPropagation(); setPhotoIdx(p => p === 0 ? photos.length - 1 : p - 1); }}>‹</button>
                    <button className="ld-arrow ld-arrow-next" onClick={(e) => { e.stopPropagation(); setPhotoIdx(p => p === photos.length - 1 ? 0 : p + 1); }}>›</button>
                    <div className="ld-counter">{photoIdx + 1} / {photos.length}</div>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="ld-thumbs">
                  {photos.map((p, i) => (
                    <button key={i} className={`ld-thumb ${i === photoIdx ? 'active' : ''}`} onClick={() => setPhotoIdx(i)}>
                      <img src={p} alt=""/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ld-block">
              <h2 className="ld-block-title">Опис</h2>
              {listing.description ? (
                <div className="ld-desc">{listing.description}</div>
              ) : (
                <div className="text-muted">Опис відсутній</div>
              )}
            </div>

            {extras.length > 0 && (
              <div className="ld-block">
                <h2 className="ld-block-title">Характеристики</h2>
                <div className="ld-attrs">
                  {extras.map((e) => (
                    <div key={e.id} className="ld-attr">
                      <span className="ld-attr-key">{e.key}</span>
                      <span className="ld-attr-val">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {similar.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h2 className="ld-section-title">Схожі оголошення</h2>
                <div className="listings-grid">
                  {similar.map((l) => <ListingCard key={l.id} listing={l}/>)}
                </div>
              </div>
            )}
          </div>

          <aside className="ld-sidebar">
            <div className="ld-price-card">
              <h1 className="ld-title">{listing.title}</h1>
              <div className={`ld-price ${listing.is_free ? 'free' : ''}`}>{fmtPrice()}</div>

              <div className="ld-meta">
                <span><IconLocation size={14}/> {listing.location}</span>
                <span><IconCalendar size={14}/> {new Date(listing.created_at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="ld-tags">
                {listing.delivery && <span className="ld-tag">Доставка</span>}
                {listing.status === 'sold' && <span className="ld-tag ld-tag-sold">Продано</span>}
                {listing.status === 'archived' && <span className="ld-tag">В архіві</span>}
              </div>

              {isOwner ? (
                <div className="ld-actions">
                  <Link to={`/edit/${listing.id}`} className="btn btn-ghost btn-block">
                    <IconEdit size={16}/> Редагувати
                  </Link>
                  <select className="select" value={listing.status} onChange={(e) => handleStatusChange(e.target.value)}>
                    <option value="active">Статус: Активне</option>
                    <option value="sold">Статус: Продано</option>
                    <option value="archived">Статус: В архіві</option>
                  </select>
                  <button className="btn btn-danger btn-block" onClick={handleDelete}>
                    <IconTrash size={16}/> Видалити
                  </button>
                </div>
              ) : (
                <div className="ld-actions">
                  {listing.status === 'active' && (
                    <button className="btn btn-primary btn-block btn-lg" onClick={startChat}>
                      <IconMessage size={18}/> Написати продавцю
                    </button>
                  )}
                  {listing.show_phone && seller?.phone && (
                    showPhone ? (
                      <a href={`tel:${seller.phone}`} className="btn btn-ghost btn-block">
                        <IconPhone size={16}/> {seller.phone}
                      </a>
                    ) : (
                      <button className="btn btn-ghost btn-block" onClick={() => setShowPhone(true)}>
                        <IconPhone size={16}/> Показати телефон
                      </button>
                    )
                  )}
                  <button className="btn btn-ghost btn-block" onClick={() => { if (id) setFav(toggleFavorite(id)); }}>
                    <IconHeart size={16} fill={fav}/> {fav ? 'В обраному' : 'Додати в обране'}
                  </button>
                  {isMod && (
                    <button className="btn btn-danger btn-block" onClick={handleDelete}>
                      <IconTrash size={16}/> Видалити (модератор)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Review card for buyer */}
            {isBuyer && !existingReview && !reviewDone && (
              <div className="ld-review-prompt">
                <div className="ld-review-prompt-title">Угода відбулась?</div>
                <div className="ld-review-prompt-sub">Залиште відгук про продавця — це допоможе іншим покупцям</div>
                <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={() => setReviewModal(true)}>
                  <IconStar size={15}/> Залишити відгук
                </button>
              </div>
            )}

            {isBuyer && (existingReview || reviewDone) && (
              <div className="ld-review-done">
                <IconCheck size={20}/>
                <div>
                  <div style={{ fontWeight: 600 }}>Відгук залишено</div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                    {[1,2,3,4,5].map(i => <IconStar key={i} size={14} fill={i <= (existingReview?.rating || reviewRating)}/>)}
                  </div>
                </div>
              </div>
            )}

            {seller && (
              <div className="ld-seller-card">
                <div className="ld-seller-label">Продавець</div>
                <Link to={`/u/${seller.id}`} className="ld-seller-head">
                  <div className="avatar" style={{ width: 48, height: 48 }}>
                    {seller.avatar_url ? <img src={seller.avatar_url} alt=""/> : (seller.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ld-seller-name">{seller.name}</div>
                    <div className="ld-seller-meta">
                      {seller.rating > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706' }}>
                          <IconStar size={12} fill/> {Number(seller.rating).toFixed(1)} · {seller.deals_count || 0} угод
                        </span>
                      ) : 'Новий продавець'}
                    </div>
                  </div>
                </Link>
                <div className="ld-seller-footer">
                  <div className="ld-seller-since">
                    На сайті з {new Date(seller.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                  </div>
                  <Link to={`/u/${seller.id}`} className="ld-seller-link">Усі оголошення →</Link>
                </div>
              </div>
            )}

            <div className="ld-tips-card">
              <div className="ld-tips-title">Поради щодо безпеки</div>
              <ul>
                <li>Зустрічайтесь у людних місцях</li>
                <li>Перевіряйте товар перед оплатою</li>
                <li>Не переказуйте передоплату незнайомим</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && photos[photoIdx] && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="close"><IconClose/></button>
          <img src={photos[photoIdx]} alt="" onClick={e => e.stopPropagation()}/>
          {photos.length > 1 && (
            <>
              <button className="ld-arrow ld-arrow-prev" style={{ position: 'fixed', left: 24, top: '50%' }}
                onClick={(e) => { e.stopPropagation(); setPhotoIdx(p => p === 0 ? photos.length - 1 : p - 1); }}>‹</button>
              <button className="ld-arrow ld-arrow-next" style={{ position: 'fixed', right: 24, top: '50%' }}
                onClick={(e) => { e.stopPropagation(); setPhotoIdx(p => p === photos.length - 1 ? 0 : p + 1); }}>›</button>
            </>
          )}
        </div>
      )}

      {/* Sold modal */}
      {soldModal && (
        <div className="ld-modal-overlay" onClick={() => setSoldModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-head">
              <div className="ld-modal-icon" style={{ background: '#dcfce7' }}>
                <IconCheck size={24} style={{ color: 'var(--accent)' }}/>
              </div>
              <h3>Підтвердити продаж</h3>
              <p>Виберіть покупця, якому продали товар. Йому буде запропоновано залишити відгук.</p>
            </div>

            {buyers.length > 0 ? (
              <div className="ld-buyers-list">
                {buyers.map(b => (
                  <label key={b.id} className={`ld-buyer-row ${selectedBuyer === b.id ? 'selected' : ''}`}>
                    <input type="radio" name="buyer" value={b.id} checked={selectedBuyer === b.id}
                      onChange={() => setSelectedBuyer(b.id)} style={{ display: 'none' }}/>
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
                      {b.avatar_url ? <img src={b.avatar_url}/> : (b.name?.[0] || 'U').toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontWeight: 600 }}>{b.name}</span>
                    {selectedBuyer === b.id && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconCheck size={12} style={{ color: '#fff' }}/>
                      </div>
                    )}
                  </label>
                ))}
                <label className={`ld-buyer-row ${selectedBuyer === null ? 'selected' : ''}`}>
                  <input type="radio" name="buyer" checked={selectedBuyer === null}
                    onChange={() => setSelectedBuyer(null)} style={{ display: 'none' }}/>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 16, flexShrink: 0, background: 'var(--bg-soft)', color: 'var(--text-muted)' }}>?</div>
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>Не вказувати покупця</span>
                  {selectedBuyer === null && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconCheck size={12} style={{ color: '#fff' }}/>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                Немає покупців з переписки. Можна продати без вибору.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSoldModal(false)}>Скасувати</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSold}>Підтвердити продаж</button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="ld-modal-overlay" onClick={() => setReviewModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-head">
              <div className="ld-modal-icon" style={{ background: '#fef9c3' }}>
                <IconStar size={24} style={{ color: '#d97706' }}/>
              </div>
              <h3>Відгук про продавця</h3>
              <p>Розкажіть про свій досвід покупки: <strong>{listing.title}</strong></p>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '8px 0 20px' }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: i <= (reviewHover || reviewRating) ? '#d97706' : 'var(--border)', transition: 'color .1s, transform .1s', transform: reviewHover === i ? 'scale(1.2)' : 'scale(1)' }}
                  onClick={() => setReviewRating(i)}
                  onMouseEnter={() => setReviewHover(i)}
                  onMouseLeave={() => setReviewHover(0)}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
            {reviewRating > 0 && (
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, marginTop: -12 }}>
                {['', 'Жахливо', 'Погано', 'Нормально', 'Добре', 'Відмінно'][reviewRating]}
              </div>
            )}

            <div className="field" style={{ margin: 0 }}>
              <label>Коментар (необов'язково)</label>
              <textarea className="textarea" rows={3} maxLength={500}
                placeholder="Розкажіть деталі угоди..."
                value={reviewComment} onChange={e => setReviewComment(e.target.value)}/>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setReviewModal(false)}>Скасувати</button>
              <button className="btn btn-primary" style={{ flex: 1 }} disabled={!reviewRating || submittingReview} onClick={submitReview}>
                {submittingReview ? 'Відправка...' : 'Надіслати відгук'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ld-page { max-width: 1200px; margin: 0 auto; padding: 16px; }
        .ld-breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); margin-bottom: 16px; flex-wrap: wrap; }
        .ld-breadcrumbs a { color: var(--text-muted); transition: color .15s; }
        .ld-breadcrumbs a:hover { color: var(--accent); }
        .ld-crumb-current { color: var(--text); font-weight: 500; }
        .ld-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
        .ld-gallery { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
        .ld-main-photo { aspect-ratio: 4/3; background: var(--bg-soft); position: relative; display: flex; align-items: center; justify-content: center; cursor: zoom-in; overflow: hidden; }
        .ld-main-photo img { width: 100%; height: 100%; object-fit: contain; }
        .ld-no-photo { color: var(--text-faint); display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .ld-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.95); color: #111; border: 1px solid var(--border); font-size: 20px; display: flex; align-items: center; justify-content: center; z-index: 2; transition: all .15s; }
        .ld-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.05); }
        .ld-arrow-prev { left: 12px; }
        .ld-arrow-next { right: 12px; }
        .ld-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .ld-thumbs { display: flex; gap: 6px; padding: 8px; overflow-x: auto; border-top: 1px solid var(--border); }
        .ld-thumb { width: 64px; height: 64px; flex-shrink: 0; border-radius: 6px; overflow: hidden; border: 2px solid transparent; background: var(--bg-soft); padding: 0; }
        .ld-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ld-thumb.active { border-color: var(--accent); }
        .ld-block { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
        .ld-block-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.01em; }
        .ld-desc { white-space: pre-wrap; line-height: 1.7; color: var(--text); font-size: 14px; }
        .ld-section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.01em; }
        .ld-attrs { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
        .ld-attr { display: flex; justify-content: space-between; padding: 10px 14px; background: var(--bg-soft); border-radius: 8px; font-size: 13px; }
        .ld-attr-key { color: var(--text-muted); text-transform: capitalize; }
        .ld-attr-val { font-weight: 600; }
        .ld-sidebar { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 12px; }
        .ld-price-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
        .ld-title { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3; margin-bottom: 8px; }
        .ld-price { font-size: 32px; font-weight: 800; color: var(--text); margin-bottom: 16px; letter-spacing: -0.02em; }
        .ld-price.free { color: var(--accent); font-size: 28px; }
        .ld-meta { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; margin-bottom: 12px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-muted); }
        .ld-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .ld-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .ld-tag { background: var(--bg-soft); border: 1px solid var(--border); padding: 4px 10px; border-radius: 16px; font-size: 12px; color: var(--text); }
        .ld-tag-sold { background: #fdf2f1; color: var(--danger); border-color: #f5d4d0; }
        .ld-actions { display: flex; flex-direction: column; gap: 8px; }
        .ld-seller-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .ld-seller-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-faint); margin-bottom: 12px; }
        .ld-seller-head { display: flex; align-items: center; gap: 12px; padding: 8px 0; color: var(--text); }
        .ld-seller-name { font-weight: 600; font-size: 15px; }
        .ld-seller-meta { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .ld-seller-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
        .ld-seller-since { color: var(--text-muted); }
        .ld-seller-link { color: var(--accent); font-weight: 600; }
        .ld-tips-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .ld-tips-title { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
        .ld-tips-card ul { padding-left: 18px; color: var(--text-muted); font-size: 13px; line-height: 1.7; }
        .ld-review-prompt { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; }
        .ld-review-prompt-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; color: var(--accent); }
        .ld-review-prompt-sub { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
        .ld-review-done { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; color: var(--accent); }
        .ld-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(2px); }
        .ld-modal { background: var(--bg-card); border-radius: 16px; padding: 28px; max-width: 440px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); border: 1px solid var(--border); }
        .ld-modal-head { text-align: center; margin-bottom: 20px; }
        .ld-modal-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .ld-modal-head h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px; }
        .ld-modal-head p { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.5; }
        .ld-buyers-list { display: flex; flex-direction: column; gap: 6px; }
        .ld-buyer-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 2px solid var(--border); cursor: pointer; transition: all .15s; }
        .ld-buyer-row:hover { border-color: var(--accent); background: var(--accent-soft); }
        .ld-buyer-row.selected { border-color: var(--accent); background: var(--accent-soft); }
        @media (max-width: 900px) {
          .ld-grid { grid-template-columns: 1fr; }
          .ld-sidebar { position: static; }
          .ld-title { font-size: 20px; }
          .ld-price { font-size: 28px; }
        }
      `}</style>
    </Layout>
  );
}
