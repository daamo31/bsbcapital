import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export const useUserAccess = (productId = '6308462') => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVerified, setLastVerified] = useState(null);
  const { user } = useAuth();

  const verifyAccess = async (forceRefresh = false) => {
    if (!user) {
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Primero verificar en la base de datos local
      if (!forceRefresh) {
        const { data: localAccess, error: localError } = await supabase
          .from('user_access')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .limit(1);

        if (!localError && localAccess && localAccess.length > 0) {
          const accessData = localAccess[0];
          // Si la verificación es reciente (menos de 5 minutos), usar datos locales
          const lastVerifiedTime = new Date(accessData.last_verified);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          if (lastVerifiedTime > fiveMinutesAgo) {
            setHasAccess(accessData.has_access);
            setLastVerified(accessData.last_verified);
            setIsLoading(false);
            return localAccess.has_access;
          }
        }
      }

      // Verificar con Hotmart API
      const { data, error } = await supabase.functions.invoke('verify-access', {
        body: {
          userId: user.id,
          productId: productId,
          userEmail: user.email
        }
      });

      if (error) {
        throw error;
      }

      setHasAccess(data.hasAccess || false);
      setLastVerified(data.verified_at);
      setIsLoading(false);
      
      return data.hasAccess || false;
    } catch (err) {
      console.error('Error verificando acceso:', err);
      setError(err.message || 'Error verificando acceso');
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    verifyAccess();
  }, [user, productId]);

  return {
    hasAccess,
    isLoading,
    error,
    lastVerified,
    verifyAccess,
    refreshAccess: () => verifyAccess(true)
  };
};