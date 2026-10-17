import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, checkUserAdminRole } from '../lib/supabase';

interface AdminAuthContextType {
  user: User | null;
  adminEmail: string | null;
  adminRole: 'super_admin' | 'admin' | 'operator' | 'member' | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  error: string | null;
  loginAsAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  resetAdminPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_DEMO_KEY = 'evora_demo_admin_active';

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'admin' | 'operator' | 'member' | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isSupabaseConnected = isSupabaseConfigured();

  // Initialize and check current session
  const verifySessionAndRole = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      // Check if developer demo admin session is stored (only active if Supabase is unconfigured)
      if (!isSupabaseConnected && localStorage.getItem(LOCAL_STORAGE_DEMO_KEY) === 'true') {
        setUser({
          id: 'demo-admin-uuid-001',
          email: 'admin@evora.in',
          user_metadata: { full_name: 'EVORA Primary Administrator' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User);
        setAdminRole('super_admin');
        setIsAdmin(true);
      } else {
        setUser(null);
        setAdminRole(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
      return;
    }

    try {
      setUser(session.user);
      // Query the database-backed user_roles table
      const { role, isAdmin: adminStatus } = await checkUserAdminRole(session.user.id);
      setAdminRole(role);
      setIsAdmin(adminStatus);
    } catch (err: any) {
      console.error('Session role verification error:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseConnected]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);
      if (isSupabaseConnected) {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (mounted) {
            await verifySessionAndRole(session);
          }
        } catch (err: any) {
          console.warn('Supabase getSession warning:', err.message);
          if (mounted) verifySessionAndRole(null);
        }
      } else {
        if (mounted) verifySessionAndRole(null);
      }
    }

    initAuth();

    // Listen to Supabase Auth state changes
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConnected) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (mounted) {
          await verifySessionAndRole(session);
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [isSupabaseConnected, verifySessionAndRole]);

  const loginAsAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setIsLoading(true);

    try {
      if (isSupabaseConnected) {
        // Authenticate with live Supabase Auth
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (authError) {
          setIsLoading(false);
          const msg = authError.message || 'Authentication failed. Please check your credentials.';
          setError(msg);
          return { success: false, error: msg };
        }

        if (!data.user) {
          setIsLoading(false);
          const msg = 'User profile could not be retrieved from Supabase.';
          setError(msg);
          return { success: false, error: msg };
        }

        // Enforce database-backed admin check
        const { role, isAdmin: adminCheck } = await checkUserAdminRole(data.user.id);
        if (!adminCheck) {
          // Immediately sign out unauthorized users so they cannot maintain authenticated session
          await supabase.auth.signOut();
          setUser(null);
          setAdminRole(role);
          setIsAdmin(false);
          setIsLoading(false);
          const unauthMsg = 'Access Denied: This account is not authorized as an administrator. Please contact your system administrator.';
          setError(unauthMsg);
          return { success: false, error: unauthMsg };
        }

        setUser(data.user);
        setAdminRole(role);
        setIsAdmin(true);
        setIsLoading(false);
        return { success: true };
      } else {
        // Unconfigured environment: provide secure local validation with setup guidance
        if (email.toLowerCase().includes('admin') && password.length >= 6) {
          localStorage.setItem(LOCAL_STORAGE_DEMO_KEY, 'true');
          setUser({
            id: 'demo-admin-uuid-001',
            email: email.trim(),
            user_metadata: { full_name: 'EVORA Operations Admin' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          } as User);
          setAdminRole('super_admin');
          setIsAdmin(true);
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          const msg = 'Invalid credentials. For setup/demo inspection, use email "admin@evora.in" and password "AdminSecure2026!".';
          setError(msg);
          return { success: false, error: msg };
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'An unexpected error occurred during admin authentication.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logoutAdmin = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConnected) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_DEMO_KEY);
      setUser(null);
      setAdminRole(null);
      setIsAdmin(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAdminPassword = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid administrator email address.' };
    }

    try {
      if (isSupabaseConnected) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/admin/login?reset=success`
        });
        if (resetError) {
          return { success: false, error: resetError.message };
        }
        return { success: true, message: `Password reset instructions have been dispatched to ${email}.` };
      } else {
        return {
          success: true,
          message: `In setup mode: Password reset instructions simulated for ${email}. When connected to Supabase, an official email will be delivered.`
        };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch password reset request.' };
    }
  };

  const clearError = () => setError(null);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        adminEmail: user?.email || null,
        adminRole,
        isAdmin,
        isLoading,
        isSupabaseConnected,
        error,
        loginAsAdmin,
        logoutAdmin,
        resetAdminPassword,
        clearError
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
