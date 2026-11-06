import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pnlhyuzpveicmaugaksx.supabase.co';
const defaultAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ho4xxMhDNsXRUqFmABzZUA_c_AFm-NN';

let cachedClient: SupabaseClient | null = null;

export function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let clean = url.trim();
  // Strip trailing slash
  clean = clean.replace(/\/+$/, '');
  // Strip /rest/v1 if included
  clean = clean.replace(/\/rest\/v1$/i, '');
  return clean;
}

export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return { url: normalizeSupabaseUrl(defaultUrl), anonKey: defaultAnonKey };
  }
  const customUrl = localStorage.getItem('gradeflow_supabase_url');
  const customKey = localStorage.getItem('gradeflow_supabase_key');
  return {
    url: normalizeSupabaseUrl(customUrl || defaultUrl),
    anonKey: customKey || defaultAnonKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('gradeflow_supabase_url', normalizeSupabaseUrl(url));
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
