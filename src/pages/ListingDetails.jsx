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
  const [soldModal, setSoldModal] = useState(false);

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
      const { data: sim } = await supabase.rpc('similar_listings', {
        p_id: id,
        p_title: data.title,
        p_category: data.category,
      });
      setSimilar(sim || []);
    })();
  }, [id]);

  if (!listing) return <Layout full><div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Завантаження...</div></Layout>;

  const photos = listing.photos || [];
  const isOwner = user?.id === listing.user_id;
  const isMod = profile?.role === 'admin' || profile?.role === 'moderator';

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
      listing_id: id,
      buyer_id: user.id,
      seller_id: listing.user_id,
    }).select().single();
    if (error) { console.error('create conversation error:', error); return; }
    if (data) nav(`/chat?c=${data.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Видалити це оголошення? Дія незворотна.')) return;
    await supabase.from('listings').delete().eq('id', id);
    nav('/');
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'sold' && listing.status !== 'sold') {
      setSoldModal(true);
      return;
    }
    setListing({ ...listing, status: newStatus });
    await supabase.from('listings').update({ status: newStatus }).eq('id', listing.id);
  };

  const confirmSold = async () => {
    setSoldModal(false);
    setListing({ ...listing, status: 'sold' });
    await supabase.from('listings').update({ status: 'sold' }).eq('id', listing.id);
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
                      <button className="btn btn-ghost btn-block" onClick={() => { if (!user) { nav('/login'); return; } setShowPhone(true); }}>
                        <IconPhone size={16}/> Показати телефон
                      </button>
                    )
                  )}
                  <button className="btn btn-ghost btn-block" onClick={() => { if (!user) { nav('/login'); return; } if (id) setFav(toggleFavorite(id)); }}>
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
              <p>Статус оголошення зміниться на «Продано». Щоб провести повний процес продажу з підтвердженням і відгуком — використовуйте чат.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSoldModal(false)}>Скасувати</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSold}>Підтвердити</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
