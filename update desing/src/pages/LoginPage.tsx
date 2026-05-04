import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Невірний email або пароль' 
        : error.message);
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.form}>
        <h1 style={styles.title}>Вхід</h1>
        <p style={styles.subtitle}>Увійдіть у свій акаунт</p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Завантаження...' : 'Увійти'}
          </button>
        </form>

        <p style={styles.footer}>
          Немає акаунту?{' '}
          <Link to="/register" style={styles.link}>
            Зареєструватися
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: '24px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: 'var(--color-error)',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '16px',
    fontSize: '0.875rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9375rem',
  },
  link: {
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
