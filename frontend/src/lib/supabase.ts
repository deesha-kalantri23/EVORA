import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if the Supabase credentials are valid production/project credentials
export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawAnonKey) return false;
  if (rawUrl.includes('your-project-ref') || rawAnonKey.includes('your-anon-key')) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Safe fallback URL for client instantiation if unconfigured
const fallbackUrl = 'https://evora-placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? rawUrl : fallbackUrl,
  isSupabaseConfigured() ? rawAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'evora-admin-supabase-auth'
    }
  }
);

export interface UserRoleInfo {
  role: 'super_admin' | 'admin' | 'operator' | 'member';
  isAdmin: boolean;
}

/**
 * Checks the database-backed role for a specific user ID from public.user_roles.
 * Ensures permissions are database-enforced and cannot be spoofed via client state.
 */
export async function checkUserAdminRole(userId: string): Promise<UserRoleInfo> {
  if (!isSupabaseConfigured()) {
    // In unconfigured demo mode, fallback logic is handled by context
    return { role: 'member', isAdmin: false };
  }

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error querying user_roles:', error.message);
      return { role: 'member', isAdmin: false };
    }

    if (data && (data.role === 'admin' || data.role === 'super_admin')) {
      return { role: data.role, isAdmin: true };
    }

    return { role: (data?.role as any) || 'member', isAdmin: false };
  } catch (err) {
    console.error('Failed to verify admin role against Supabase:', err);
    return { role: 'member', isAdmin: false };
  }
}
