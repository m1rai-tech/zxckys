import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  IconHeart, IconLocation, IconCalendar, IconPhone, IconMessage,
  IconEdit, IconTrash, IconStar, IconImage, IconClose, IconChevronDown
} from '../components/Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { getCategory } from '../lib/categories';

export default function ListingDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [extras, setExtras] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [fav, setFav] = useState(false);

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

  if (!listing) return <Layout><div className="text-muted">Завантаження...</div></Layout>;

  const photos = listing.photos || [];
  const isOwner = user?.id === listing.user_id;
  const cat = getCategory(listing.category);

  const fmtPrice = () => {
    if (listing.is_free) return 'Безкоштовно';
    if (listing.price == null) return 'Договірна';
    return `${Number(listing.price).toLocaleString('uk-UA')} грн`;
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
    if (!confirm('Видалити оголошення? Цю дію неможливо скасувати.')) return;
    await supabase.from('listings').delete().eq('id', id);
    nav('/');
  };

  const dateStr = new Date(listing.created_at).toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <Layout full>
      <div className="ld-page">
        <div className="ld-breadcrumbs">
          <Link to="/">Головна</Link>
          <span>/</span>
          {cat && <><Link to={`/c/${cat.slug}`}>{cat.name}</Link><span>/</span></>}
          <span className="ld-bc-current">{listing.title}</span>
        </div>

        <div className="ld-grid">
          <div className="ld-main">
            <div className="ld-gallery">
              <div className="ld-gallery-main" onClick={() => photos.length && setLightbox(true)}>
                {photos[photoIdx] ? (
                  <>
                    <img src={photos[photoIdx]} alt={listing.title}/>
                    {photos.length > 1 && (
                      <>
                        <button className="ld-nav prev" onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx - 1 + photos.length) % photos.length); }}>
                          <span className="rot-90"><IconChevronDown size={20}/></span>
                        </button>
                        <button className="ld-nav next" onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx + 1) % photos.length); }}>
                          <span className="rot-270"><IconChevronDown size={20}/></span>
                        </button>
                        <div className="ld-counter">{photoIdx + 1} / {photos.length}</div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="ld-img-empty">
                    <IconImage size={48}/>
                    <span>Фото відсутнє</span>
                  </div>
                )}
              </div>
              {photos.length > 1 && (
                <div className="ld-thumbs">
                  {photos.map((p, i) => (
                    <button key={i} className={`ld-thumb ${i === photoIdx ? 'active' : ''}`}
                      onClick={() => setPhotoIdx(i)}>
                      <img src={p} alt=""/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ld-mobile-summary">
              <div className="ld-price">{fmtPrice()}</div>
              <h1 className="ld-title">{listing.title}</h1>
              <div className="ld-meta-row">
                <span><IconLocation size={14}/> {listing.location}</span>
                <span><IconCalendar size={14}/> {dateStr}</span>
              </div>
            </div>

            <div className="ld-card">
              <div className="ld-card-title">Опис</div>
              {listing.description ? (
                <div className="ld-description">{listing.description}</div>
              ) : (
                <div className="text-muted">Опис не вказано</div>
              )}
            </div>

            {extras.length > 0 && (
              <div className="ld-card">
                <div className="ld-card-title">Характеристики</div>
                <div className="ld-attrs">
                  {extras.map((e) => (
                    <div key={e.id} className="ld-attr">
                      <span className="ld-attr-key">{e.key}</span>
                      <span className="ld-attr-value">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(listing.delivery || listing.status !== 'active') && (
              <div className="ld-tags">
                {listing.delivery && <span className="ld-tag accent">✓ Доставка доступна</span>}
                {listing.status === 'sold' && <span className="ld-tag muted">Продано</span>}
                {listing.status === 'archived' && <span className="ld-tag muted">В архіві</span>}
              </div>
            )}
          </div>

          <aside className="ld-side">
            <div className="ld-card ld-summary">
              <div className="ld-price">{fmtPrice()}</div>
              <h1 className="ld-title">{listing.title}</h1>
              <div className="ld-meta-row">
                <span><IconLocation size={14}/> {listing.location}</span>
                <span><IconCalendar size={14}/> {dateStr}</span>
              </div>

              {isOwner ? (
                <div className="ld-actions">
                  <Link to={`/edit/${listing.id}`} className="btn btn-ghost btn-block">
                    <IconEdit size={16}/> Редагувати
                  </Link>
                  <select className="select" value={listing.status} onChange={async (e) => {
                    await supabase.from('listings').update({ status: e.target.value }).eq('id', listing.id);
                    setListing({ ...listing, status: e.target.value });
                  }}>
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
                  <button className="btn btn-primary btn-block btn-lg" onClick={startChat}>
                    <IconMessage size={18}/> Написати продавцю
                  </button>
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
                  <button
                    className={`btn btn-block ${fav ? 'btn-fav-active' : 'btn-ghost'}`}
                    onClick={() => { if (id) setFav(toggleFavorite(id)); }}>
                    <IconHeart size={16} fill={fav}/> {fav ? 'В обраному' : 'Додати в обране'}
                  </button>
                </div>
              )}
            </div>

            {seller && (
              <div className="ld-card ld-seller">
                <div className="ld-seller-label">ПРОДАВЕЦЬ</div>
                <Link to={`/u/${seller.id}`} className="ld-seller-head">
                  <div className="avatar avatar-md">
                    {seller.avatar_url ? <img src={seller.avatar_url} alt=""/> : (seller.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ld-seller-name">{seller.name}</div>
                    <div className="ld-seller-meta">
                      {seller.rating > 0 ? (
                        <span className="rating-inline">
                          <IconStar size={12} fill/> {Number(seller.rating).toFixed(1)} · {seller.deals_count || 0} {seller.deals_count === 1 ? 'угода' : 'угод'}
                        </span>
                      ) : 'Новий продавець'}
                    </div>
                  </div>
                </Link>
                <div className="ld-seller-bottom">
                  <div className="text-xs text-muted">
                    На сайті з {new Date(seller.created_at).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
                  </div>
                  <Link to={`/u/${seller.id}`} className="ld-seller-link">Усі оголошення →</Link>
                </div>
              </div>
            )}

            <div className="ld-card ld-tips">
              <div className="ld-card-title-sm">Поради щодо безпеки</div>
              <ul>
                <li>Зустрічайтесь у людних місцях</li>
                <li>Перевіряйте товар перед оплатою</li>
                <li>Не переказуйте передоплату незнайомим</li>
              </ul>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="ld-similar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Схожі оголошення</h2>
              {cat && <Link to={`/c/${cat.slug}`} style={{ color: 'var(--accent)', fontWeight: 500, fontSize: 14 }}>Усі в «{cat.name}» →</Link>}
            </div>
            <div className="listings-grid">
              {similar.map(l => <ListingCard key={l.id} listing={l}/>)}
            </div>
          </div>
        )}
      </div>

      {lightbox && photos[photoIdx] && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <button className="close"><IconClose/></button>
          <img src={photos[photoIdx]} alt="" onClick={e => e.stopPropagation()}/>
          {photos.length > 1 && (
            <>
              <button className="lb-nav prev" onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx - 1 + photos.length) % photos.length); }}>‹</button>
              <button className="lb-nav next" onClick={(e) => { e.stopPropagation(); setPhotoIdx((photoIdx + 1) % photos.length); }}>›</button>
              <div className="lb-counter">{photoIdx + 1} / {photos.length}</div>
            </>
          )}
        </div>
      )}

      <style>{`
        .ld-page { max-width: 1200px; margin: 0 auto; padding: 0 8px; }

        .ld-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 4px;
          font-size: 13px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .ld-breadcrumbs a { color: var(--text-muted); }
        .ld-breadcrumbs a:hover { color: var(--accent); }
        .ld-bc-current {
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }

        .ld-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
          align-items: start;
        }

        .ld-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

        .ld-gallery {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .ld-gallery-main {
          position: relative;
          aspect-ratio: 4/3;
          background: #f7f7f8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-in;
          overflow: hidden;
        }
        .ld-gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ld-img-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-faint);
          font-size: 13px;
        }
        .ld-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text);
          opacity: 0;
          transition: opacity .15s, background .15s;
        }
        .ld-gallery:hover .ld-nav { opacity: 1; }
        .ld-nav:hover { background: #fff; }
        .ld-nav.prev { left: 12px; }
        .ld-nav.next { right: 12px; }
        .rot-90 { display: flex; transform: rotate(90deg); }
        .rot-270 { display: flex; transform: rotate(-90deg); }
        .ld-counter {
          position: absolute;
          bottom: 12px; right: 12px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 12px;
        }
        .ld-thumbs {
          display: flex;
          gap: 6px;
          padding: 8px;
          overflow-x: auto;
          border-top: 1px solid var(--border);
        }
        .ld-thumb {
          flex-shrink: 0;
          width: 64px; height: 64px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          background: var(--bg-soft);
          padding: 0;
          cursor: pointer;
        }
        .ld-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ld-thumb.active { border-color: var(--accent); }

        .ld-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .ld-card-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .ld-card-title-sm {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .ld-description {
          white-space: pre-wrap;
          line-height: 1.7;
          color: var(--text);
          font-size: 14px;
        }

        .ld-attrs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0;
        }
        .ld-attr {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px dashed var(--border);
          font-size: 14px;
        }
        .ld-attr:last-child { border-bottom: none; }
        .ld-attr-key { color: var(--text-muted); }
        .ld-attr-value { font-weight: 500; text-align: right; }

        .ld-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ld-tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--border);
        }
        .ld-tag.accent { background: var(--accent-soft); color: var(--accent); border-color: #c8e0d4; }
        .ld-tag.muted { background: var(--bg-soft); color: var(--text-muted); }

        .ld-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: sticky;
          top: 88px;
        }

        .ld-price {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .ld-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.4;
          word-break: break-word;
        }
        .ld-meta-row {
          display: flex;
          gap: 14px;
          font-size: 13px;
          color: var(--text-muted);
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .ld-meta-row span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ld-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .btn-fav-active {
          background: #fdf2f1;
          color: var(--danger);
          border: 1px solid #f5d4d0;
        }
        .btn-fav-active:hover { background: #fae8e6; }

        .ld-seller-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--text-faint);
          margin-bottom: 12px;
        }
        .ld-seller-head {
          display: flex;
          gap: 12px;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .avatar.avatar-md { width: 48px; height: 48px; font-size: 18px; }
        .ld-seller-name {
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ld-seller-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .rating-inline {
          color: #d97706;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .ld-seller-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ld-seller-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--accent);
        }

        .ld-tips ul {
          padding-left: 16px;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .ld-similar {
          margin-top: 32px;
          padding-bottom: 32px;
        }

        .ld-mobile-summary { display: none; }

        .lb-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px; height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 28px;
          line-height: 1;
        }
        .lb-nav:hover { background: rgba(255,255,255,0.25); }
        .lb-nav.prev { left: 24px; }
        .lb-nav.next { right: 24px; }
        .lb-counter {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-size: 14px;
          opacity: 0.8;
        }

        @media (max-width: 960px) {
          .ld-grid { grid-template-columns: 1fr; }
          .ld-side { position: static; }
          .ld-summary { display: none; }
          .ld-mobile-summary {
            display: block;
            background: #fff;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .ld-page { padding: 0; }
          .ld-breadcrumbs { padding: 12px 16px; }
          .ld-gallery-main { aspect-ratio: 1/1; }
          .ld-gallery, .ld-card, .ld-mobile-summary {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          .ld-card { padding: 16px; }
          .ld-price { font-size: 24px; }
          .ld-title { font-size: 16px; }
          .ld-similar { padding: 0 16px 32px; }
        }
      `}</style>
    </Layout>
  );
}
