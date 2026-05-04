import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Listing, Profile, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { getCategoryById } from '../data/categories';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [_reviews, _setReviews] = useState<Review[]>([]);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  const favorite = listing ? isFavorite(listing.id) : false;
  const isOwner = user && listing && user.id === listing.user_id;

  useEffect(() => {
    if (id) {
      fetchListing(id);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (id, name, email, rating, deals_count, created_at, avatar_url, bio, phone)
        `)
        .eq('id', listingId)
        .single();

      if (!error && data) {
        setListing(data as Listing);
        if (data.profiles) {
          setSeller(data.profiles as Profile);
        }
        // Increment views
        await supabase
          .from('listings')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', listingId);
        
        // Fetch similar listings
        fetchSimilarListings(data as Listing);
      } else {
        // Demo data
        const demoListing = getDemoListing();
        setListing(demoListing);
        setSeller({
          id: '1',
          name: 'Олександр',
          email: 'demo@example.com',
          rating: 4.8,
          deals_count: 47,
          created_at: '2023-01-15',
          updated_at: '2023-01-15',
          role: 'user',
        });
      }
    } catch (err) {
      console.error('Error:', err);
      const demoListing = getDemoListing();
      setListing(demoListing);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarListings = async (currentListing: Listing) => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('category_id', currentListing.category_id)
      .eq('status', 'active')
      .neq('id', currentListing.id)
      .limit(4);
    
    if (data) {
      setSimilarListings(data as Listing[]);
    }
  };

  const getDemoListing = (): Listing => ({
    id: '1',
    title: 'iPhone 15 Pro Max 256GB Natural Titanium',
    description: `Продаю новий iPhone 15 Pro Max, в запечатаній коробці.

Колір: Natural Titanium
Пам'ять: 256 GB

Телефон куплений в офіційному магазині Apple.
Гарантія 1 рік від дати покупки.
Чек є.

Доставка по Україні за мій рахунок.
Можлива оплата при отриманні.`,
    price: 55000,
    is_free: false,
    category_id: 'electronics',
    category_name: 'Техніка',
    location: 'Київ, Оболонь',
    user_id: '1',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    ],
    attributes: { 'Стан': 'Новий', 'Бренд': 'Apple', 'Гарантія': 'Є' },
    has_delivery: true,
    show_phone: true,
    views: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const handleDelete = async () => {
    if (!listing || !window.confirm('Видалити оголошення?')) return;
    
    await supabase.from('listings').delete().eq('id', listing.id);
    navigate('/my-listings');
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?listing=${listing?.id}&seller=${listing?.user_id}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number | null, isFree: boolean) => {
    if (isFree) return 'Безкоштовно';
    if (!price) return 'Ціна не вказана';
    return `${price.toLocaleString('uk-UA')} ₴`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#e5e5e5' }}>★</span>
    ));
  };

  if (loading) {
    return (
      <div className="container" style={styles.loading}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container" style={styles.empty}>
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">Оголошення не знайдено</h3>
          <p className="empty-state-text">Можливо, воно було видалено</p>
          <Link to="/" className="btn btn-primary">На головну</Link>
        </div>
      </div>
    );
  }

  const category = getCategoryById(listing.category_id);

  return (
    <div className="container" style={styles.page}>
      {/* Breadcrumbs */}
      <nav style={styles.breadcrumbs}>
        <Link to="/">Головна</Link>
        <span> / </span>
        <Link to={`/category/${category?.slug || ''}`}>{listing.category_name}</Link>
        <span> / </span>
        <span style={{ color: 'var(--color-text-secondary)' }}>{listing.title}</span>
      </nav>

      <div style={styles.content}>
        {/* Left: Images */}
        <div style={styles.images}>
          <div 
            style={styles.mainImage}
            onClick={() => setShowFullImage(true)}
          >
            {listing.images.length > 0 ? (
              <img 
                src={listing.images[selectedImage]} 
                alt={listing.title}
              />
            ) : (
              <div style={styles.placeholder}>📷</div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div style={styles.thumbnails}>
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    ...styles.thumbnail,
                    border: selectedImage === idx ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  }}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div style={styles.info}>
          <div style={styles.header}>
            <h1 style={styles.title}>{listing.title}</h1>
            <button
              onClick={() => toggleFavorite(listing.id)}
              style={styles.favoriteBtn}
            >
              {favorite ? '❤️' : '🤍'}
            </button>
          </div>

          <div style={styles.meta}>
            <span>{listing.location}</span>
            <span>•</span>
            <span>{formatDate(listing.created_at)}</span>
            <span>•</span>
            <span>{listing.views} переглядів</span>
          </div>

          <p style={styles.price}>
            {formatPrice(listing.price, listing.is_free)}
          </p>

          {/* Attributes */}
          {Object.keys(listing.attributes).length > 0 && (
            <div style={styles.attributes}>
              {Object.entries(listing.attributes).map(([key, value]) => (
                <div key={key} style={styles.attribute}>
                  <span style={styles.attributeName}>{key}</span>
                  <span style={styles.attributeValue}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.tags}>
            {listing.has_delivery && (
              <span className="badge badge-primary">📦 Доставка</span>
            )}
            {listing.status === 'sold' && (
              <span className="badge badge-error">Продано</span>
            )}
          </div>

          {/* Seller */}
          {seller && (
            <div style={styles.seller}>
              <div style={styles.sellerHeader}>
                <Link to={`/user/${seller.id}`} style={styles.sellerInfo}>
                  <div style={styles.sellerAvatar}>
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt="" />
                    ) : (
                      seller.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div style={styles.sellerName}>{seller.name}</div>
                    <div style={styles.sellerRating}>
                      {renderStars(Math.round(seller.rating))}
                      <span style={styles.ratingText}>
                        {seller.rating.toFixed(1)} ({seller.deals_count} угод)
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <p style={styles.sellerSince}>
                На сайті з {formatDate(seller.created_at)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            {isOwner ? (
              <>
                <Link 
                  to={`/listing/${listing.id}/edit`} 
                  className="btn btn-secondary"
                >
                  Редагувати
                </Link>
                <button 
                  className="btn btn-outline"
                  onClick={handleDelete}
                  style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                >
                  Видалити
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleContact}
                >
                  💬 Написати продавцю
                </button>
                {listing.show_phone && seller?.phone && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPhone(!showPhone)}
                  >
                    {showPhone ? `📞 ${seller.phone}` : '📞 Показати телефон'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Опис</h2>
        <p style={styles.description}>{listing.description}</p>
      </section>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Схожі оголошення</h2>
          <div style={styles.similarGrid}>
            {similarListings.map(item => (
              <Link key={item.id} to={`/listing/${item.id}`} className="card" style={styles.similarCard}>
                <div style={styles.similarImage}>
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} />
                  ) : (
                    <span>📷</span>
                  )}
                </div>
                <div style={styles.similarContent}>
                  <h4 style={styles.similarTitle}>{item.title}</h4>
                  <p style={styles.similarPrice}>
                    {formatPrice(item.price, item.is_free)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Full Image Modal */}
      {showFullImage && listing.images.length > 0 && (
        <div style={styles.modal} onClick={() => setShowFullImage(false)}>
          <button style={styles.modalClose} onClick={() => setShowFullImage(false)}>✕</button>
          <img 
            src={listing.images[selectedImage]} 
            alt=""
            style={styles.modalImage}
            onClick={(e) => e.stopPropagation()}
          />
          {listing.images.length > 1 && (
            <div style={styles.modalNav}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
                }}
              >
                ←
              </button>
              <span>{selectedImage + 1} / {listing.images.length}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev + 1) % listing.images.length);
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '24px 16px',
  },
  loading: {
    padding: '80px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  empty: {
    padding: '80px 0',
  },
  breadcrumbs: {
    fontSize: '0.875rem',
    marginBottom: '24px',
    color: 'var(--color-text-secondary)',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
  },
  '@media (min-width: 768px)': {
    content: {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  images: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mainImage: {
    aspectRatio: '4/3',
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
    color: 'var(--color-text-muted)',
  },
  thumbnails: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
  },
  thumbnail: {
    width: '80px',
    height: '60px',
    flexShrink: 0,
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    margin: 0,
  },
  favoriteBtn: {
    fontSize: '1.5rem',
    padding: '8px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
  },
  meta: {
    display: 'flex',
    gap: '8px',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    margin: 0,
  },
  attributes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--radius-md)',
  },
  attribute: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9375rem',
  },
  attributeName: {
    color: 'var(--color-text-secondary)',
  },
  attributeValue: {
    fontWeight: 500,
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  seller: {
    padding: '16px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
  },
  sellerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
  },
  sellerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 600,
    overflow: 'hidden',
  },
  sellerName: {
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '4px',
  },
  sellerRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.875rem',
  },
  ratingText: {
    marginLeft: '4px',
    color: 'var(--color-text-secondary)',
  },
  sellerSince: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-secondary)',
    marginTop: '12px',
    marginBottom: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  section: {
    marginTop: '48px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '16px',
  },
  description: {
    fontSize: '1rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  similarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  similarCard: {
    textDecoration: 'none',
  },
  similarImage: {
    aspectRatio: '4/3',
    backgroundColor: 'var(--color-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: 'var(--color-text-muted)',
    overflow: 'hidden',
  },
  similarContent: {
    padding: '12px',
  },
  similarTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    margin: '0 0 4px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  similarPrice: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
  },
  modal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
  },
  modalNav: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    color: 'white',
  },
};
