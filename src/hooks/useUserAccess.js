import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import hotmartService from '@/lib/hotmartService';

export const useUserAccess = (contentId = null) => {
  const { user } = useAuth(); // Asume que user viene de useAuth
  
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados adicionales para datos específicos
  const [userSubscription, setUserSubscription] = useState(null);
  const [hotmartData, setHotmartData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [videoStreamURL, setVideoStreamURL] = useState(null);

  // MODO TESTING - Para probar sin suscripción
  const isTestingMode = import.meta.env.DEV || window.location.search.includes('testing=true');

  const verifyAccess = async ({ isMounted = true, signal }) => {
    // TESTING MODE - Acceso automático en desarrollo
    if (isTestingMode) {
      setHasAccess(true);
      setUserSubscription({
        id: 'testing-sub',
        subscription_type: 'premium',
        status: 'active',
        product_name: 'Academia BSB Capital (Testing)'
      });
      setHotmartData({
        hasAccess: true,
        mockMode: true,
        productId: '6308462'
      });
      setIsLoading(false);
      return true;
    }

    // Si no hay usuario, el acceso es denegado por defecto.
    if (!user || !user.id) {
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }

    // Si la señal de aborto ya está activa, salir.
    if (signal?.aborted || !isMounted) return false;

    try {
      setIsLoading(true);
      setError(null);
      setHotmartData(null);
      setContentData(null);
      setVideoStreamURL(null);

      // 1. VERIFICAR SI ES ADMIN - Acceso automático
      console.log('🔍 Verificando perfil de admin para user.id:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('📊 Resultado de consulta de perfil:', { profile, profileError });
      
      if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
        console.log('🔧 ✅ Usuario admin detectado - Acceso completo otorgado', { role: profile.role });
        setHasAccess(true);
        setUserSubscription({
          id: 'admin-access',
          subscription_type: 'admin',
          status: 'active',
          product_name: 'Academia BSB Capital (Admin Access)'
        });
        setHotmartData({
          hasAccess: true,
          adminMode: true,
          productId: '6308462'
        });
        setIsLoading(false);
        return true;
      } else {
        console.log('❌ No es usuario admin o perfil no encontrado:', { 
          hasProfile: !!profile, 
          role: profile?.role,
          error: profileError 
        });
      }

      // 2. Verificar suscripción local en MÚLTIPLES TABLAS para usuarios normales
      const [subscriptionData, academyAccessData, userAccessData] = await Promise.all([
        // Tabla 1: user_subscriptions (principal)
        fetchWithTimeout(() => supabase
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
          .or('expired_at.is.null,expired_at.gt.now()')
          .order('created_at', { ascending: false })
          .limit(1), 10000, signal),
        
        // Tabla 2: user_academy_access (alternativa)
        fetchWithTimeout(() => supabase
          .from('user_academy_access')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1), 10000, signal),
        
        // Tabla 3: user_access (webhook legacy)
        fetchWithTimeout(() => supabase
          .from('user_access')
          .select('*')
          .eq('user_id', user.id)
          .eq('has_access', true)
          .order('created_at', { ascending: false })
          .limit(1), 10000, signal)
      ]);
      
      if (signal?.aborted || !isMounted) return false;

      // Determinar si tiene acceso desde cualquiera de las tablas
      const hasUserSubscription = subscriptionData?.data && subscriptionData.data.length > 0;
      const hasAcademyAccess = academyAccessData?.data && academyAccessData.data.length > 0;
      const hasUserAccess = userAccessData?.data && userAccessData.data.length > 0;
      
      const hasLocalSubscription = hasUserSubscription || hasAcademyAccess || hasUserAccess;
      
      // Establecer la suscripción prioritaria
      if (hasUserSubscription) {
        setUserSubscription(subscriptionData.data[0]);
        console.log('✅ Acceso verificado via user_subscriptions');
      } else if (hasAcademyAccess) {
        setUserSubscription({
          id: academyAccessData.data[0].id,
          subscription_type: 'hotmart',
          status: 'active',
          product_name: 'Academia BSB Capital',
          created_at: academyAccessData.data[0].created_at
        });
        console.log('✅ Acceso verificado via user_academy_access');
      } else if (hasUserAccess) {
        setUserSubscription({
          id: userAccessData.data[0].id,
          subscription_type: 'hotmart',
          status: 'active',
          product_name: 'Academia BSB Capital',
          created_at: userAccessData.data[0].created_at
        });
        console.log('✅ Acceso verificado via user_access');
      } else {
        setUserSubscription(null);
        console.log('❌ No se encontró acceso activo');
      }

      // 2. Verificar acceso a contenido específico con Hotmart (si contentId existe)
      if (contentId && user.email) {
        const hotmartProductId = hotmartService.getHotmartProductId(contentId);
        let currentAccessStatus = hasLocalSubscription; // Usar suscripción local como fallback inicial

        try {
          // Obtener datos completos del contenido desde Hotmart
          const contentResponse = await hotmartService.getContentData(hotmartProductId, user.email);
          if (signal?.aborted || !isMounted) return false;
          
          setHotmartData(contentResponse);
          
          if (contentResponse.hasAccess && contentResponse.contentData) {
            setContentData(contentResponse.contentData);
            currentAccessStatus = true;
            
            // Si hay videos, obtener URL de streaming del primero
            if (contentResponse.contentData.videos && contentResponse.contentData.videos.length > 0) {
              const firstVideo = contentResponse.contentData.videos[0];
              const streamURL = await hotmartService.getVideoStreamURL(firstVideo.id, user.email);
              if (signal?.aborted || !isMounted) return false;
              setVideoStreamURL(streamURL);
            }
          } else {
            // Hotmart denegó el acceso (o no encontró el producto)
            currentAccessStatus = false;
            setContentData(null);
            setVideoStreamURL(null);
          }
          setHasAccess(currentAccessStatus);
        } catch (hotmartError) {
          if (signal?.aborted || !isMounted) return false;
          console.warn('⚠️ Error con Hotmart API (usando solo suscripción local):', hotmartError.message);
          
          // Si el error es por credenciales faltantes, es OK para iframe embebido
          if (hotmartError.message?.includes('Credenciales de Hotmart no configuradas')) {
            console.info('🔧 Modo iframe embebido - No se requiere API completa');
            setHotmartData({
              hasAccess: hasLocalSubscription,
              iframeMode: true,
              productId: '6308462'
            });
          }
          
          // Fallback: Si Hotmart falla, nos quedamos con el estado de la suscripción local
          setHasAccess(hasLocalSubscription);
          setContentData(null);
          setVideoStreamURL(null);
        }
      } else {
        // 3. Sin content_id específico, usar solo suscripción local
        setHasAccess(hasLocalSubscription);
      }

      setIsLoading(false);
      return hasAccess; // El valor final de hasAccess

    } catch (err) {
      if (signal?.aborted || !isMounted) return false;
      console.error('Error verificando acceso:', err);
      setError(err.message || 'Error desconocido al verificar acceso');
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }
  };

  const refreshAccess = () => verifyAccess({ isMounted: true, signal: null });

  // Uso de useEffect y AbortController (CORRECTO)
  useEffect(() => {
    // 1. Evitar llamadas si no hay usuario o contentId necesario
    if (!user || !user.id) {
        setIsLoading(false);
        setHasAccess(false);
        return;
    }
    
    let isMounted = true;
    const abortController = new AbortController();
    
    // Llamada inicial
    verifyAccess({ isMounted, signal: abortController.signal });

    // Cleanup: se ejecuta al desmontar el componente o antes de re-ejecutar el effect
    return () => {
      isMounted = false;
      abortController.abort(); // Aborta cualquier fetch pendiente
    };
  }, [user?.id, contentId]); // Dependencias: Solo re-ejecutar si el usuario o el contentId cambian.

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