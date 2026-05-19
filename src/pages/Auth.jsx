import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PhoneInput, PHONE_CODES } from '../components/PhoneCodeSelect';
import { Layout } from '../components/Layout';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>or</span>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
);

const GoogleButton = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="g-btn">
    <GoogleIcon />
    <span>{label}</span>
    <style>{`
      .g-btn {
        width: 100%;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #fff;
        border: 1.5px solid var(--border-strong);
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        color: var(--text);
        cursor: pointer;
        transition: background .15s, border-color .15s, box-shadow .15s;
        letter-spacing: -0.01em;
      }
      .g-btn:hover {
        background: var(--bg-soft);
        border-color: #bbb;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      }
    `}</style>
  </button>
);

function AuthPage({ children }) {
  return (
    <>
      <div className="auth-wrap">
        <div className="a-card">
          {children}
        </div>
      </div>
      <style>{`
        .auth-wrap {
  min-height: calc(100dvh - 64px - 56px);
  background: var(--bg-soft);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}
          
      .a-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 36px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 40px rgba(0,0,0,0.07);
  box-sizing: border-box;
  margin: auto 0; /* центрування по вертикалі на десктопі */
}

        @media (max-width: 480px) {
          .a-card {
            padding: 24px 20px !important;
            border-radius: 16px !important;
          }
        }

        .a-field { margin-bottom: 13px; }
        .a-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 5px;
          letter-spacing: -0.01em;
        }
        .a-field .input { height: 44px; font-size: 14px; border-radius: 10px; }
        .a-btn {
          width: 100%;
          height: 46px;
          background: var(--accent, #2d6a4f);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: -0.01em;
          transition: opacity .15s, transform .1s;
          margin-top: 4px;
        }
        .a-btn:hover { opacity: .9; }
        .a-btn:active { transform: scale(.99); }
        .a-btn:disabled { opacity: .6; cursor: not-allowed; }
        .a-foot {
          text-align: center;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-size: 13.5px;
          color: var(--text-muted);
        }
        .a-foot a {
          color: var(--accent, #2d6a4f);
          font-weight: 700;
          text-decoration: none;
        }
        .a-foot a:hover { text-decoration: underline; }
        .a-err {
          background: #fff1f0;
          border: 1px solid #ffc9c9;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #c0392b;
          margin-bottom: 14px;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}

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
      <AuthPage>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 3px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Sign in to continue</p>
        </div>

        {err && <div className="a-err">{err}</div>}

        <GoogleButton label="Continue with Google" onClick={onGoogle} />
        <Divider />

        <form onSubmit={submit}>
          <div className="a-field">
            <label>Email</label>
            <input className="input" type="email" required value={email}
              onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="a-field" style={{ marginBottom: 18 }}>
            <label>Password</label>
            <input className="input" type="password" required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="a-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="a-foot">
          No account? <Link to="/register">Create one</Link>
        </div>
      </AuthPage>
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
        <AuthPage>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent-soft, #e9f5ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 24,
            }}>✉️</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 6, fontSize: 14 }}>
              We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 0 }}>Didn't receive it? Check spam.</p>
            <div className="a-foot"><Link to="/login">Back to Sign In</Link></div>
          </div>
        </AuthPage>
      </Layout>
    );
  }

  return (
    <Layout full>
      <AuthPage>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 3px' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>Free forever. No credit card needed.</p>
        </div>

        {err && <div className="a-err">{err}</div>}

        <GoogleButton label="Continue with Google" onClick={onGoogle} />
        <Divider />

        <form onSubmit={submit}>
          <div className="a-field">
            <label>Name</label>
            <input className="input" required value={name}
              onChange={e => setName(e.target.value)} placeholder="What should we call you?" />
          </div>
          <div className="a-field">
            <label>Email</label>
            <input className="input" type="email" required value={email}
              onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="a-field">
            <label>Phone <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(optional)</span></label>
            <PhoneInput phoneIso={phoneIso} phoneNum={phoneNum}
              onIsoChange={setPhoneIso} onNumChange={setPhoneNum} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="a-field">
              <label>Password</label>
              <input className="input" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 6 chars" />
            </div>
            <div className="a-field">
              <label>Confirm</label>
              <input className="input" type="password" required value={password2}
                onChange={e => setPassword2(e.target.value)} placeholder="Repeat" />
            </div>
          </div>
          <button className="a-btn" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
          <p style={{ fontSize: 11.5, color: 'var(--text-faint)', textAlign: 'center', margin: '8px 0 0' }}>
            By signing up you agree to our terms of use
          </p>
        </form>

        <div className="a-foot">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </AuthPage>
    </Layout>
  );
}