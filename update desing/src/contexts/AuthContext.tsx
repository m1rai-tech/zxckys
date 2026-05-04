import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Profile = {
  id: string; name: string; phone?: string; email?: string;
  avatar_url?: string; bio?: string; city?: string;
  role: 'user' | 'moderator' | 'admin';
  rating?: number; deals_count?: number; created_at?: string;
};

type Ctx = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({} as any);
export const useAuth = () => useContext(AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile(data as any);
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

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { name, phone } },
    });
    if (error) return { error: error.message };
    // upsert profile (in case trigger didn't fire)
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id, name, phone, email,
      }, { onConflict: 'id' });
    }
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const refreshProfile = async () => { if (user) await loadProfile(user.id); };

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
};
