import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import HotmartVideoPlayer from '@/components/hotmart/HotmartVideoPlayer';
import { 
  Zap, 
  Shield, 
  Video, 
  Download,
  CheckCircle
} from 'lucide-react';

const HotmartIntegrationDemo = () => {
  const features = [
    {
      icon: <Video className="h-6 w-6 text-blue-500" />,
      title: 'Streaming Directo',
      description: 'Videos se reproducen directamente en tu página desde Hotmart'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: 'Verificación Automática',
      description: 'Sistema verifica acceso en tiempo real con API de Hotmart'
    },
    {
      icon: <Download className="h-6 w-6 text-purple-500" />,
      title: 'Recursos Integrados',
      description: 'PDFs y materiales descargables directamente disponibles'
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: 'Sin Redirecciones',
      description: 'Usuario nunca sale de tu página - experiencia fluida'
    }
  ];

  const mockModules = [
    {
      id: 'module_1',
      title: 'Fundamentos de Gestión del Riesgo',
      description: 'Aprende las bases para proteger tu capital',
      level: 'Básico'
    },
    {
      id: 'module_2', 
      title: 'Fiscalidad y Cumplimiento Crypto',
      description: 'Domina las obligaciones fiscales en crypto',
      level: 'Intermedio'
    },
    {
      id: 'module_3',
      title: 'Operativa con Derivados',
      description: 'Visión institucional de futuros y opciones',
      level: 'Avanzado'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            Demo Integración Hotmart
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contenido de Hotmart en tu Página
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Muestra videos y contenido de Hotmart directamente en tu plataforma 
            sin redirecciones. Los usuarios nunca salen de tu sitio.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo de Reproductor */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Ejemplo de Reproductor Integrado
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <HotmartVideoPlayer
              contentId="module_1"
              title="Fundamentos de Gestión del Riesgo"
              description="Video de demostración mostrando contenido de Hotmart integrado directamente en tu página"
            />
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Módulos Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <Badge variant="outline">{module.level}</Badge>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Video className="h-4 w-4" />
                      <span>Videos en streaming directo</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Download className="h-4 w-4" />
                      <span>Materiales descargables</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Seguimiento de progreso</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Información Técnica */}
        <Card className="bg-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">
              Cómo Funciona la Integración
            </CardTitle>
            <CardDescription className="text-gray-300">
              Detalles técnicos del flujo de integración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-blue-400">1. Verificación de Acceso</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Sistema verifica suscripción en Supabase</li>
                  <li>• Consulta API de Hotmart para validar acceso</li>
                  <li>• Fallback a verificación local si Hotmart falla</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-400">2. Obtención de Contenido</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• API de Hotmart retorna URLs de streaming</li>
                  <li>• Metadatos del curso (duración, título, etc.)</li>
                  <li>• Links de descarga para recursos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-purple-400">3. Reproducción Integrada</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Video HTML5 con URL directa de Hotmart</li>
                  <li>• Controles personalizados de tu marca</li>
                  <li>• Progreso sincronizado en ambas plataformas</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-yellow-400">4. Experiencia de Usuario</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Usuario nunca sale de tu página</li>
                  <li>• Navegación fluida entre módulos</li>
                  <li>• Marca y diseño 100% personalizados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">
              Configuración Requerida
            </CardTitle>
            <CardDescription className="text-orange-700">
              Variables de entorno necesarias para la integración
            </CardDescription>
          </CardHeader>
          <CardContent className="text-orange-800">
            <div className="bg-orange-100 p-4 rounded-lg font-mono text-sm">
              <p className="mb-2">// .env.local</p>
              <p>REACT_APP_HOTMART_CLIENT_ID=tu_client_id</p>
              <p>REACT_APP_HOTMART_CLIENT_SECRET=tu_client_secret</p>
              <p>REACT_APP_HOTMART_BASIC_PRODUCT_ID=12345</p>
              <p>REACT_APP_HOTMART_PREMIUM_PRODUCT_ID=12346</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotmartIntegrationDemo;