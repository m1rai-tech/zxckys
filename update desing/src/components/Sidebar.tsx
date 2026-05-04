import { Link, useLocation } from 'react-router-dom';
import { categories } from '../data/categories';

const catSvg: Record<string, string> = {
  electronics: 'M9.5 2h5a1 1 0 011 1v14a1 1 0 01-1 1h-5a1 1 0 01-1-1V3a1 1 0 011-1zM12 18v1M8 5h8',
  auto: 'M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 100 4 2 2 0 000-4zm14 0a2 2 0 100 4 2 2 0 000-4z',
  clothing: 'M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z',
  work: 'M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7m16 0l-8 4m8-4l-8 4M8 7l8 4m-8-4v10a2 2 0 002 2h4a2 2 0 002-2V7',
  services: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  books: 'M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  gaming: 'M6 11h4M8 9v4M16 12a1 1 0 100-2 1 1 0 000 2zm3-2a1 1 0 100-2 1 1 0 000 2zM2 10a8 8 0 0116 0v4a8 8 0 01-16 0v-4z',
  free: 'M20 12v10H4V12M2 7h20M12 7V2M7 7l5-5 5 5',
};

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.section}>
        <div style={styles.label}>Категорії</div>
        {categories.map(cat => {
          const isActive = location.pathname === `/category/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              style={{
                ...styles.item,
                ...(isActive ? styles.active : {}),
              }}
            >
              <span style={styles.icon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={catSvg[cat.id] || catSvg.electronics} />
                </svg>
              </span>
              <span style={styles.itemText}>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    background: '#fff',
    borderRight: '1px solid var(--border)',
    flexShrink: 0,
    padding: '20px 0',
    overflowY: 'auto',
    height: 'calc(100vh - 56px)',
    position: 'sticky',
    top: 56,
  },
  section: {
    padding: '0 12px',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#9ca3af',
    padding: '0 8px 8px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 8px',
    fontSize: 13.5,
    fontWeight: 500,
    color: '#6b7280',
    borderRadius: 6,
    textDecoration: 'none',
    transition: 'all 100ms',
    marginBottom: 2,
  },
  active: {
    background: '#f0fdf4',
    color: '#2d6a4f',
    fontWeight: 600,
  },
  icon: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
