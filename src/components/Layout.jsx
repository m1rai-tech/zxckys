import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import { SupportWidget } from './SupportWidget';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import { CATEGORIES } from '../lib/categories';
import {
  IconSearch, IconHeart, IconMessage, IconUser, IconPlus,
  IconLogout, IconHome, IconSettings
} from './Icons';
import { getFavorites } from '../lib/favorites';
import { LocationAutocomplete } from './LocationAutocomplete';

function CurrencySelect({ currency, changeCurrency }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          height: 38,
          padding: '0 10px',
          background: 'var(--bg-soft)',
          border: '1px solid',
          borderColor: open ? 'var(--accent)' : 'var(--border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text)',
          transition: 'border-color .15s, background .15s',
          whiteSpace: 'nowrap',
          minWidth: 86,
        }}
      >
        <span style={{ flex: 1 }}>{currency.symbol} {currency.code}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            transition: 'transform .15s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 1000,
          minWidth: '100%',
          overflow: 'hidden',
        }}>
          {CURRENCIES.map(c => (
            <div
              key={c.code}
              onClick={() => { changeCurrency(c.code); setOpen(false); }}
              style={{
                padding: '9px 12px',
                cursor: 'pointer',
                fontSize: 13,
                background: currency.code === c.code ? 'var(--accent-soft)' : 'transparent',
                color: currency.code === c.code ? 'var(--accent)' : 'var(--text)',
                fontWeight: currency.code === c.code ? 600 : 400,
                transition: 'background .1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (currency.code !== c.code) e.currentTarget.style.background = 'var(--bg-soft)'; }}
              onMouseLeave={e => { if (currency.code !== c.code) e.currentTarget.style.background = 'transparent'; }}
            >
              {c.symbol} {c.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Layout({ children, full }) {
  const { user, profile, isBanned, signOut } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState('');
  // city is remembered between sessions — empty string means "show all cities"
  const [city, setCity] = useState(() => {
    const saved = localStorage.getItem('app_city') || '';
    return saved === 'All Ukraine' ? '' : saved;
  });
  const [showUser, setShowUser] = useState(false);
  const [favCount, setFavCount] = useState(getFavorites().length);

  useEffect(() => {
    const upd = () => setFavCount(getFavorites().length);
    window.addEventListener('favorites-changed', upd);
    window.addEventListener('storage', upd);
    return () => {
      window.removeEventListener('favorites-changed', upd);
      window.removeEventListener('storage', upd);
    };
  }, []);

  useEffect(() => { localStorage.setItem('app_city', city); }, [city]);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (city) params.set('city', city);
    nav(`/search?${params.toString()}`);
  };

  const initials = (profile?.name || user?.email || 'U').slice(0, 1).toUpperCase();
  // these pages have their own layout and don't need the extra search/city row
  const hideSubbar = loc.pathname === '/chat' || loc.pathname === '/me' || loc.pathname === '/my-listings' || loc.pathname === '/settings' || loc.pathname.startsWith('/u/');

  // fire a custom event so the home/search pages re-fetch without a full reload
  const handleCityChange = (val) => {
    setCity(val);
    localStorage.setItem('app_city', val);
    window.dispatchEvent(new CustomEvent('city-changed', { detail: val }));
    if (loc.pathname === '/search') {
      const params = new URLSearchParams(loc.search);
      if (val) params.set('city', val); else params.delete('city');
      nav(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            YOUR BRAND
          </Link>

          <form onSubmit={onSearch} className="search-wrap hdr-search" style={{ flex: 1, minWidth: 0 }}>
            <IconSearch size={18} />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search listings..."
              style={{ minWidth: 0, flex: 1 }}
            />
          </form>

          <LocationAutocomplete
            className="hdr-city"
            value={city}
            placeholder="City"
            onChange={handleCityChange}
          />

          <div className="hdr-currency-desktop">
            <CurrencySelect currency={currency} changeCurrency={changeCurrency} />
          </div>

          {user ? (
            <>
              <Link to="/create" className="btn btn-primary hdr-post" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                <IconPlus size={16} /> Post Ad
              </Link>
              <Link to="/favorites" className="icon-btn hdr-fav" title="Favorites">
                <IconHeart size={20} />
                {favCount > 0 && <span className="badge">{favCount}</span>}
              </Link>
              <Link to="/chat" className="icon-btn hdr-msg" title="Messages">
                <IconMessage size={20} />
              </Link>
              <div style={{ position: 'relative' }} className="hdr-avatar">
                <button className="avatar" onClick={() => setShowUser(s => !s)} style={{ width: 40, height: 40, fontSize: 14 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials}
                </button>
                {showUser && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowUser(false)} />
                    <div style={{
                      position: 'absolute', top: '110%', right: 0,
                      background: '#fff', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: 6,
                      minWidth: 220, zIndex: 50,
                      boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.name || 'User'}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                      <Link to="/me" className="sidebar-link" onClick={() => setShowUser(false)}>
                        <IconUser size={18} /> My Profile
                      </Link>
                      <Link to="/settings" className="sidebar-link" onClick={() => setShowUser(false)}>
                        <IconSettings size={18} /> Settings
                      </Link>
                      {(profile?.role === 'admin' || profile?.role === 'moderator') && (
                        <Link to="/admin" className="sidebar-link" onClick={() => setShowUser(false)}
                          style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          <IconSettings size={18} /> Admin Panel
                        </Link>
                      )}
                      <div className="sidebar-divider" />
                      <button className="sidebar-link" style={{ width: '100%', color: 'var(--danger)' }}
                        onClick={async () => { await signOut(); setShowUser(false); nav('/'); }}>
                        <IconLogout size={18} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hdr-auth-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <Link to="/login" className="btn btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      {!hideSubbar && <div className="mobile-subbar">
        <div className="mobile-subbar-row1">
          <LocationAutocomplete
            value={city}
            placeholder="City or region"
            style={{ flex: 1 }}
            onChange={handleCityChange}
          />
          <CurrencySelect currency={currency} changeCurrency={changeCurrency} />
        </div>
        <form onSubmit={onSearch} className="search-wrap mobile-subbar-search">
          <IconSearch size={16} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search listings..."
            style={{ minWidth: 0, flex: 1 }}
          />
        </form>
      </div>}

      {full ? (
        <>{children}</>
      ) : (
        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-title">Navigation</div>
            <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <IconHome size={18} /> Home
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <IconHeart size={18} /> Favorites
              {favCount > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{favCount}</span>}
            </NavLink>
            {user && (
              <NavLink to="/chat" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <IconMessage size={18} /> Messages
              </NavLink>
            )}
            <div className="sidebar-divider" />
            <div className="sidebar-title">Categories</div>
            {CATEGORIES.map(c => (
              <NavLink key={c.slug} to={`/c/${c.slug}`}
                className={({ isActive }) => `sidebar-link ${isActive || loc.pathname === `/c/${c.slug}` ? 'active' : ''}`}>
                <c.Icon size={18} /> {c.name}
              </NavLink>
            ))}
          </aside>
          <main className="content">{children}</main>
        </div>
      )}

      {!full && <Footer />}
      <SupportWidget />

      {isBanned && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: 16 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '36px 32px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: '1px solid #fca5a5' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 30 }}>🚫</div>
            <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: '#b91c1c' }}>Account Banned</h2>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Your account has been suspended by moderation.
            </p>
            {profile?.ban_reason && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#7f1d1d' }}>
                <strong>Reason:</strong> {profile.ban_reason}
              </div>
            )}
            {profile?.banned_until && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                Ban expires: <strong>{new Date(profile.banned_until).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
              </p>
            )}
            {!profile?.banned_until && (
              <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 14, fontWeight: 600 }}>Permanent ban</p>
            )}
            <button onClick={signOut} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <IconHome size={22} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <IconHeart size={22} />
            {favCount > 0 && <span style={{ position: 'absolute', top: -4, right: -6, background: 'var(--accent)', color: '#fff', fontSize: 9, minWidth: 14, height: 14, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontWeight: 700 }}>{favCount}</span>}
          </div>
          <span>Favorites</span>
        </NavLink>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Link to={user ? '/create' : '/login'} className="nav-post-btn">
            <IconPlus size={22} />
          </Link>
        </div>
        <NavLink to="/chat" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <IconMessage size={22} />
          <span>Chats</span>
        </NavLink>
        <NavLink to={user ? '/me' : '/login'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          {user ? (
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
          ) : (
            <IconUser size={22} />
          )}
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </NavLink>
      </nav>
    </div>
  );
}