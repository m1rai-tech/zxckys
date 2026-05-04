import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES, IconGrid } from '../lib/categories';
import {
  IconSearch, IconHeart, IconMessage, IconUser, IconPlus,
  IconLogout, IconHome, IconSettings, IconChevronDown, IconLocation
} from './Icons';
import { getFavorites } from '../lib/favorites';

const CITIES = ['Вся Україна', 'Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Запоріжжя', 'Вінниця', 'Полтава', 'Чернігів', 'Тернопіль', 'Івано-Франківськ'];

export function Layout({ children, full }) {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [city, setCity] = useState(localStorage.getItem('olxua_city') || 'Вся Україна');
  const [showCities, setShowCities] = useState(false);
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

  useEffect(() => { localStorage.setItem('olxua_city', city); }, [city]);

  const onSearch = (e) => {
    e.preventDefault();
    nav(`/search?q=${encodeURIComponent(q)}`);
  };

  const initials = (profile?.name || user?.email || 'U').slice(0, 1).toUpperCase();

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">zxckys</Link>

          <form onSubmit={onSearch} className="search-wrap">
            <IconSearch size={18}/>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Пошук оголошень..."/>
          </form>

          <div style={{ position: 'relative' }}>
            <button className="btn btn-ghost" onClick={() => setShowCities(s => !s)}>
              <IconLocation size={16}/> {city} <IconChevronDown size={14}/>
            </button>
            {showCities && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 6, minWidth: 200, zIndex: 50, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
                {CITIES.map(c => (
                  <button key={c} className="sidebar-link" style={{ width: '100%' }}
                    onClick={() => { setCity(c); setShowCities(false); }}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link to="/create" className="btn btn-primary">
                <IconPlus size={16}/> Подати оголошення
              </Link>
              <Link to="/favorites" className="icon-btn" title="Улюблене">
                <IconHeart size={20}/>
                {favCount > 0 && <span className="badge">{favCount}</span>}
              </Link>
              <Link to="/chat" className="icon-btn" title="Повідомлення">
                <IconMessage size={20}/>
              </Link>
              <div style={{ position: 'relative' }}>
                <button className="avatar" onClick={() => setShowUser(s => !s)} style={{ width: 40, height: 40, fontSize: 14 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt=""/> : initials}
                </button>
                {showUser && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 6, minWidth: 220, zIndex: 50, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.name || 'Користувач'}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                    <Link to="/me" className="sidebar-link" onClick={() => setShowUser(false)}>
                      <IconUser size={18}/> Мій профіль
                    </Link>
                    <Link to="/my-listings" className="sidebar-link" onClick={() => setShowUser(false)}>
                      <IconGrid size={18}/> Мої оголошення
                    </Link>
                    <Link to="/settings" className="sidebar-link" onClick={() => setShowUser(false)}>
                      <IconSettings size={18}/> Налаштування
                    </Link>
                    <div className="sidebar-divider"/>
                    <button className="sidebar-link" style={{ width: '100%', color: 'var(--danger)' }}
                      onClick={async () => { await signOut(); setShowUser(false); nav('/'); }}>
                      <IconLogout size={18}/> Вийти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Увійти</Link>
              <Link to="/register" className="btn btn-primary">Реєстрація</Link>
            </>
          )}
        </div>
      </header>

      {full ? (
        <div className="main-full">{children}</div>
      ) : (
        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-title">Навігація</div>
            <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <IconHome size={18}/> Головна
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <IconHeart size={18}/> Улюблене
              {favCount > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{favCount}</span>}
            </NavLink>
            {user && (
              <NavLink to="/chat" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <IconMessage size={18}/> Повідомлення
              </NavLink>
            )}
            <div className="sidebar-divider"/>
            <div className="sidebar-title">Категорії</div>
            {CATEGORIES.map(c => (
              <NavLink key={c.slug} to={`/c/${c.slug}`}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <c.Icon size={18}/> {c.name}
              </NavLink>
            ))}
          </aside>
          <main className="content">{children}</main>
        </div>
      )}
    </div>
  );
}
