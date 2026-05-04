import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setErr(error);
    else nav('/');
  };

  return (
    <Layout full>
      <div className="auth-page">
        <div className="auth-card">
          <h1>Вхід</h1>
          <p className="subtitle">Увійдіть у свій акаунт</p>
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="field">
              <label>Пароль</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>
          <div className="form-bottom">
            Немає акаунту? <Link to="/register">Зареєструватися</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (password !== password2) { setErr('Паролі не співпадають'); return; }
    if (password.length < 6) { setErr('Пароль має містити мінімум 6 символів'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name, phone);
    setLoading(false);
    if (error) setErr(error);
    else { setSuccess(true); setTimeout(() => nav('/'), 1500); }
  };

  return (
    <Layout full>
      <div className="auth-page">
        <div className="auth-card">
          <h1>Реєстрація</h1>
          <p className="subtitle">Створіть новий акаунт</p>
          {err && <div className="alert alert-error">{err}</div>}
          {success && <div className="alert alert-success">Реєстрація успішна! Перенаправлення...</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Ім'я</label>
              <input className="input" required value={name} onChange={e => setName(e.target.value)}/>
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="field">
              <label>Телефон</label>
              <input className="input" placeholder="+380 XX XXX XX XX" value={phone} onChange={e => setPhone(e.target.value)}/>
            </div>
            <div className="field">
              <label>Пароль</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)}/>
            </div>
            <div className="field">
              <label>Підтвердити пароль</label>
              <input className="input" type="password" required value={password2} onChange={e => setPassword2(e.target.value)}/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Створення...' : 'Зареєструватися'}
            </button>
          </form>
          <div className="form-bottom">
            Вже маєте акаунт? <Link to="/login">Увійти</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
