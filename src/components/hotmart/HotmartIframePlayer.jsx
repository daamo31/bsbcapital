import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useUserAccess } from '@/hooks/useUserAccess';
import { 
  Play, 
  ExternalLink, 
  Maximize, 
  Minimize,
  Loader2,
  Shield,
  Eye,
  Clock,
  Download
} from 'lucide-react';

/**
 * Componente para mostrar contenido de Hotmart embebido en iframe
 * Esta es la implementación profesional recomendada que mantiene 
 * a los usuarios dentro de tu diseño web
 */
const HotmartIframePlayer = ({ 
  contentId, 
  title, 
  description,
  hotmartProductId,
  hotmartVideoId,
  allowFullscreen = true,
  customHeight = "500px"
}) => {
  const { hasAccess, isLoading, error } = useUserAccess(contentId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // URLs de iframe de Hotmart
  const getHotmartIframeUrl = () => {
    const productId = hotmartProductId || import.meta.env.VITE_HOTMART_PRODUCT_ID;
    const videoId = hotmartVideoId || contentId;
    
    // URL base para embed de Hotmart
    // Esta es la URL que Hotmart proporciona para embeds
    const baseUrl = 'https://player.hotmart.com/embed';
    
    // Parámetros para personalizar el iframe
    const params = new URLSearchParams({
      product: productId,
      video: videoId,
      autoplay: '0',
      controls: '1',
      showinfo: '1',
      branding: '0', // Ocultar branding de Hotmart
      color: '0066cc', // Color de tu marca
      theme: 'light'
    });
    
    return `${baseUrl}/${videoId}?${params.toString()}`;
  };

  // Manejo de pantalla completa
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Detectar cambios en fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Manejo de eventos del iframe
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  // Comunicación con el iframe (si Hotmart lo soporta)
  useEffect(() => {
    const handleMessage = (event) => {
      // Verificar origen por seguridad
      if (event.origin !== 'https://player.hotmart.com') {
        return;
      }

      // Manejar mensajes del reproductor
      const { type, data } = event.data;
      
      switch (type) {
        case 'playerReady':
          console.log('Reproductor de Hotmart listo');
          break;
        case 'videoStart':
          console.log('Video iniciado:', data);
          break;
        case 'videoEnd':
          console.log('Video terminado:', data);
          break;
        case 'progress':
          console.log('Progreso del video:', data);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando acceso al contenido...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200 rounded-lg opacity-50"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-sm">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="mb-6">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {error ? 'Error verificando acceso' : 'Requiere suscripción activa'}
            </Badge>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/membresias'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Planes de Suscripción
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (iframeError) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <ExternalLink className="h-12 w-12 text-red-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-900">Error cargando contenido</h3>
          <p className="text-red-700 mb-4">
            No se pudo cargar el contenido embebido. Puedes acceder directamente.
          </p>
          <Button 
            onClick={() => window.open(getHotmartIframeUrl(), '_blank')}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en nueva pestaña
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del reproductor */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
              {description && (
                <CardDescription className="text-gray-600 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Eye className="h-3 w-3 mr-1" />
                Acceso Premium
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reproductor embebido */}
      <Card className="overflow-hidden">
        <div 
          ref={containerRef}
          className={`relative bg-black ${
            isFullscreen 
              ? 'fixed inset-0 z-50 bg-black' 
              : 'rounded-lg'
          }`}
          style={{ 
            height: isFullscreen ? '100vh' : customHeight,
            minHeight: isFullscreen ? '100vh' : '400px'
          }}
        >
          {/* Overlay de carga */}
          {!iframeLoaded && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                <p className="text-sm">Cargando contenido de Hotmart...</p>
              </div>
            </div>
          )}

          {/* Iframe de Hotmart */}
          <iframe
            ref={iframeRef}
            src={getHotmartIframeUrl()}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={allowFullscreen}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            style={{
              borderRadius: isFullscreen ? '0' : '0.5rem',
            }}
          />

          {/* Controles superpuestos */}
          {iframeLoaded && allowFullscreen && (
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="secondary"
                className="bg-black/50 text-white hover:bg-black/70 border-0"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Contenido Embebido de Hotmart
              </h4>
              <p className="text-sm text-blue-700">
                Este contenido se muestra directamente desde Hotmart dentro de nuestro diseño. 
                Nunca sales de la plataforma BSB Capital.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => window.open(getHotmartIframeUrl(), '_blank')}
                size="sm"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Abrir directo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotmartIframePlayer;