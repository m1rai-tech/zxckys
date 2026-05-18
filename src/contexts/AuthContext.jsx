import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext({});
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const signUp = async (email, password, name, phone, city) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name, phone, city } },
    });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, name, phone, email, city,
      }, { onConflict: 'id' });
    }
    return {};
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const refreshProfile = async () => { if (user) await loadProfile(user.id); };

  const isBanned = !!(profile?.is_banned && (!profile?.banned_until || new Date(profile.banned_until) > new Date()));

  return (
    <AuthCtx.Provider value={{ user, profile, loading, isBanned, signUp, signIn, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}
