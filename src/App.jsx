import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';

// browser doesn't scroll to top on navigation by default — this fixes that
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { isConfigured } from './lib/supabase';

// Each page loads only when first visited — keeps the initial bundle small.
const Home          = lazy(() => import('./pages/Home'));
const Login         = lazy(() => import('./pages/Auth').then(m => ({ default: m.Login })));
const Register      = lazy(() => import('./pages/Auth').then(m => ({ default: m.Register })));
const Category      = lazy(() => import('./pages/Category'));
const SearchPage    = lazy(() => import('./pages/Search'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const ListingDetails= lazy(() => import('./pages/ListingDetails'));
const MyProfile     = lazy(() => import('./pages/Profile').then(m => ({ default: m.MyProfile })));
const SellerProfile = lazy(() => import('./pages/Profile').then(m => ({ default: m.SellerProfile })));
const Settings      = lazy(() => import('./pages/Settings'));
const Favorites     = lazy(() => import('./pages/Favorites'));
const Chat          = lazy(() => import('./pages/Chat'));
const Admin         = lazy(() => import('./pages/Admin'));
const PrivacyPage   = lazy(() => import('./pages/Static').then(m => ({ default: m.PrivacyPage })));
const TermsPage     = lazy(() => import('./pages/Static').then(m => ({ default: m.TermsPage })));
const HelpPage      = lazy(() => import('./pages/Static').then(m => ({ default: m.HelpPage })));

function ConfigWarning() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fff' }}>
      <div style={{ maxWidth: 520, padding: 32, border: '1px solid var(--border)', borderRadius: 12 }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Supabase is not configured</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Create a <code>.env</code> file in the project root with:
        </p>
        <pre style={{ background: 'var(--bg-soft)', padding: 12, borderRadius: 8, fontSize: 13, overflow: 'auto' }}>
{`VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
        </pre>
        <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 13 }}>
          After saving, restart <code>npm run dev</code>.
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
        <CurrencyProvider>
          <ScrollToTop />
          <Suspense fallback={null}>
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
              <Route path="/admin" element={<Admin/>}/>
              <Route path="/privacy" element={<PrivacyPage/>}/>
              <Route path="/terms" element={<TermsPage/>}/>
              <Route path="/help" element={<HelpPage/>}/>
              <Route path="*" element={<Home/>}/>
            </Routes>
          </Suspense>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
