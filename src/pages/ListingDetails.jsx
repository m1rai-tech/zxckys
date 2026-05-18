import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ListingCard } from '../components/ListingCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  IconHeart, IconLocation, IconCalendar, IconPhone, IconMessage,
  IconEdit, IconTrash, IconStar, IconImage, IconClose, IconCheck, IconFlag
} from '../components/Icons';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { useCurrency } from '../contexts/CurrencyContext';
import { useMeta } from '../hooks/useMeta';

export default function ListingDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const { currency } = useCurrency();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [extras, setExtras] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [fav, setFav] = useState(false);
  const [soldModal, setSoldModal] = useState(false);
  const [boostModal, setBoostModal] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportOtherText, setReportOtherText] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    setFav(isFavorite(id));
    setPhotoIdx(0);
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();
      if (!data) return;
      setListing(data);
      // remember this listing so it shows up in "Recently viewed" on the home page
      const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      localStorage.setItem('recently_viewed', JSON.stringify([id, ...viewed.filter(v => v !== id)].slice(0, 20)));
      const { data: s } = await supabase.from('profiles').select('*').eq('id', data.user_id).maybeSingle();
      setSeller(s);
      const { data: e } = await supabase.from('listing_extras').select('*').eq('listing_id', id);
      setExtras(e || []);
      // similar_listings is a postgres function that matches by title keywords and same category
      const { data: sim } = await supabase.rpc('similar_listings', {
        p_id: id,
        p_title: data.title,
        p_category: data.category,
      });
      setSimilar(sim || []);
    })();
  }, [id]);

  useMeta({
    title: listing?.title,
    description: listing?.description?.slice(0, 160) || undefined,
    image: listing?.photos?.[0] || undefined,
  });

  if (!listing) return <Layout full><div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></Layout>;

  const photos = listing.photos || [];
  const isOwner = user?.id === listing.user_id;
  const isMod = profile?.role === 'admin' || profile?.role === 'moderator';

  const fmtPrice = () => {
    if (listing.is_free) return 'Free';
    if (listing.price == null || listing.price === '') return 'Negotiable';
    const num = Number(listing.price);
    if (isNaN(num)) return 'Negotiable';
    return `${currency.symbol}${num.toLocaleString('en-US')}`;
  };

  // open or create a conversation between this buyer and the seller
  const startChat = async () => {
    if (!user) { nav('/login'); return; }
    if (isOwner) return;
    const { data: existing } = await supabase.from('conversations')
      .select('id, hidden_for').eq('listing_id', id).eq('buyer_id', user.id).maybeSingle();
    if (existing) {
      // if the user deleted this chat before, un-hide it so they can start fresh
      if (existing.hidden_for?.includes(user.id)) {
        const updated = (existing.hidden_for || []).filter(uid => uid !== user.id);
        await supabase.from('conversations').update({ hidden_for: updated }).eq('id', existing.id);
      }
      nav(`/chat?c=${existing.id}`); return;
    }
    const { data, error } = await supabase.from('conversations').insert({
      listing_id: id,
      buyer_id: user.id,
      seller_id: listing.user_id,
    }).select().single();
    if (error) { console.error('create conversation error:', error); return; }
    if (data) nav(`/chat?c=${data.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This action cannot be undone.')) return;
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

  // sends user to Stripe checkout — on success Stripe webhook updates boosted_until in the DB
  const startBoost = async (plan) => {
    setBoosting(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, listingTitle: listing.title, plan }),
      });
      const { url, error } = await res.json();
      if (error) { alert(error); return; }
      window.location.href = url;
    } finally {
      setBoosting(false);
    }
  };

  const isBoosted = listing?.boosted_until && new Date(listing.boosted_until) > new Date();

  // upsert so the same user can't send duplicate reports for the same listing
  const submitReport = async () => {
    const finalReason = reportReason === 'Other' ? (reportOtherText.trim() || 'Other') : reportReason;
    if (!finalReason) return;
    setReportSubmitting(true);
    await supabase.from('reports').upsert({
      listing_id: id,
      reporter_id: user.id,
      reason: finalReason,
      status: 'pending',
    }, { onConflict: 'listing_id,reporter_id' });
    setReportSubmitting(false);
    setReportDone(true);
  };

  return (
    <Layout full>
      <div className="ld-page">
        <div className="ld-breadcrumbs">
          <Link to="/">Home</Link>
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
                    <div>No photo</div>
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
              <h2 className="ld-block-title">Description</h2>
              {listing.description ? (
                <div className="ld-desc">{listing.description}</div>
              ) : (
                <div className="text-muted">No description</div>
              )}
            </div>

            {extras.length > 0 && (
              <div className="ld-block">
                <h2 className="ld-block-title">Attributes</h2>
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

          </div>

          <aside className="ld-sidebar">
            <div className="ld-price-card">
              <h1 className="ld-title">{listing.title}</h1>
              <div className={`ld-price ${listing.is_free ? 'free' : ''}`}>{fmtPrice()}</div>

              <div className="ld-meta">
                <span><IconLocation size={14}/> {listing.location}</span>
                <span><IconCalendar size={14}/> {new Date(listing.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>

              <div className="ld-tags">
                {listing.delivery && <span className="ld-tag">Delivery</span>}
                {listing.status === 'sold' && <span className="ld-tag ld-tag-sold">Sold</span>}
                {listing.status === 'archived' && <span className="ld-tag">Archived</span>}
              </div>

              {isOwner ? (
                <div className="ld-actions">
                  <Link to={`/edit/${listing.id}`} className="btn btn-ghost btn-block">
                    <IconEdit size={16}/> Edit
                  </Link>
                  <select className="select" value={listing.status} onChange={(e) => handleStatusChange(e.target.value)}>
                    <option value="active">Status: Active</option>
                    <option value="sold">Status: Sold</option>
                    <option value="archived">Status: Archived</option>
                  </select>
                  <button
                    className="btn btn-block"
                    style={{ background: isBoosted ? '#fef9c3' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: isBoosted ? '#92400e' : '#fff', border: 'none' }}
                    onClick={() => !isBoosted && setBoostModal(true)}
                    disabled={isBoosted}
                  >
                    {isBoosted
                      ? `Boosted until ${new Date(listing.boosted_until).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
                      : 'Boost to top'}
                  </button>
                  <button className="btn btn-danger btn-block" onClick={handleDelete}>
                    <IconTrash size={16}/> Delete
                  </button>
                </div>
              ) : (
                <div className="ld-actions">
                  {listing.status === 'active' && (
                    <button className="btn btn-primary btn-block btn-lg" onClick={startChat}>
                      <IconMessage size={18}/> Message Seller
                    </button>
                  )}
                  {listing.show_phone && seller?.phone && (
                    showPhone ? (
                      <a href={`tel:${seller.phone}`} className="btn btn-ghost btn-block">
                        <IconPhone size={16}/> {seller.phone}
                      </a>
                    ) : (
                      <button className="btn btn-ghost btn-block" onClick={() => { if (!user) { nav('/login'); return; } setShowPhone(true); }}>
                        <IconPhone size={16}/> Show phone number
                      </button>
                    )
                  )}
                  <button className="btn btn-ghost btn-block" onClick={() => { if (!user) { nav('/login'); return; } if (id) setFav(toggleFavorite(id)); }}>
                  <IconHeart size={16} fill={fav}/> {fav ? 'In favorites' : 'Add to favorites'}
                  </button>
                  {user && !reportDone && (
                    <button className="btn btn-ghost btn-block" style={{ color: '#ef4444', fontSize: 13 }}
                      onClick={() => setReportModal(true)}>
                      <IconFlag size={14}/> Report listing
                    </button>
                  )}
                  {reportDone && (
                    <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                      Report submitted. We'll review it shortly.
                    </div>
                  )}
                  {isMod && (
                    <button className="btn btn-danger btn-block" onClick={handleDelete}>
                      <IconTrash size={16}/> Delete (moderator)
                    </button>
                  )}
                </div>
              )}
            </div>

            {seller && (
              <div className="ld-seller-card">
                <div className="ld-seller-label">Seller</div>
                <Link to={`/u/${seller.id}`} className="ld-seller-head">
                  <div className="avatar" style={{ width: 48, height: 48 }}>
                    {seller.avatar_url ? <img src={seller.avatar_url} alt=""/> : (seller.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ld-seller-name">{seller.name}</div>
                    <div className="ld-seller-meta">
                      {seller.rating > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706' }}>
                          <IconStar size={12} fill/> {Number(seller.rating).toFixed(1)} · {seller.deals_count || 0} deals
                        </span>
                      ) : 'New seller'}
                    </div>
                  </div>
                </Link>
                <div className="ld-seller-footer">
                  <div className="ld-seller-since">
                    Member since {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <Link to={`/u/${seller.id}`} className="ld-seller-link">All listings →</Link>
                </div>
              </div>
            )}

            <div className="ld-tips-card">
              <div className="ld-tips-title">Safety tips</div>
              <ul>
                <li>Meet in public places</li>
                <li>Inspect the item before paying</li>
                <li>Never send prepayment to strangers</li>
              </ul>
            </div>
          </aside>

          {similar.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h2 className="ld-section-title">Similar listings</h2>
              <div className="listings-grid">
                {similar.map((l) => <ListingCard key={l.id} listing={l}/>)}
              </div>
            </div>
          )}
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
              <h3>Confirm sale</h3>
              <p>The listing status will change to "Sold". To complete the full sale process with confirmation and a review — use chat.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSoldModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmSold}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Boost modal */}
      {boostModal && (
        <div className="ld-modal-overlay" onClick={() => setBoostModal(false)}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-head">
              <div className="ld-modal-icon" style={{ background: '#fef3c7', fontSize: 24 }}>⚡</div>
              <h3>Boost listing</h3>
              <p>Boosted listings appear at the top of search results and category pages.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-block"
                style={{ flex: 1, background: '#fff', border: '2px solid var(--border)', flexDirection: 'column', height: 'auto', padding: '14px 8px' }}
                disabled={boosting}
                onClick={() => startBoost('7d')}
              >
                <div style={{ fontWeight: 700, fontSize: 15 }}>7 days</div>
                <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 18 }}>$2.99</div>
              </button>
              <button
                className="btn btn-block"
                style={{ flex: 1, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', border: 'none', flexDirection: 'column', height: 'auto', padding: '14px 8px', position: 'relative' }}
                disabled={boosting}
                onClick={() => startBoost('30d')}
              >
                <div style={{ position: 'absolute', top: -10, right: 8, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>BEST VALUE</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>30 days</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>$7.99</div>
              </button>
            </div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={() => setBoostModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Report modal */}
      {reportModal && (
        <div className="ld-modal-overlay" onClick={() => { setReportModal(false); setReportReason(''); }}>
          <div className="ld-modal" onClick={e => e.stopPropagation()}>
            <div className="ld-modal-head">
              <div className="ld-modal-icon" style={{ background: '#fee2e2' }}>
                <IconFlag size={22} style={{ color: '#ef4444' }}/>
              </div>
              <h3>Report listing</h3>
              <p>Tell us what's wrong with this listing.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0' }}>
              {['Spam', 'Scam / fraud', 'Inappropriate content', 'Wrong category', 'Duplicate listing', 'Other'].map(r => (
                <label key={r} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${reportReason === r ? 'var(--accent)' : 'var(--border)'}`,
                  background: reportReason === r ? 'var(--accent-soft)' : '#fff',
                  transition: 'all .15s',
                }}>
                  <input type="radio" name="report_reason" value={r}
                    checked={reportReason === r}
                    onChange={() => setReportReason(r)}
                    style={{ accentColor: 'var(--accent)' }}/>
                  <span style={{ fontSize: 14 }}>{r}</span>
                </label>
              ))}
              {reportReason === 'Other' && (
                <textarea
                  autoFocus
                  placeholder="Describe the problem..."
                  value={reportOtherText}
                  onChange={e => setReportOtherText(e.target.value)}
                  maxLength={300}
                  style={{ width: '100%', border: '1.5px solid var(--accent)', borderRadius: 8, padding: '10px 12px', fontSize: 13, resize: 'none', minHeight: 80, outline: 'none', background: 'var(--bg-soft)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => { setReportModal(false); setReportReason(''); setReportOtherText(''); }}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!reportReason || (reportReason === 'Other' && !reportOtherText.trim()) || reportSubmitting}
                onClick={async () => { await submitReport(); setReportModal(false); setReportOtherText(''); }}>
                {reportSubmitting ? 'Sending...' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}
