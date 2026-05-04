import { Link } from 'react-router-dom';
import { categories } from '../data/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.grid}>
          {/* Logo & Description */}
          <div style={styles.section}>
            <Link to="/" style={styles.logo}>
              OLX<span style={styles.logoAccent}>ua</span>
            </Link>
            <p style={styles.description}>
              Маркетплейс для покупки та продажу товарів в Україні
            </p>
          </div>

          {/* Categories */}
          <div style={styles.section}>
            <h4 style={styles.title}>Категорії</h4>
            <nav style={styles.links}>
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} style={styles.link}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* More Categories */}
          <div style={styles.section}>
            <h4 style={styles.title}>Ще</h4>
            <nav style={styles.links}>
              {categories.slice(4).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} style={styles.link}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div style={styles.section}>
            <h4 style={styles.title}>Інформація</h4>
            <nav style={styles.links}>
              <Link to="/about" style={styles.link}>Про нас</Link>
              <Link to="/help" style={styles.link}>Допомога</Link>
              <Link to="/terms" style={styles.link}>Правила</Link>
              <Link to="/privacy" style={styles.link}>Конфіденційність</Link>
            </nav>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} OLXua. Всі права захищені.
          </p>
          <div style={styles.social}>
            <a href="#" style={styles.socialLink}>📘</a>
            <a href="#" style={styles.socialLink}>📸</a>
            <a href="#" style={styles.socialLink}>🐦</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    backgroundColor: 'var(--color-text)',
    color: 'var(--color-white)',
    marginTop: 'auto',
    padding: '48px 0 24px',
  },
  container: {},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '32px',
    marginBottom: '40px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-white)',
    textDecoration: 'none',
  },
  logoAccent: {
    color: 'var(--color-accent)',
  },
  description: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.5,
    margin: 0,
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--color-white)',
    margin: 0,
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  copyright: {
    fontSize: '0.8125rem',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  },
  social: {
    display: 'flex',
    gap: '12px',
  },
  socialLink: {
    fontSize: '1.25rem',
    textDecoration: 'none',
  },
};
