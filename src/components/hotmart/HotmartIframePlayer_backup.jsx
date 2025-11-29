import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useUserAccess } from '@/hooks/useUserAccess';
import { buildHotmartIframeUrl, getContentConfig } from '@/lib/hotmartIframeConfig';
import {
  ExternalLink,
  Loader2,
  Shield,
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

/**
 * Componente para mostrar videos de Hotmart usando iframe directo
 * Evita problemas de DOM y scripts externos
 */
const HotmartIframePlayer = ({
  contentId,
  title,
  description,
  hotmartVideoId, // ID del video en Hotmart (ej: "abc123")
  hotmartProductId, // ID del producto (opcional)
  customHeight = "500px"
}) => {
  const { hasAccess, isLoading, error } = useUserAccess(contentId);
  const [iframeError, setIframeError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Limpiar y validar el ID del video
  const cleanVideoId = hotmartVideoId ? hotmartVideoId.trim() : null;

  // Generar URLs alternativas para iframe de Hotmart
  const generateIframeUrls = (videoId) => {
    const productId = hotmartProductId || import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462';
    
    return [
      // URL oficial del club de BSB Capital basada en la URL que proporcionaste
      `https://hotmart.com/es/club/bsb-capital-fz-llc/products/${productId}/content/${videoId}`,
      
      // URL de embed directo
      `https://embed.hotmart.com/video/${productId}/${videoId}`,
      
      // URL alternativa con player.hotmart.com
      `https://player.hotmart.com/embed/${videoId}?product=${productId}`,
      
      // URL de contenido directo
      `https://content.hotmart.com/player/${productId}/${videoId}`,
      
      // Usar configuración avanzada si existe
      buildHotmartIframeUrl(productId, videoId),
      
      // Fallback simple
      `https://player.hotmart.com/embed/${videoId}`
    ].filter(Boolean);
  };

  const iframeUrls = cleanVideoId ? generateIframeUrls(cleanVideoId) : [];
  const currentIframeUrl = iframeUrls[currentUrlIndex] || '';
  
  // Handler para reintentar con siguiente URL
  const handleRetry = () => {
    if (currentUrlIndex < iframeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIframeError(false);
      console.log(`HotmartIframePlayer: Probando URL alternativa ${currentUrlIndex + 1}:`, iframeUrls[currentUrlIndex + 1]);
    } else {
      setRetryCount(prev => prev + 1);
      setCurrentUrlIndex(0);
      console.log('HotmartIframePlayer: Reiniciando desde la primera URL');
    }
  };

  // Log para debug
  useEffect(() => {
    console.log('HotmartIframePlayer: Debug info', { 
      hasAccess, 
      originalId: hotmartVideoId,
      cleanVideoId,
      contentId,
      currentUrl: currentIframeUrl,
      urlIndex: currentUrlIndex,
      totalUrls: iframeUrls.length
    });
  }, [hasAccess, hotmartVideoId, cleanVideoId, contentId, currentIframeUrl, currentUrlIndex, iframeUrls.length]);

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

  if (!cleanVideoId) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-8 text-center">
          <ExternalLink className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-yellow-900">Video no configurado</h3>
          <p className="text-yellow-700">
            Este contenido aún no tiene un ID de video de Hotmart asignado.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Verificar si es un placeholder
  if (cleanVideoId.includes('TU_VIDEO') || cleanVideoId === 'TU_VIDEO_INTRO_ID') {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-8 text-center">
          <ExternalLink className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-orange-900">Configuración pendiente</h3>
          <p className="text-orange-700 mb-4">
            El ID de video <code className="bg-orange-100 px-2 py-1 rounded text-sm">{cleanVideoId}</code> es un placeholder que debe ser reemplazado.
          </p>
          <p className="text-sm text-orange-600">
            Por favor, actualiza la base de datos con el ID real del video de Hotmart.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Generar URLs alternativas para iframe de Hotmart
  const generateIframeUrls = (videoId) => {
    const productId = hotmartProductId || import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462';
    
    return [
      // URL oficial del club de BSB Capital
      `https://embed.hotmart.com/video/${productId}/${videoId}`,
      
      // URL alternativa con player.hotmart.com
      `https://player.hotmart.com/embed/${videoId}?product=${productId}`,
      
      // URL de contenido directo
      `https://content.hotmart.com/player/${productId}/${videoId}`,
      
      // Usar configuración avanzada si existe
      buildHotmartIframeUrl(productId, videoId),
      
      // Fallback simple
      `https://player.hotmart.com/embed/${videoId}`
    ].filter(Boolean);
  };

  const iframeUrls = cleanVideoId ? generateIframeUrls(cleanVideoId) : [];
  const currentIframeUrl = iframeUrls[currentUrlIndex] || '';
  
  // Handler para reintentar con siguiente URL
  const handleRetry = () => {
    if (currentUrlIndex < iframeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIframeError(false);
      console.log(`HotmartIframePlayer: Probando URL alternativa ${currentUrlIndex + 1}:`, iframeUrls[currentUrlIndex + 1]);
    } else {
      setRetryCount(prev => prev + 1);
      setCurrentUrlIndex(0);
      console.log('HotmartIframePlayer: Reiniciando desde la primera URL');
    }
  };

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
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Eye className="h-3 w-3 mr-1" />
              Acceso Premium
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Reproductor de Hotmart */}
      <Card className="overflow-hidden">
        {iframeError && (
          <div className="bg-red-50 border-b border-red-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-red-800 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error cargando video (URL {currentUrlIndex + 1}/{iframeUrls.length}). 
                {currentUrlIndex < iframeUrls.length - 1 ? 'Probando alternativa...' : 'Todas las URLs fallaron.'}
              </p>
              {currentUrlIndex < iframeUrls.length - 1 && (
                <Button size="sm" variant="outline" onClick={handleRetry}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div 
          className="bg-black rounded-lg"
          style={{
            minHeight: customHeight,
            width: '100%'
          }}
        >
          <iframe
            key={`iframe-${currentUrlIndex}-${retryCount}`}
            src={currentIframeUrl}
            width="100%"
            height={customHeight}
            frameBorder="0"
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
            loading="lazy"
            style={{ 
              borderRadius: '8px',
              display: 'block',
              border: 'none'
            }}
            onLoad={() => {
              console.log(`HotmartIframePlayer: Iframe loaded successfully (URL ${currentUrlIndex + 1})`);
              setIframeError(false);
            }}
            onError={() => {
              console.error(`HotmartIframePlayer: Iframe failed to load (URL ${currentUrlIndex + 1}):`, currentIframeUrl);
              setIframeError(true);
              // Auto-reintentar con siguiente URL después de un breve delay
              setTimeout(() => {
                if (currentUrlIndex < iframeUrls.length - 1) {
                  handleRetry();
                }
              }, 2000);
            }}
            title={title || 'Video de Hotmart'}
          />
        </div>
      </Card>
    </div>
  );
};

export default HotmartIframePlayer;