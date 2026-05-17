import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { PhoneInput, PHONE_CODES } from '../components/PhoneCodeSelect';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0', color: 'var(--text-faint)' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
    <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
  </div>
);

const GoogleButton = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="google-btn">
    <GoogleIcon/>
    <span>{label}</span>
    <style>{`
      .google-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #fff;
        border: 1px solid var(--border-strong);
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        color: var(--text);
        transition: all .15s;
        cursor: pointer;
      }
      .google-btn:hover {
        background: var(--bg-soft);
        border-color: #999;
      }
    `}</style>
  </button>
);

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setErr(error);
    else nav('/');
  };

  const onGoogle = async () => {
    setErr('');
    const { error } = await signInWithGoogle();
    if (error) setErr(error);
  };

  return (
    <Layout full>
      <div className="auth-page">
        <div className="auth-card-2">
          <div className="auth-head">
            <Link to="/" className="logo" style={{ marginBottom: 24, display: 'inline-flex' }}>YOUR BRAND</Link>
            <h1>Sign In</h1>
            <p>Enter your details to continue</p>
          </div>

          {err && <div className="alert alert-error">{err}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"/>
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Divider/>
          <GoogleButton label="Sign in with Google" onClick={onGoogle}/>

          <div className="auth-bottom">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
      <AuthStyles/>
    </Layout>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneIso, setPhoneIso] = useState('us');
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (password !== password2) { setErr('Passwords do not match'); return; }
    if (password.length < 6) { setErr('Password must be at least 6 characters'); return; }
    const dialCode = PHONE_CODES.find(c => c.iso === phoneIso)?.code || '+1';
    const phone = phoneNum.trim() ? `${dialCode} ${phoneNum.trim()}` : '';
    setLoading(true);
    const { error } = await signUp(email, password, name, phone);
    setLoading(false);
    if (error) setErr(error);
    else setDone(true);
  };

  const onGoogle = async () => {
    setErr('');
    const { error } = await signInWithGoogle();
    if (error) setErr(error);
  };

  if (done) {
    return (
      <Layout full>
        <div className="auth-page">
          <div className="auth-card-2" style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-soft)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 28,
            }}>
              ✉️
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              We sent a confirmation link to <strong>{email}</strong>.<br/>
              Click it to activate your account.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
              Didn't receive it? Check your spam folder.
            </p>
            <div className="auth-bottom">
              <Link to="/login">Back to Sign In</Link>
            </div>
          </div>
        </div>
        <AuthStyles/>
      </Layout>
    );
  }

  return (
    <Layout full>
      <div className="auth-page">
        <div className="auth-card-2">
          <div className="auth-head">
            <Link to="/" className="logo" style={{ marginBottom: 24, display: 'inline-flex' }}>YOUR BRAND</Link>
            <h1>Sign Up</h1>
            <p>Create an account to post listings</p>
          </div>

          {err && <div className="alert alert-error">{err}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Name *</label>
              <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?"/>
            </div>
            <div className="field">
              <label>Email *</label>
              <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"/>
            </div>
            <div className="field">
              <label>Phone</label>
              <PhoneInput
                phoneIso={phoneIso} phoneNum={phoneNum}
                onIsoChange={setPhoneIso} onNumChange={setPhoneNum}
              />
            </div>
            <div className="field">
              <label>Password *</label>
              <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters"/>
            </div>
            <div className="field">
              <label>Confirm password *</label>
              <input className="input" type="password" required value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Repeat password"/>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
              By signing up, you agree to our terms of use
            </div>
          </form>

          <Divider/>
          <GoogleButton label="Sign up with Google" onClick={onGoogle}/>

          <div className="auth-bottom">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
      <AuthStyles/>
    </Layout>
  );
}

function AuthStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: calc(100vh - 64px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        background: var(--bg-soft);
      }
      .auth-card-2 {
        width: 100%;
        max-width: 440px;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.04);
      }
      .auth-head { margin-bottom: 24px; }
      .auth-head h1 {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-bottom: 4px;
      }
      .auth-head p {
        color: var(--text-muted);
        font-size: 14px;
      }
      .auth-bottom {
        text-align: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border);
        font-size: 14px;
        color: var(--text-muted);
      }
      .auth-bottom a {
        color: var(--accent);
        font-weight: 600;
      }
      @media (max-width: 540px) {
        .auth-card-2 { padding: 24px; border-radius: 12px; }
      }
    `}</style>
  );
}