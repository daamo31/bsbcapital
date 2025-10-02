import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import hotmartService from '@/lib/hotmartService';

export const useUserAccess = (contentId = null) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [hotmartData, setHotmartData] = useState(null);
  const [contentData, setContentData] = useState(null);  // Datos del contenido de Hotmart
  const [videoStreamURL, setVideoStreamURL] = useState(null);  // URL directa del video
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

      // Verificar suscripción local primero (para UI/UX rápido)
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            name,
            features,
            duration_months
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(1);

      const hasLocalSubscription = subscription && subscription.length > 0;
      setUserSubscription(hasLocalSubscription ? subscription[0] : null);

      // Si hay contentId específico, verificar con Hotmart
      if (contentId && user.email) {
        const hotmartProductId = hotmartService.getHotmartProductId(contentId);
        
        try {
          // Obtener datos completos del contenido desde Hotmart
          const contentResponse = await hotmartService.getContentData(hotmartProductId, user.email);
          setHotmartData(contentResponse);
          
          if (contentResponse.hasAccess && contentResponse.contentData) {
            setContentData(contentResponse.contentData);
            setHasAccess(true);
            
            // Si hay videos, obtener URL de streaming del primero
            if (contentResponse.contentData.videos && contentResponse.contentData.videos.length > 0) {
              const firstVideo = contentResponse.contentData.videos[0];
              const streamURL = await hotmartService.getVideoStreamURL(firstVideo.id, user.email);
              setVideoStreamURL(streamURL);
            }
          } else {
            setHasAccess(false);
            setContentData(null);
            setVideoStreamURL(null);
          }
        } catch (hotmartError) {
          console.warn('Error obteniendo contenido de Hotmart, usando suscripción local:', hotmartError);
          // Fallback a verificación local si Hotmart falla
          setHasAccess(hasLocalSubscription);
          setContentData(null);
        }
      } else {
        // Sin content_id específico, usar solo suscripción local
        setHasAccess(hasLocalSubscription);
      }

      setIsLoading(false);
      return hasAccess;

    } catch (err) {
      console.error('Error verificando acceso:', err);
      setError(err.message || 'Error verificando acceso');
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }
  };

  const refreshAccess = () => verifyAccess(true);

  useEffect(() => {
    verifyAccess();
  }, [user?.id, contentId]);

  return {
    hasAccess,
    isLoading,
    error,
    userSubscription,
    hotmartData,
    contentData,      // Datos completos del contenido
    videoStreamURL,   // URL directa para reproducir video
    refreshAccess
  };
};
