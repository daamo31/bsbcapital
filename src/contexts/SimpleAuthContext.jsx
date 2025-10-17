import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/feedback/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    setLoading(false);
  }, []);

  const getSessionAndProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    } catch (error) {
      console.error('Error getting session:', error);
      setLoading(false);
    }
  }, [handleSession]);

  useEffect(() => {
    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      await handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [getSessionAndProfile, handleSession]);

  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: 'Error de autenticación',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo'
      });

      return { data };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error durante el inicio de sesión',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        toast({
          title: 'Error de registro',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Registro exitoso',
        description: 'Por favor, verifica tu email para completar el registro'
      });

      return { data };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error durante el registro',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente'
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al cerrar sesión',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resetPassword = useCallback(async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      toast({
        title: 'Email enviado',
        description: 'Revisa tu email para restablecer tu contraseña'
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al enviar el email',
        variant: 'destructive'
      });
      return { error };
    }
  }, [toast]);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    // Helper para verificar si el usuario está autenticado
    isAuthenticated: !!user,
    // Helper para obtener el rol del usuario
    userRole: user?.app_metadata?.role || 'user',
    // Helper para verificar si es admin
    isAdmin: user?.app_metadata?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};