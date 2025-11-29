import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useUserAccess } from '@/hooks/useUserAccess';
import {
  ExternalLink,
  Loader2,
  Shield,
  Eye,
  AlertCircle,
  PlayCircle,
  Lock
} from 'lucide-react';

/**
 * Componente para mostrar acceso a videos de Hotmart
 * Redirige a los usuarios autenticados al área de miembros de Hotmart
 */
const HotmartIframePlayer = ({
  contentId,
  title,
  description,
  hotmartVideoId, // ID del video en Hotmart (ej: "abc123")
  hotmartProductId, // ID del producto (opcional)
  customHeight = "500px"
}) => {
  // Extraer videoStreamURL del hook
  const { hasAccess, isLoading, error, videoStreamURL } = useUserAccess(contentId);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // Limpiar y validar el ID del video
  const cleanVideoId = hotmartVideoId ? hotmartVideoId.trim() : null;

  // ID del producto (usar el proporcionado o el default)
  const productId = hotmartProductId || import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462';

  // Construir la URL del área de miembros de Hotmart
  const hotmartClubUrl = cleanVideoId
    ? `https://hotmart.com/es/club/bsb-capital-fz-llc/products/${productId}/content/${cleanVideoId}`
    : `https://hotmart.com/es/club/bsb-capital-fz-llc/products/${productId}`;

  // Efecto para cargar el script de Hotmart Sparkle solo si se activa el modo embed
  useEffect(() => {
    if (!showEmbed || !cleanVideoId || !hasAccess) return;

    if (!window.hspark) {
      const script = document.createElement('script');
      script.src = 'https://static.hotmart.com/js/hspark.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Hotmart Sparkle script cargado');
      };
      script.onerror = () => {
        console.error('❌ Error cargando Hotmart Sparkle script');
        setEmbedError(true);
      };
      document.body.appendChild(script);
    }
  }, [showEmbed, cleanVideoId, hasAccess]);

  // Handler para abrir el contenido en Hotmart
  const handleOpenInHotmart = () => {
    window.open(hotmartClubUrl, '_blank', 'noopener,noreferrer');
  };

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

  // 1. Si tenemos URL de stream directa (vía API), mostrar reproductor nativo
  if (videoStreamURL) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <div className="bg-black aspect-video w-full relative">
              <video
                src={videoStreamURL}
                controls
                className="w-full h-full"
                poster="/placeholder-video.jpg"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Si el usuario activó el modo embed
  if (showEmbed) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowEmbed(false)}>
                Volver a opciones
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg bg-black" style={{ minHeight: customHeight }}>
            {embedError ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-white">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-center mb-4">No se pudo cargar el reproductor embebido.</p>
                <Button onClick={handleOpenInHotmart} variant="secondary">
                  Abrir en Hotmart
                </Button>
              </div>
            ) : (
              <div
                className="hspark-embed"
                data-video-id={cleanVideoId}
                data-product-id={productId}
                data-autoplay="false"
                data-controls="true"
                style={{ width: '100%', height: customHeight }}
              >
                {!window.hspark && (
                  <div className="flex items-center justify-center h-full min-h-[400px] text-white">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Default: Mostrar tarjeta de acceso con opciones
  return (
    <div className="space-y-4">
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

      <Card className="overflow-hidden">
        <div
          className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative"
          style={{ minHeight: customHeight, width: '100%' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[500px] text-white p-8">
            <div className="text-center max-w-2xl">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-2xl opacity-50 animate-pulse"></div>
                <PlayCircle className="h-24 w-24 mx-auto relative text-white drop-shadow-lg" strokeWidth={1.5} />
              </div>

              <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
                Contenido Premium de Hotmart
              </h2>

              <p className="text-lg mb-8 text-blue-100">
                {title}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleOpenInHotmart}
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 py-6 text-lg shadow-xl"
                >
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Ver en Hotmart (Recomendado)
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  onClick={() => setShowEmbed(true)}
                  variant="outline"
                  className="bg-transparent border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white px-6 py-6"
                >
                  Intentar reproducir aquí
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-blue-200">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Acceso Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HotmartIframePlayer;