import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../data/categories';
import { getFavorites } from '../lib/favorites';

export default function Sidebar() {
  const { user } = useAuth();
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

  return (
    <aside className="sidebar">
      <div className="sidebar-title">Navigation</div>
      <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        🏠 Home
      </NavLink>
      <NavLink to="/favorites" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
        🤍 Favorites
        {favCount > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
            {favCount}
          </span>
        )}
      </NavLink>
      {user && (
        <NavLink to="/chat" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          💬 Messages
        </NavLink>
      )}
      <div className="sidebar-divider" />
      <div className="sidebar-title">Categories</div>
      {categories.map(c => (
        <NavLink
          key={c.slug}
          to={`/category/${c.slug}`}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          {c.icon} {c.name}
        </NavLink>
      ))}
    </aside>
  );
}
