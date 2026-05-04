import { Link } from 'react-router-dom';
import { categories } from '../data/categories';

export default function CategoryBar() {
  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.slug}`}
            style={styles.item}
          >
            <span style={styles.icon}>{category.icon}</span>
            <span style={styles.name}>{category.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    backgroundColor: 'var(--color-white)',
    borderBottom: '1px solid var(--color-border)',
    padding: '12px 0',
    overflowX: 'auto',
  },
  container: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'nowrap',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    border: '1px solid transparent',
  },
  icon: {
    fontSize: '1.125rem',
  },
  name: {
    display: 'inline',
  },
};
