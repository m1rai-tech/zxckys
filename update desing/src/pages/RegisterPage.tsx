import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      setError('Пароль має містити мінімум 6 символів');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name, phone);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Цей email вже зареєстровано');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.form}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Перевірте email</h1>
          <p style={styles.subtitle}>
            Ми надіслали лист для підтвердження на <strong>{email}</strong>
          </p>
          <p style={styles.text}>
            Натисніть на посилання в листі, щоб активувати акаунт.
          </p>
          <button
            className="btn btn-primary"
            style={styles.submitBtn}
            onClick={() => navigate('/login')}
          >
            Перейти до входу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.form}>
        <h1 style={styles.title}>Реєстрація</h1>
        <p style={styles.subtitle}>Створіть новий акаунт</p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ім'я *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше ім'я"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
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
            <label className="form-label">Телефон</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+380 XX XXX XX XX"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль *</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Мінімум 6 символів"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Підтвердити пароль *</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторіть пароль"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Завантаження...' : 'Зареєструватися'}
          </button>
        </form>

        <p style={styles.footer}>
          Вже є акаунт?{' '}
          <Link to="/login" style={styles.link}>
            Увійти
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
  text: {
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9375rem',
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
  successIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-success)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto 16px',
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
