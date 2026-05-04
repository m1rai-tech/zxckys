import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!user) nav('/login');
    if (profile) {
      setName(profile.name || ''); setPhone(profile.phone || '');
      setBio(profile.bio || ''); setCity(profile.city || '');
      setAvatar(profile.avatar_url || '');
    }
  }, [profile, user, nav]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const { error } = await supabase.from('profiles').update({
      name, phone, bio, city, avatar_url: avatar
    }).eq('id', user.id);
    if (error) setErr(error.message);
    else { setMsg('Профіль оновлено'); refreshProfile(); }
  };

  const changePassword = async () => {
    setMsg(''); setErr('');
    if (newPassword.length < 6) { setErr('Мінімум 6 символів'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setErr(error.message);
    else { setMsg('Пароль змінено'); setNewPassword(''); }
  };

  return (
    <Layout full>
      <div className="form-card">
        <h1>Налаштування акаунта</h1>
        <p className="subtitle">Керуйте даними свого профілю</p>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={saveProfile}>
          <div className="field">
            <label>Ім'я</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={user?.email || ''} disabled/>
            <div className="hint">Email не можна змінити</div>
          </div>
          <div className="field">
            <label>Телефон</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380..."/>
          </div>
          <div className="field">
            <label>Місто</label>
            <input className="input" value={city} onChange={e => setCity(e.target.value)}/>
          </div>
          <div className="field">
            <label>Про себе</label>
            <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Розкажіть про себе..."/>
          </div>
          <div className="field">
            <label>URL аватара</label>
            <input className="input" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..."/>
          </div>
          <button className="btn btn-primary">Зберегти зміни</button>
        </form>
        <div style={{ height: 1, background: 'var(--border)', margin: '32px 0' }}/>
        <h1 style={{ fontSize: 18 }}>Зміна пароля</h1>
        <div className="field mt-4">
          <label>Новий пароль</label>
          <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}/>
        </div>
        <button className="btn btn-ghost" onClick={changePassword}>Змінити пароль</button>
      </div>
    </Layout>
  );
}
