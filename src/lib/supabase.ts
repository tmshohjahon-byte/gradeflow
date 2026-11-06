import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const defaultAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return { url: defaultUrl, anonKey: defaultAnonKey };
  }
  const customUrl = localStorage.getItem('gradeflow_supabase_url');
  const customKey = localStorage.getItem('gradeflow_supabase_key');
  return {
    url: customUrl || defaultUrl,
    anonKey: customKey || defaultAnonKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('gradeflow_supabase_url', url.trim());
      localStorage.setItem('gradeflow_supabase_key', anonKey.trim());
    } else {
      localStorage.removeItem('gradeflow_supabase_url');
      localStorage.removeItem('gradeflow_supabase_key');
    }
    cachedClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch {
      return null;
    }
  }

  return cachedClient;
}
