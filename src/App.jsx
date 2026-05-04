import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';
import Category from './pages/Category';
import SearchPage from './pages/Search';
import CreateListing from './pages/CreateListing';
import ListingDetails from './pages/ListingDetails';
import { MyProfile, SellerProfile } from './pages/Profile';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import Chat from './pages/Chat';
import { isConfigured } from './lib/supabase';

function ConfigWarning() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fff' }}>
      <div style={{ maxWidth: 520, padding: 32, border: '1px solid var(--border)', borderRadius: 12 }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Supabase не налаштовано</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Створіть файл <code>.env</code> в корені проекту з:
        </p>
        <pre style={{ background: 'var(--bg-soft)', padding: 12, borderRadius: 8, fontSize: 13, overflow: 'auto' }}>
{`VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 13 }}>
          Після збереження перезапустіть <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!isConfigured) return <ConfigWarning/>;
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/c/:slug" element={<Category/>}/>
          <Route path="/search" element={<SearchPage/>}/>
          <Route path="/create" element={<CreateListing/>}/>
          <Route path="/edit/:id" element={<CreateListing edit/>}/>
          <Route path="/listing/:id" element={<ListingDetails/>}/>
          <Route path="/me" element={<MyProfile/>}/>
          <Route path="/my-listings" element={<MyProfile/>}/>
          <Route path="/u/:id" element={<SellerProfile/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/favorites" element={<Favorites/>}/>
          <Route path="/chat" element={<Chat/>}/>
          <Route path="*" element={<Home/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
