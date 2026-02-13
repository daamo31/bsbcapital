import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/feedback/use-toast';
import { cleanCorruptedSupabaseTokens } from '@/utils/supabaseTokenCleaner';

/**
 * Global Authentication Context for the application.
 * Manages Supabase Auth sessions, user metadata, and localized profile states.
 * Wraps the entire application to provide 'useAuth' hook functionality.
 */
const AuthContext = createContext(undefined);

/**
 * Provider component that handles the authentication lifecycle.
 * It listens to Supabase auth changes and reconciles them with the local 'profiles' logic.
 */
export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  // --- Authentication States ---
  /** @type {Object|null} The current Supabase User object. */
  const [user, setUser] = useState(null);
  /** @type {Object|null} The current Supabase Session object. */
  const [session, setSession] = useState(null);
  /** @type {Object|null} A simplified view of the user profile (id, email, name, role). */
  const [profile, setProfile] = useState(null);
  /** @type {boolean} True while checking for an existing session on app load. */
  const [loading, setLoading] = useState(true);

  /**
   * Generates a local profile object from the authenticated user's metadata.
   * This bypasses the need for frequent DB lookups for basic UI display names and roles.
   *
   * @param {string} userId - UUID of the user.
   */
  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId || !user) {
        setProfile(null);
        return;
      }

      try {
        // Create a basic profile from auth data & metadata
        setProfile({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          role: user.app_metadata?.role || 'user',
        });
      } catch (error) {
        console.error('Error creating profile:', error);
        setProfile(null);
      }
    },
    [user]
  );

  /**
   * Internal handler to synchronize multiple states (session, user, profile)
   * whenever an auth event occurrs.
   *
   * @param {Object|null} currentSession - The session object from Supabase.
   */
  const handleSession = useCallback(async (currentSession) => {
    const currentUser = currentSession?.user ?? null;

    setSession(currentSession);
    setUser(currentUser);

    if (currentUser) {
      const authUser = currentSession.user;

      // Update local profile state immediately upon successful session detection
      setProfile({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        role: authUser.app_metadata?.role || 'user',
      });
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    /**
     * Initial boot logic: attempts to retrieve an existing session from local storage/cookies.
     */
    const getSessionAndProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        // 🚨 CRITICAL: Handle invalid or corrupted JWTs that prevent app from loading.
        if (error && (error.status === 403 || error.message?.includes('JWT'))) {
          console.warn('🚨 Auth error detected, cleaning tokens:', error);
          cleanCorruptedSupabaseTokens();
          if (isMounted) await handleSession(null);
          return;
        }

        if (!isMounted) return;
        await handleSession(currentSession);
      } catch (error) {
        console.error('Error in getSession:', error);
        // Fallback cleanup if session fetch fails critically
        if (error.message?.includes('JWT') || error.status === 403) {
          cleanCorruptedSupabaseTokens();
        }
        if (isMounted) await handleSession(null);
      } finally {
        // Only stop loading once the initial check and profile sync are done
        if (isMounted) setLoading(false);
      }
    };

    getSessionAndProfile();

    // Subscription: Listen for changes (login, logout, password recovery, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      await handleSession(session);

      // Ensure UI doesn't hang if an auth event fires during early mounting
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  /**
   * Sign up a new user with email and password.
   *
   * @param {string} email
   * @param {string} password
   * @param {Object} options - Metada (e.g., full_name).
   */
  const signUp = useCallback(
    async (email, password, options) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error en el registro',
          description: error.message || 'Algo salió mal',
        });
      }
      return { user: data.user, error };
    },
    [toast]
  );

  /**
   * Log into the application using email/password.
   * Includes automatic retries for unconfirmed emails via a custom RPC 'confirm_user_email'.
   *
   * @param {string} email
   * @param {string} password
   */
  const signIn = useCallback(
    async (email, password) => {
      let { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 🔧 AUTO-CONFIRMATION BYPASS:
      // If user exists but hasn't clicked verification link, attempt to confirm via DB.
      if (error && error.message?.includes('Email not confirmed')) {
        console.log('🔧 Email no confirmado, intentando confirmar automáticamente...');

        try {
          const { error: confirmError } = await supabase.rpc('confirm_user_email', {
            user_email: email,
          });

          if (!confirmError) {
            // Re-attempt login once confirmed
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            error = retryError;
          }
        } catch (rpcError) {
          console.log('RPC no disponible, continuando con error original');
        }
      }

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: error.message || 'Email o contraseña incorrectos.',
        });
      }

      return { error };
    },
    [toast]
  );

  /**
   * Sign out the current user and clear all auth states.
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cerrar sesión',
        description: error.message || 'Algo salió mal',
      });
    }
    return { error };
  }, [toast]);

  // Combined context value for consumption in components
  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile: () => (user ? fetchProfile(user.id) : Promise.resolve()),
    }),
    [user, session, profile, loading, signUp, signIn, signOut, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Access hook for AuthContext.
 * @returns {Object} { user, session, profile, loading, signUp, signIn, signOut, refreshProfile }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
