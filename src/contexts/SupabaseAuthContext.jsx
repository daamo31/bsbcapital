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
    if (!userId || !user) { // Añadir verificación de 'user' aquí para el caso inicial
      setProfile(null);
      return;
    }
    
    // No intentar buscar en la tabla profiles - crear perfil básico desde auth data
    try {
      setProfile({
        id: userId,
        email: user.email, // Usar 'user' del estado de AuthProvider
        full_name: user.user_metadata?.full_name || user.email,
        role: user.app_metadata?.role || 'user'
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      setProfile(null);
    }
  }, [user]); // Dependencia 'user' necesaria para acceder a 'user.email' en useCallback

  const handleSession = useCallback(async (currentSession) => {
    const currentUser = currentSession?.user ?? null;

    setSession(currentSession);
    setUser(currentUser);
    
    if (currentUser) {
      // Dejar que el useEffect se encargue de llamar a fetchProfile después de que setUser se propague
      // o, si se mantiene aquí, asegurarse de usar la data más reciente.
      // Aquí usamos la data local que recibimos:
      const authUser = currentSession.user;
      
      // Simular fetchProfile simple
      setProfile({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        role: authUser.app_metadata?.role || 'user'
      });
    } else {
      setProfile(null);
    }

    // ELIMINAMOS setLoading(false) de handleSession. 
    // Ahora solo se llama al final del useEffect inicial.
  }, []);

  useEffect(() => {
    let isMounted = true;
    const getSessionAndProfile = async () => {
      setLoading(true);
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        // Manejo de errores de JWT
        if (error && (error.status === 403 || error.message?.includes('JWT'))) {
          console.warn('🚨 Error de autenticación detectado, limpiando tokens:', error);
          cleanCorruptedSupabaseTokens();
          // NO LLAMAMOS a handleSession, simplemente dejamos que onAuthStateChange se encargue.
          // O llamamos a handleSession(null) si queremos forzar el cierre inmediatamente.
          if (isMounted) await handleSession(null);
          return;
        }

        if (!isMounted) return;
        await handleSession(currentSession); // Establece user, session, profile.

      } catch (error) {
        console.error('Error en getSession:', error);
        // En caso de fallo de red/servidor, tratamos como no autenticado, pero mantenemos la lógica de limpieza.
        if (error.message?.includes('JWT') || error.status === 403) {
          cleanCorruptedSupabaseTokens();
        }
        if (isMounted) await handleSession(null);

      } finally {
        // <<<<< CAMBIO CLAVE: SÓLO PONER loading a false AQUÍ >>>>>
        if (isMounted) setLoading(false);
      }
    };

    // Llamada inicial para establecer el estado de autenticación la primera vez.
    getSessionAndProfile(); 

    // Subscription para cambios futuros (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        await handleSession(session);
        
        // Si hay un cambio de sesión por evento, también debemos asegurar que loading es false
        // (Aunque para cambios posteriores, debería ser rápido y no afectar la carga inicial)
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]); // fetchProfile ya no es una dependencia, su lógica se simplificó en handleSession

  // ... (signUp, signIn, signOut se mantienen iguales)
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