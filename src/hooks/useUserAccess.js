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

      // 🧪 MODO DE PRUEBA: Simular membresía premium automáticamente
      const isTestMode = window.location.pathname.includes('/test') || 
                        window.location.pathname.includes('/hotmart') ||
                        import.meta.env.VITE_FORCE_PREMIUM_ACCESS === 'true';

      if (isTestMode) {
        // Simular suscripción premium para testing
        const mockPremiumSubscription = {
          id: 'mock-premium-sub',
          user_id: user.id,
          plan_id: 3,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
          subscription_plans: {
            id: 3,
            name: 'Premium BSB Capital',
            features: ['Acceso completo a academia', 'Todos los videos', 'Recursos descargables', 'Soporte prioritario'],
            duration_months: 12
          }
        };

        setUserSubscription(mockPremiumSubscription);
        setHasAccess(true);

        // Simular datos de contenido de Hotmart para testing
        if (contentId) {
          const mockContentData = {
            videos: [
              {
                id: 'mock_video_1',
                title: `Video principal - ${contentId}`,
                duration: '25:30',
                stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              },
              {
                id: 'mock_video_2', 
                title: 'Conceptos avanzados',
                duration: '18:45',
                stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
              }
            ],
            documents: [
              { title: 'Manual del curso PDF', type: 'PDF', size: '2.5 MB', url: '/mock/manual.pdf' },
              { title: 'Plantilla Excel', type: 'XLSX', size: '1.2 MB', url: '/mock/plantilla.xlsx' }
            ],
            audios: [
              { title: 'Podcast bonus', duration: '18:30', url: '/mock/podcast.mp3' }
            ]
          };

          setContentData(mockContentData);
          setVideoStreamURL(mockContentData.videos[0].stream_url);
          setHotmartData({ 
            hasAccess: true, 
            status: 'ACTIVE',
            subscription: mockPremiumSubscription,
            mockMode: true 
          });
        }

        setIsLoading(false);
        return true;
      }

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
