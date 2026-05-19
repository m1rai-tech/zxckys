import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconHeart, IconImage, IconLocation } from './Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getCategory } from '../lib/categories';

const fmtPrice = (l, symbol) => {
  if (l.is_free) return 'Free';
  if (l.price == null) return 'Negotiable';
  return `${symbol}${Number(l.price).toLocaleString('en-US')}`;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
  if (diff < 86400*7) return `${Math.floor(diff/86400)} d ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export function ListingCard({ listing }) {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [fav, setFav] = useState(false);
  useEffect(() => { setFav(isFavorite(listing.id)); }, [listing.id]);

  const handleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    setFav(toggleFavorite(listing.id));
  };

  const photo = listing.photos?.[0];

  const isBoosted = listing.boosted_until && new Date(listing.boosted_until) > new Date();
  const cat = getCategory(listing.category);

  return (
    <Link to={`/listing/${listing.id}`} className={`listing-card${isBoosted ? ' listing-card-boosted' : ''}`}>
      <button className={`fav-btn ${fav?'active':''}`} onClick={handleFav} aria-label="Add to favorites">
        <IconHeart size={16} fill={fav}/>
      </button>
      {isBoosted && (
        <span style={{
          position: 'absolute', top: 8, left: 8, zIndex: 2,
          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em',
        }}>⚡ TOP</span>
      )}
      <div className="img">
        {photo ? <img src={photo} alt={listing.title} loading="lazy"/> : (
          <div className="img-empty"><IconImage size={40}/></div>
        )}
        {listing.delivery && (
          <div style={{ position: 'absolute', bottom: 7, left: 7, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>Delivery</div>
        )}
      </div>
      <div className="body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={`price ${listing.is_free?'price-free':''}`} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtPrice(listing, currency.symbol)}</div>
          {cat && (
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0, maxWidth: '48%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cat.name}
            </span>
          )}
        </div>
        <div className="title">{listing.title}</div>
        <div className="meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconLocation size={12}/> {listing.location}
          </span>
          <span>{fmtDate(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;