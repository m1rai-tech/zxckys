import { createClient } from '@supabase/supabase-js';

// these come from your .env file — VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// get them from your Supabase project: Settings → API
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if .env is not set up yet, the app shows a config warning instead of crashing
export const isConfigured = !!url && !!key;

export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : createClient('https://placeholder.supabase.co', 'placeholder-key');
