import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import { useState } from 'react';

const cities = ['All Ukraine', 'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Lviv', 'Vinnytsia', 'Zaporizhzhia', 'Poltava'];

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          YOUR BRAND
        </Link>

        <form onSubmit={handleSearch} style={styles.searchWrap}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <div style={styles.cityWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <select style={styles.citySelect}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.cityWrap}>
          <select
            style={styles.citySelect}
            value={currency.code}
            onChange={e => changeCurrency(e.target.value)}
          >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>)}
          </select>
        </div>

        <div style={styles.right}>
          {user ? (
            <>
              <Link to="/create" style={styles.postBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Post Ad
              </Link>
              <button style={styles.iconBtn} onClick={() => navigate('/chat')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </button>
              <div style={{ position: 'relative' }}>
                <button style={styles.avatar} onClick={() => setShowMenu(!showMenu)}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={styles.avatarImg} />
                  ) : (
                    profile?.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </button>
                {showMenu && (
                  <>
                    <div style={styles.overlay} onClick={() => setShowMenu(false)} />
                    <div style={styles.dropdown}>
                      <div style={styles.dropdownHeader}>
                        <div style={styles.avatarSmall}>
                          {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={styles.dropdownName}>{profile?.name}</div>
                          <div style={styles.dropdownEmail}>{user.email}</div>
                        </div>
                      </div>
                      <div style={styles.divider} />
                      <Link to={`/user/${user.id}`} style={styles.dropdownItem} onClick={() => setShowMenu(false)}>Profile</Link>
                      <Link to="/my-listings" style={styles.dropdownItem} onClick={() => setShowMenu(false)}>My Listings</Link>
                      <Link to="/settings" style={styles.dropdownItem} onClick={() => setShowMenu(false)}>Settings</Link>
                      {profile?.role === 'admin' && (
                        <Link to="/admin" style={styles.dropdownItem} onClick={() => setShowMenu(false)}>Admin Panel</Link>
                      )}
                      <div style={styles.divider} />
                      <button style={{...styles.dropdownItem, color: '#dc2626'}} onClick={() => { signOut(); navigate('/'); }}>Sign Out</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Sign In</Link>
              <Link to="/register" style={styles.regBtn}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 24px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    fontSize: 15,
    fontWeight: 500,
    color: '#6b7280',
    letterSpacing: '0.05em',
    flexShrink: 0,
    textDecoration: 'none',
    border: '1.5px dashed #d1d5db',
    borderRadius: 6,
    padding: '4px 10px',
  },
  logoAccent: {
    color: '#999',
    fontWeight: 400,
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    height: 38,
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '0 12px',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    background: 'transparent',
  },
  cityWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  citySelect: {
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
    background: 'transparent',
    fontWeight: 500,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  postBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    border: 'none',
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid var(--border)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: 600,
  },
  dropdownEmail: {
    fontSize: 12,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: 'var(--border)',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  },
  loginBtn: {
    padding: '8px 16px',
    fontSize: 14,
    color: '#2d6a4f',
    textDecoration: 'none',
    fontWeight: 500,
  },
  regBtn: {
    padding: '8px 16px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
  },
};
