import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / Fallback Supabase Credentials (Can be overridden via .env or localStorage)
const DEFAULT_SUPABASE_URL = 'https://fmodokbfvluablwzohdj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GG73kf0PYIvoNdLV...';

export const getSupabaseCredentials = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('tangent_supabase_url') : null;
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('tangent_supabase_key') : null;

  return {
    url: localUrl || envUrl || DEFAULT_SUPABASE_URL,
    anonKey: localKey || envKey || DEFAULT_SUPABASE_ANON_KEY
  };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    const { url, anonKey } = getSupabaseCredentials();
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseInstance;
};

export const updateSupabaseCredentials = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tangent_supabase_url', url);
    localStorage.setItem('tangent_supabase_key', key);
  }
  const { url: newUrl, anonKey: newKey } = getSupabaseCredentials();
  supabaseInstance = createClient(newUrl, newKey);
  return supabaseInstance;
};

export const supabase = getSupabaseClient();
