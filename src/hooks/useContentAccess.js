import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import contentService from '@/lib/contentService';

export const useContentAccess = (contentId = null, moduleId = null) => {
  const { user } = useAuth();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados específicos del contenido
  const [content, setContent] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [videoStreamURL, setVideoStreamURL] = useState(null);
  const [downloadURL, setDownloadURL] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [accessReason, setAccessReason] = useState(null);

  const checkAccess = async ({ isMounted = true, signal }) => {
    if (!user?.id) {
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }

    if (signal?.aborted || !isMounted) return false;

    try {
      setIsLoading(true);
      setError(null);

      if (contentId) {
        // Verificar acceso a contenido específico
        const accessResult = await contentService.checkUserAccess(user.id, contentId);
        
        if (signal?.aborted || !isMounted) return false;

        setHasAccess(accessResult.hasAccess);
        setAccessReason(accessResult.reason);
        
        if (accessResult.hasAccess && accessResult.content) {
          setContent(accessResult.content);

          // Obtener progreso del usuario para este contenido
          const progress = await contentService.getUserProgress(user.id, contentId);
          setUserProgress(progress);

          // Si es video, obtener URL de streaming
          if (accessResult.content.content_type === 'video') {
            try {
              const streamURL = await contentService.getVideoStreamURL(contentId, user.id);
              if (signal?.aborted || !isMounted) return false;
              setVideoStreamURL(streamURL);
            } catch (streamError) {
              console.error('Error obteniendo URL de video:', streamError);
              setVideoStreamURL(null);
            }
          }

          // Si es documento, obtener URL de descarga
          if (['pdf', 'document'].includes(accessResult.content.content_type)) {
            try {
              const dlURL = await contentService.getFileDownloadURL(contentId, user.id);
              if (signal?.aborted || !isMounted) return false;
              setDownloadURL(dlURL);
            } catch (dlError) {
              console.error('Error obteniendo URL de descarga:', dlError);
              setDownloadURL(null);
            }
          }
        } else {
          setContent(null);
          setVideoStreamURL(null);
          setDownloadURL(null);
          setUserProgress(null);
        }

      } else if (moduleId) {
        // Obtener contenido completo del módulo
        const moduleData = await contentService.getModuleContent(moduleId, user.id);
        
        if (signal?.aborted || !isMounted) return false;

        if (moduleData) {
          setModuleContent(moduleData);
          // Verificar si tiene acceso a al menos un elemento del módulo
          const hasAnyAccess = moduleData.content.some(item => item.hasAccess);
          setHasAccess(hasAnyAccess);
          setAccessReason(hasAnyAccess ? 'module_access' : 'no_module_access');
        } else {
          setModuleContent(null);
          setHasAccess(false);
          setAccessReason('module_not_found');
        }
      }

      setIsLoading(false);
      return hasAccess;

    } catch (err) {
      if (signal?.aborted || !isMounted) return false;
      
      console.error('Error verificando acceso al contenido:', err);
      setError(err.message || 'Error desconocido al verificar acceso');
      setHasAccess(false);
      setIsLoading(false);
      return false;
    }
  };

  const refreshAccess = () => checkAccess({ isMounted: true, signal: null });

  // Función para actualizar progreso
  const updateProgress = async (progressData) => {
    if (!user?.id || !contentId) return false;

    try {
      const success = await contentService.updateUserProgress(user.id, contentId, progressData);
      if (success) {
        // Actualizar estado local del progreso
        const newProgress = await contentService.getUserProgress(user.id, contentId);
        setUserProgress(newProgress);
      }
      return success;
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      return false;
    }
  };

  // Función para marcar como completado
  const markAsCompleted = async () => {
    return await updateProgress({
      completed: true,
      progress_percentage: 100,
      completed_at: new Date().toISOString()
    });
  };

  // Función para actualizar tiempo visto (para videos)
  const updateWatchTime = async (timeWatchedSeconds, lastPositionSeconds = null) => {
    const progressData = {
      time_watched_seconds: timeWatchedSeconds,
      last_accessed_at: new Date().toISOString()
    };

    if (lastPositionSeconds !== null) {
      progressData.last_position_seconds = lastPositionSeconds;
    }

    // Calcular porcentaje si sabemos la duración
    if (content?.duration_seconds) {
      const percentage = Math.min((timeWatchedSeconds / content.duration_seconds) * 100, 100);
      progressData.progress_percentage = percentage;

      // Auto-completar si vio más del 90%
      if (percentage >= 90) {
        progressData.completed = true;
        progressData.completed_at = new Date().toISOString();
      }
    }

    return await updateProgress(progressData);
  };

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setHasAccess(false);
      return;
    }
    
    let isMounted = true;
    const abortController = new AbortController();
    
    checkAccess({ isMounted, signal: abortController.signal });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user?.id, contentId, moduleId]);

  return {
    // Estados principales
    hasAccess,
    isLoading,
    error,
    accessReason,

    // Datos del contenido
    content,
    moduleContent,
    videoStreamURL,
    downloadURL,
    userProgress,

    // Funciones
    refreshAccess,
    updateProgress,
    markAsCompleted,
    updateWatchTime
  };
};