import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/feedback/use-toast';
import { cleanCorruptedSupabaseTokens } from '@/utils/supabaseTokenCleaner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    
    // No intentar buscar en la tabla profiles - crear perfil básico desde auth data
    try {
      setProfile({
        id: userId,
        email: user?.email,
        full_name: user?.user_metadata?.full_name || user?.email,
        role: user?.app_metadata?.role || 'user'
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      setProfile(null);
    }
  }, [user]);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      await fetchProfile(currentUser.id);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
        const getSessionAndProfile = async () => {
      setLoading(true);
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        // Si hay error 403 o JWT inválido, limpiar tokens
        if (error && (error.status === 403 || error.message?.includes('JWT'))) {
          console.warn('🚨 Error de autenticación detectado, limpiando tokens:', error);
          cleanCorruptedSupabaseTokens();
          return;
        }
        
        await handleSession(currentSession);
      } catch (error) {
        console.error('Error en getSession:', error);
        // Si hay cualquier error de sesión, limpiar y reintentar
        if (error.message?.includes('JWT') || error.status === 403) {
          cleanCorruptedSupabaseTokens();
        } else {
          await handleSession(null);
        }
      }
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error.message || "Algo salió mal",
      });
    }
    return { user: data.user, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    // BYPASS TEMPORAL: Intentar login normal primero
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Si falla por email no confirmado, intentar confirmar automáticamente
    if (error && error.message?.includes('Email not confirmed')) {
      console.log('🔧 Email no confirmado, intentando confirmar automáticamente...');
      
      try {
        // Confirmar email vía RPC (si está disponible)
        const { error: confirmError } = await supabase.rpc('confirm_user_email', {
          user_email: email
        });
        
        if (!confirmError) {
          // Reintentar login después de confirmar
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
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Email o contraseña incorrectos.",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message || "Algo salió mal",
      });
    }
    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(),
  }), [user, session, profile, loading, signUp, signIn, signOut, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};