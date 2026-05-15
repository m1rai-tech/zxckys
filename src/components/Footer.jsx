import { Link } from 'react-router-dom';
import { categories } from '../data/categories';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.section}>
            <Link to="/" style={styles.logo}>
              Marketplace
            </Link>
            <p style={styles.description}>
              A marketplace for buying and selling goods
            </p>
          </div>

          <div style={styles.section}>
            <h4 style={styles.title}>Categories</h4>
            <nav style={styles.links}>
              {categories.slice(0, 4).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} style={styles.link}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div style={styles.section}>
            <h4 style={styles.title}>More</h4>
            <nav style={styles.links}>
              {categories.slice(4).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} style={styles.link}>
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          <div style={styles.section}>
            <h4 style={styles.title}>Information</h4>
            <nav style={styles.links}>
              <Link to="/about" style={styles.link}>About Us</Link>
              <Link to="/help" style={styles.link}>Help</Link>
              <Link to="/terms" style={styles.link}>Terms</Link>
              <Link to="/privacy" style={styles.link}>Privacy</Link>
            </nav>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {currentYear} Marketplace. All rights reserved.
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

const styles = {
  footer: {
    backgroundColor: 'var(--text)',
    color: '#fff',
    marginTop: 'auto',
    padding: '48px 0 24px',
  },
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 24px',
  },
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
    color: '#fff',
    textDecoration: 'none',
  },
  logoAccent: {
    color: 'var(--accent)',
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
    color: '#fff',
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
