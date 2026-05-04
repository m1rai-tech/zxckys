import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconHeart, IconImage, IconLocation } from './Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';

export type Listing = {
  id: string; title: string; price?: number | null; is_free: boolean;
  location: string; photos?: string[] | null; created_at: string; category?: string;
  status?: string;
};

const fmtPrice = (l: Listing) => {
  if (l.is_free) return 'Безкоштовно';
  if (l.price == null) return 'Договірна';
  return `${l.price.toLocaleString('uk-UA')} грн`;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'щойно';
  if (diff < 3600) return `${Math.floor(diff/60)} хв тому`;
  if (diff < 86400) return `${Math.floor(diff/3600)} год тому`;
  if (diff < 86400*7) return `${Math.floor(diff/86400)} д тому`;
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
};

export const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [fav, setFav] = useState(false);
  useEffect(() => { setFav(isFavorite(listing.id)); }, [listing.id]);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setFav(toggleFavorite(listing.id));
  };

  const photo = listing.photos?.[0];

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <button className={`fav-btn ${fav?'active':''}`} onClick={handleFav} aria-label="В обране">
        <IconHeart size={16} fill={fav}/>
      </button>
      <div className="img">
        {photo ? <img src={photo} alt={listing.title} loading="lazy"/> : (
          <div className="img-empty"><IconImage size={40}/></div>
        )}
      </div>
      <div className="body">
        <div className={`price ${listing.is_free?'price-free':''}`}>{fmtPrice(listing)}</div>
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
};
