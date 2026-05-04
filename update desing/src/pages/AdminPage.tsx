import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Listing, Profile } from '../types';

export default function AdminPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'listings' | 'users'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role !== 'admin' && profile.role !== 'moderator') {
      navigate('/');
      return;
    }
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (listingsData) {
        setListings(listingsData as Listing[]);
      } else {
        setListings(getDemoListings());
      }

      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersData) {
        setUsers(usersData as Profile[]);
      } else {
        setUsers(getDemoUsers());
      }
    } catch (err) {
      setListings(getDemoListings());
      setUsers(getDemoUsers());
    } finally {
      setLoading(false);
    }
  };

  const getDemoListings = (): Listing[] => [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      description: '',
      price: 55000,
      is_free: false,
      category_id: 'electronics',
      category_name: 'Техніка',
      location: 'Київ',
      user_id: '1',
      status: 'active',
      images: [],
      attributes: {},
      has_delivery: true,
      show_phone: true,
      views: 150,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const getDemoUsers = (): Profile[] => [
    {
      id: '1',
      name: 'Олександр',
      email: 'alex@example.com',
      rating: 4.8,
      deals_count: 47,
      role: 'user',
      created_at: '2023-01-15',
      updated_at: '2023-01-15',
    },
    {
      id: '2',
      name: 'Марія',
      email: 'maria@example.com',
      rating: 5.0,
      deals_count: 12,
      role: 'moderator',
      created_at: '2023-02-20',
      updated_at: '2023-02-20',
    },
  ];

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Видалити оголошення?')) return;
    await supabase.from('listings').delete().eq('id', id);
    fetchData();
  };

  const handleRoleChange = async (userId: string, role: 'user' | 'moderator' | 'admin') => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="container" style={styles.page}>
      <h1 style={styles.title}>Адмін-панель</h1>
      <p style={styles.subtitle}>
        Роль: {profile.role === 'admin' ? 'Адміністратор' : 'Модератор'}
      </p>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{listings.length}</span>
          <span style={styles.statLabel}>Оголошень</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{users.length}</span>
          <span style={styles.statLabel}>Користувачів</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>
            {listings.filter(l => l.status === 'active').length}
          </span>
          <span style={styles.statLabel}>Активних</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('listings')}
          style={{
            ...styles.tab,
            borderBottomColor: activeTab === 'listings' ? 'var(--color-accent)' : 'transparent',
            color: activeTab === 'listings' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}
        >
          Оголошення
        </button>
        {profile.role === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            style={{
              ...styles.tab,
              borderBottomColor: activeTab === 'users' ? 'var(--color-accent)' : 'transparent',
              color: activeTab === 'users' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            }}
          >
            Користувачі
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : activeTab === 'listings' ? (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Оголошення</span>
            <span>Категорія</span>
            <span>Статус</span>
            <span>Дата</span>
            <span>Дії</span>
          </div>
          {listings.map((listing) => (
            <div key={listing.id} style={styles.tableRow}>
              <span style={styles.listingTitle}>{listing.title}</span>
              <span>{listing.category_name}</span>
              <span className={`badge ${listing.status === 'active' ? 'badge-success' : listing.status === 'sold' ? 'badge-error' : 'badge-warning'}`}>
                {listing.status === 'active' ? 'Активне' : listing.status === 'sold' ? 'Продано' : 'Архів'}
              </span>
              <span style={styles.date}>{formatDate(listing.created_at)}</span>
              <span style={styles.actions}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                >
                  Перегляд
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDeleteListing(listing.id)}
                  style={{ color: 'var(--color-error)' }}
                >
                  Видалити
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Користувач</span>
            <span>Email</span>
            <span>Роль</span>
            <span>Реєстрація</span>
            <span>Дії</span>
          </div>
          {users.map((u) => (
            <div key={u.id} style={styles.tableRow}>
              <span>{u.name}</span>
              <span>{u.email}</span>
              <span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'moderator' ? 'badge-warning' : 'badge-primary'}`}>
                {u.role === 'admin' ? 'Адмін' : u.role === 'moderator' ? 'Модератор' : 'Користувач'}
              </span>
              <span style={styles.date}>{formatDate(u.created_at)}</span>
              <span style={styles.actions}>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as 'user' | 'moderator' | 'admin')}
                  style={styles.roleSelect}
                  disabled={u.id === profile.id}
                >
                  <option value="user">Користувач</option>
                  <option value="moderator">Модератор</option>
                  <option value="admin">Адмін</option>
                </select>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: '32px 16px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '24px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '20px',
    backgroundColor: 'var(--color-card)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-accent)',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  },
  tabs: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '24px',
  },
  tab: {
    padding: '12px 0',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    cursor: 'pointer',
    marginBottom: '-1px',
  },
  table: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--color-card)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    gap: '12px',
    padding: '12px 16px',
    borderTop: '1px solid var(--color-border)',
    fontSize: '0.9375rem',
    alignItems: 'center',
  },
  listingTitle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  date: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-secondary)',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  roleSelect: {
    padding: '6px 10px',
    fontSize: '0.8125rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-white)',
  },
};
