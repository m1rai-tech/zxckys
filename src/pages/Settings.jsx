import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { IconUser, IconSettings, IconCheck, IconClose, IconImage } from '../components/Icons';

const CITIES = ['Київ','Львів','Одеса','Харків','Дніпро','Запоріжжя','Вінниця','Полтава','Чернігів','Тернопіль','Івано-Франківськ','Ужгород','Луцьк','Рівне','Чернівці','Хмельницький','Житомир','Суми','Черкаси','Кропивницький','Миколаїв','Херсон'];

export default function Settings() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('profile');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploadingAva, setUploadingAva] = useState(false);
  const fileRef = useRef(null);

  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) nav('/login');
  }, [user, nav, loading]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || ''); setPhone(profile.phone || '');
      setBio(profile.bio || ''); setCity(profile.city || '');
      setAvatar(profile.avatar_url || '');
    }
  }, [profile]);

  const flash = (kind, text) => {
    if (kind === 'msg') { setMsg(text); setErr(''); } else { setErr(text); setMsg(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 3500);
  };

  const onAvatarFile = async (file) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) { flash('err', 'Оберіть зображення'); return; }
    if (file.size > 5 * 1024 * 1024) { flash('err', 'Максимум 5 МБ'); return; }
    setUploadingAva(true);
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('listing-media').upload(path, file, { upsert: true });
    if (error) { flash('err', error.message); setUploadingAva(false); return; }
    const { data } = supabase.storage.from('listing-media').getPublicUrl(path);
    setAvatar(data.publicUrl);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
    refreshProfile();
    setUploadingAva(false);
    flash('msg', 'Аватар оновлено');
  };

  const removeAvatar = async () => {
    if (!user) return;
    setAvatar('');
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    refreshProfile();
    flash('msg', 'Аватар видалено');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) { flash('err', "Ім'я не може бути порожнім"); return; }
    if (!phone.trim()) { flash('err', 'Номер телефона обов\'язковий'); return; }
    if (!city) { flash('err', 'Виберіть місто'); return; }
    const { isValidUaPhone } = await import('../lib/validation');
    if (!isValidUaPhone(phone)) { flash('err', 'Невірний номер телефона. Мають бути українські номери +380'); return; }
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      name, phone, bio, city, avatar_url: avatar || null,
    }).eq('id', user.id);
    setSavingProfile(false);
    if (error) flash('err', error.message);
    else { flash('msg', 'Профіль оновлено'); refreshProfile(); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { flash('err', 'Пароль має бути від 6 символів'); return; }
    if (newPassword !== newPassword2) { flash('err', 'Паролі не співпадають'); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPwd(false);
    if (error) flash('err', error.message);
    else { flash('msg', 'Пароль успішно змінено'); setNewPassword(''); setNewPassword2(''); }
  };

  const initials = (name || user?.email || 'U').slice(0,1).toUpperCase();

  if (loading) return <Layout><div className="text-muted">Завантаження...</div></Layout>;
  if (!profile) return <Layout><div className="text-muted">Завантаження...</div></Layout>;

  return (
    <Layout full>
      <div className="settings-page">
        <div className="settings-head">
          <h1>Налаштування</h1>
          <p>Керуйте даними свого акаунта та безпекою</p>
        </div>

        <div className="settings-grid">
          <aside className="settings-tabs">
            <button className={`stab ${tab==='profile'?'active':''}`} onClick={() => setTab('profile')}>
              <IconUser size={18}/>
              <div>
                <div className="stab-title">Профіль</div>
                <div className="stab-sub">Особиста інформація</div>
              </div>
            </button>
            <button className={`stab ${tab==='security'?'active':''}`} onClick={() => setTab('security')}>
              <IconSettings size={18}/>
              <div>
                <div className="stab-title">Безпека</div>
                <div className="stab-sub">Email та пароль</div>
              </div>
            </button>
          </aside>

          <div className="settings-content">
            {msg && <div className="alert alert-success" style={{ marginBottom: 16 }}><IconCheck size={14}/> {msg}</div>}
            {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>{err}</div>}

            {tab === 'profile' && (
              <form onSubmit={saveProfile} className="settings-card">
                <section className="set-section">
                  <div className="set-section-title">Аватар</div>
                  <div className="avatar-row">
                    <div className="avatar-big">
                      {avatar ? <img src={avatar} alt=""/> : <span>{initials}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="avatar-actions">
                        <button type="button" className="btn btn-primary btn-sm"
                          onClick={() => fileRef.current?.click()} disabled={uploadingAva}>
                          <IconImage size={14}/> {uploadingAva ? 'Завантаження...' : 'Завантажити фото'}
                        </button>
                        {avatar && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={removeAvatar}>
                            <IconClose size={14}/> Видалити
                          </button>
                        )}
                      </div>
                      <div className="set-hint">JPG, PNG. Максимум 5 МБ.</div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => e.target.files?.[0] && onAvatarFile(e.target.files[0])}/>
                    </div>
                  </div>
                </section>

                <section className="set-section">
                  <div className="set-section-title">Особисті дані</div>
                  <div className="set-grid">
                    <div className="field" style={{ margin: 0 }}>
                      <label>Ім'я *</label>
                      <input className="input" value={name} onChange={e=>setName(e.target.value)} required/>
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Телефон *</label>
                      <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+380 XX XXX XX XX" required/>
                    </div>
                    <div className="field" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label>Місто *</label>
                      <select className="select" value={city} onChange={e=>setCity(e.target.value)} required>
                        <option value="">Виберіть місто</option>
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="set-section">
                  <div className="set-section-title">Про вас</div>
                  <div className="field" style={{ margin: 0 }}>
                    <label>Опис профілю</label>
                    <textarea className="textarea" rows={4} value={bio} onChange={e=>setBio(e.target.value)}
                      placeholder="Коротко розкажіть про себе. Цей текст бачитимуть покупці." maxLength={500}/>
                    <div className="set-hint">{bio.length}/500</div>
                  </div>
                </section>

                <div className="set-actions">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Збереження...' : 'Зберегти зміни'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'security' && (
              <div className="settings-card">
                <section className="set-section">
                  <div className="set-section-title">Email</div>
                  <div className="field" style={{ margin: 0 }}>
                    <input className="input" value={user?.email || ''} disabled/>
                    <div className="set-hint">Email прив'язаний до акаунта і не може бути змінений</div>
                  </div>
                </section>

                <form onSubmit={changePassword}>
                  <section className="set-section">
                    <div className="set-section-title">Зміна пароля</div>
                    <div className="set-grid">
                      <div className="field" style={{ margin: 0 }}>
                        <label>Новий пароль</label>
                        <input className="input" type="password" value={newPassword}
                          onChange={e=>setNewPassword(e.target.value)} placeholder="Мінімум 6 символів"/>
                      </div>
                      <div className="field" style={{ margin: 0 }}>
                        <label>Підтвердити пароль</label>
                        <input className="input" type="password" value={newPassword2}
                          onChange={e=>setNewPassword2(e.target.value)}/>
                      </div>
                    </div>
                  </section>
                  <div className="set-actions">
                    <button type="submit" className="btn btn-primary" disabled={savingPwd || !newPassword}>
                      {savingPwd ? 'Збереження...' : 'Змінити пароль'}
                    </button>
                  </div>
                </form>

                <section className="set-section danger-zone">
                  <div className="set-section-title" style={{ color: 'var(--danger)' }}>Небезпечна зона</div>
                  <div className="danger-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>Вийти з усіх пристроїв</div>
                      <div className="set-hint">Завершить усі активні сесії</div>
                    </div>
                    <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                      await supabase.auth.signOut();
                      nav('/');
                    }}>Вийти</button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .settings-page { max-width: 1100px; margin: 0 auto; padding: 0 8px; }
        .settings-head { padding: 24px 8px 8px; }
        .settings-head h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 4px; }
        .settings-head p { color: var(--text-muted); }
        .settings-grid { display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
        .settings-tabs { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 8px; position: sticky; top: 88px; display: flex; flex-direction: column; gap: 4px; }
        .stab { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 8px; text-align: left; color: var(--text); transition: background .15s; width: 100%; }
        .stab:hover { background: var(--bg-soft); }
        .stab.active { background: var(--accent-soft); color: var(--accent); }
        .stab-title { font-weight: 600; font-size: 14px; }
        .stab-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .stab.active .stab-sub { color: var(--accent); opacity: 0.8; }
        .stab svg { flex-shrink: 0; }
        .settings-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .set-section { padding: 24px; border-bottom: 1px solid var(--border); }
        .set-section:last-child { border-bottom: none; }
        .set-section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.01em; }
        .set-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .set-hint { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
        .avatar-row { display: flex; gap: 20px; align-items: center; }
        .avatar-big { width: 96px; height: 96px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 700; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border); }
        .avatar-big img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
        .set-actions { padding: 20px 24px; background: var(--bg-soft); display: flex; justify-content: flex-end; gap: 8px; }
        .danger-zone { background: #fdf6f5; border-top: 1px solid #f5d4d0 !important; }
        .danger-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        @media (max-width: 900px) {
          .settings-grid { grid-template-columns: 1fr; }
          .settings-tabs { position: static; flex-direction: row; overflow-x: auto; }
          .stab { flex-shrink: 0; min-width: 200px; }
          .set-grid { grid-template-columns: 1fr; }
          .avatar-row { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
    </Layout>
  );
}
