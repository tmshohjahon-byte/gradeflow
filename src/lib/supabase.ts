import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pnlhyuzpveicmaugaksx.supabase.co';
const defaultAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ho4xxMhDNsXRUqFmABzZUA_c_AFm-NN';

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

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
    cachedAdminClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http'));
}

/**
 * Client-safe Supabase connection (uses public Anon Key).
 */
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

/**
 * Server-only Admin Supabase connection (uses SUPABASE_SERVICE_ROLE_KEY).
 * Safely bypasses RLS policies in trusted backend API routes.
 * Falls back to ANON_KEY if service role key is not yet configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const isProduction = process.env.NODE_ENV === 'production';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Strict Production Enforcement: Do not allow fallback to public anon key
  if (isProduction && !serviceRoleKey) {
    throw new Error(
      "[AppSec Critical Error] SUPABASE_SERVICE_ROLE_KEY is missing in production environment! Bypassing RLS with public anon key is strictly forbidden."
    );
  }

  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl);
  const serverKey = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultAnonKey;

  if (!url || !serverKey || !url.startsWith('http')) {
    return null;
  }

  if (!cachedAdminClient) {
    try {
      cachedAdminClient = createClient(url, serverKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch {
      return null;
    }
  }

  return cachedAdminClient;
}
