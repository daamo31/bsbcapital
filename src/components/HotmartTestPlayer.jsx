import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserAccess } from '@/hooks/useUserAccess';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  AlertCircle,
  ExternalLink,
  Video,
  Download,
  Clock,
  Users,
  Star,
  Zap
} from 'lucide-react';

const HotmartTestPlayer = ({ contentId, title, description, mockContent = false }) => {
  const { hasAccess, isLoading, error, hotmartData } = useUserAccess(contentId);
  const [testMode, setTestMode] = useState('demo'); // 'demo', 'mock', 'real'

  // Datos simulados para testing
  const mockVideoData = {
    videos: [
      {
        id: 'video_001',
        title: 'Introducción al módulo',
        duration: '15:30',
        stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        id: 'video_002', 
        title: 'Conceptos fundamentales',
        duration: '22:45',
        stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      }
    ],
    documents: [
      { title: 'Manual del curso PDF', type: 'PDF', size: '2.5 MB' },
      { title: 'Plantilla Excel', type: 'XLSX', size: '1.2 MB' }
    ],
    audios: [
      { title: 'Podcast bonus', duration: '18:30' }
    ]
  };

  const renderTestControls = () => (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-900 mb-3">🧪 Modo de Prueba</h4>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={testMode === 'demo' ? 'default' : 'outline'}
          onClick={() => setTestMode('demo')}
        >
          Demo Visual
        </Button>
        <Button
          size="sm"
          variant={testMode === 'mock' ? 'default' : 'outline'}
          onClick={() => setTestMode('mock')}
        >
          Mock Hotmart
        </Button>
        <Button
          size="sm"
          variant={testMode === 'real' ? 'default' : 'outline'}
          onClick={() => setTestMode('real')}
        >
          API Real
        </Button>
      </div>
    </div>
  );

  const renderDemoMode = () => (
    <div className="space-y-6">
      {/* Video Player Simulado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <p className="text-xl font-semibold mb-2">Video Demo</p>
              <p className="text-sm opacity-80">Simulación de contenido de Hotmart</p>
              <Button className="mt-4 bg-white text-purple-600 hover:bg-gray-100">
                <Play className="h-4 w-4 mr-2" />
                Reproducir Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de verificación */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Estado Demo:</strong> Este es un simulador visual. 
          {isLoading ? ' Verificando acceso...' : 
           hasAccess ? ' ✅ Acceso confirmado' : ' ❌ Sin acceso'}
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderMockMode = () => (
    <div className="space-y-6">
      {/* Video Player con contenido real */}
      <Card>
        <CardHeader>
          <CardTitle>{mockVideoData.videos[0].title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {mockVideoData.videos[0].duration}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              1,245 estudiantes
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
              4.8
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <video 
            controls 
            className="w-full rounded-lg"
            poster="https://via.placeholder.com/800x450/4F46E5/FFFFFF?text=BSB+Capital+Academy"
          >
            <source src={mockVideoData.videos[0].stream_url} type="video/mp4" />
            Tu navegador no soporta video HTML5.
          </video>
        </CardContent>
      </Card>

      {/* Lista de videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="h-5 w-5 mr-2" />
            Contenido del Módulo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockVideoData.videos.map((video, index) => (
            <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.duration}</p>
                </div>
              </div>
              <Badge variant={index === 0 ? 'default' : 'outline'}>
                {index === 0 ? 'Reproduciendo' : 'Pendiente'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recursos adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Recursos Descargables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockVideoData.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Descargar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderRealMode = () => (
    <div className="space-y-6">
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Modo API Real:</strong> Conectando con Hotmart usando tus credenciales...
        </AlertDescription>
      </Alert>

      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Verificando acceso con Hotmart...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error de API:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {hotmartData && (
        <Card>
          <CardHeader>
            <CardTitle>Respuesta de Hotmart</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(hotmartData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {!hasAccess && !isLoading && (
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin Acceso</h3>
            <p className="text-gray-600 mb-4">
              No se encontró una suscripción activa para este contenido
            </p>
            <Button onClick={() => window.location.href = '/membresias'}>
              Ver Planes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Prueba de Integración Hotmart</h1>
        <p className="text-gray-600">
          Prueba diferentes modos para ver cómo funciona la integración con contenido de Hotmart.
        </p>
      </div>

      {renderTestControls()}

      {testMode === 'demo' && renderDemoMode()}
      {testMode === 'mock' && renderMockMode()}
      {testMode === 'real' && renderRealMode()}

      {/* Información de debug */}
      <Card className="mt-6 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <p><strong>Content ID:</strong> {contentId}</p>
          <p><strong>Has Access:</strong> {hasAccess ? '✅' : '❌'}</p>
          <p><strong>Loading:</strong> {isLoading ? '⏳' : '✅'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Client ID:</strong> {import.meta.env.VITE_HOTMART_CLIENT_ID ? '✅ Configurado' : '❌ Falta'}</p>
          <p><strong>Product ID:</strong> {import.meta.env.VITE_HOTMART_PRODUCT_ID || 'No configurado'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotmartTestPlayer;