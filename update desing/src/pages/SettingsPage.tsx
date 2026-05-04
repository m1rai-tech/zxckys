import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await updateProfile({
      name,
      phone: phone || undefined,
      bio: bio || undefined,
      avatar_url: avatarUrl || undefined,
    });
    if (error) setMessage('Помилка збереження');
    else setMessage('Збережено успішно');
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (window.confirm('Ви впевнені?')) {
      await signOut();
      navigate('/');
    }
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <div style={styles.page}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.title}>Налаштування</h1>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Профіль</h2>
          <div className="form-group">
            <label className="form-label">Ім'я</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше ім'я" />
          </div>
          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 XX XXX XX XX" />
          </div>
          <div className="form-group">
            <label className="form-label">Про себе</label>
            <textarea className="form-input form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Розкажіть про себе..." rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">URL аватара</label>
            <input type="url" className="form-input" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
            {avatarUrl && <div style={styles.avatarPreview}><img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          </div>
          {message && <p style={{ ...styles.message, color: message.includes('Помилка') ? '#dc2626' : '#16a34a' }}>{message}</p>}
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Збереження...' : 'Зберегти'}</button>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Акаунт</h2>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={user.email || ''} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
          </div>
          <div style={styles.stats}>
            <div><span style={styles.statLabel}>Роль</span><span style={styles.statValue}>{profile?.role === 'admin' ? 'Адмін' : profile?.role === 'moderator' ? 'Модератор' : 'Користувач'}</span></div>
            <div><span style={styles.statLabel}>Рейтинг</span><span style={styles.statValue}>{profile?.rating?.toFixed(1) || '0.0'}</span></div>
            <div><span style={styles.statLabel}>Угод</span><span style={styles.statValue}>{profile?.deals_count || 0}</span></div>
          </div>
        </section>

        <section style={{ ...styles.section, borderColor: '#dc2626', borderStyle: 'dashed' }}>
          <h2 style={{ ...styles.sectionTitle, color: '#dc2626' }}>Вихід</h2>
          <button className="btn btn-outline" onClick={handleSignOut} style={{ borderColor: '#dc2626', color: '#dc2626' }}>Вийти з акаунта</button>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: 'calc(100vh - 56px)' },
  main: { flex: 1, padding: '24px 28px', maxWidth: 640 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 28 },
  section: { display: 'flex', flexDirection: 'column', gap: 16, padding: 24, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' },
  message: { padding: 12, borderRadius: 8, fontSize: 14, background: '#f5f5f5' },
  avatarPreview: { marginTop: 12, width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#f5f5f5' },
  stats: { display: 'flex', gap: 32, flexWrap: 'wrap' },
  statLabel: { fontSize: 12, color: '#9ca3af', display: 'block' },
  statValue: { fontSize: 18, fontWeight: 600 },
};
