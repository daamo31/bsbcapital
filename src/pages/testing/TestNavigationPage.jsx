import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import UserStatusChecker from '@/components/common/UserStatusChecker';
import { 
  Play, 
  Video, 
  TestTube,
  ExternalLink,
  CheckCircle,
  Settings,
  BookOpen,
  Zap
} from 'lucide-react';

const TestNavigationPage = () => {
  const tests = [
    {
      title: 'Hotmart Test Player',
      description: 'Prueba completa con 3 modos: Demo Visual, Mock Content y API Real',
      path: '/hotmart-test',
      icon: <TestTube className="h-6 w-6 text-blue-500" />,
      status: 'ready',
      features: ['Demo visual', 'Videos mock', 'API real de Hotmart', 'Debug info']
    },
    {
      title: 'Demo de Integración',
      description: 'Documentación visual de cómo funciona la integración',
      path: '/hotmart-demo',
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      status: 'ready',
      features: ['Explicación técnica', 'Flujo completo', 'Configuración']
    },
    {
      title: '🎓 Academia Real (Testing)',
      description: 'NUEVO: Experiencia exacta del usuario que compra - Con contenido real',
      path: '/test/academia-real',
      icon: <Play className="h-6 w-6 text-green-600" />,
      status: 'ready',
      features: ['Contenido BSB Capital real', 'Sin restricciones de acceso', 'iframe embebido', 'Experiencia completa']
    },
    {
      title: '🆕 Integración Profesional Hotmart',
      description: 'NUEVO: Demo completo con iframe embebido y ID real (6308462)',
      path: '/content/hotmart-professional-integration',
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      status: 'ready',
      features: ['iframe embebido', 'ID real: 6308462', 'Sin redirecciones', 'Experiencia profesional']
    },
    {
      title: '🆕 Ejemplo de Uso Completo',
      description: 'NUEVO: Guía práctica con código y configuración',
      path: '/examples/ejemplo-uso-hotmart',
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      status: 'ready',
      features: ['Código de ejemplo', 'Configuración paso a paso', 'Diferentes casos de uso', 'Documentación']
    },
    {
      title: 'Academia con Hotmart',
      description: 'Vista de academia usando componentes de Hotmart',
      path: '/hotmart-academy',
      icon: <Video className="h-6 w-6 text-purple-500" />,
      status: 'ready',
      features: ['Cards interactivos', 'Verificación de acceso', 'UI completa']
    },
    {
      title: 'Módulo Individual',
      description: 'Página de módulo con reproductor integrado',
      path: '/academia/modulo/1',
      icon: <Play className="h-6 w-6 text-orange-500" />,
      status: 'ready',
      features: ['Reproductor real', 'Lista de lecciones', 'Recursos']
    },
    {
      title: 'Dashboard Academia',
      description: 'Dashboard principal con módulos y control de acceso',
      path: '/academia/dashboard',
      icon: <Settings className="h-6 w-6 text-indigo-500" />,
      status: 'protected',
      features: ['Módulos con acceso', 'Progreso', 'Suscripciones']
    },
    {
      title: 'Sistema de Membresías',
      description: 'Gestión completa de planes y suscripciones',
      path: '/membresias',
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      status: 'ready',
      features: ['3 planes', 'Integración Stripe', 'Base de datos']
    }
  ];

  const credentials = {
    clientId: import.meta.env.VITE_HOTMART_CLIENT_ID,
    productId: import.meta.env.VITE_HOTMART_PRODUCT_ID,
    hasCredentials: !!(import.meta.env.VITE_HOTMART_CLIENT_ID && import.meta.env.VITE_HOTMART_CLIENT_SECRET)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Centro de Pruebas - Integración Hotmart
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todas las páginas y componentes para probar la integración con Hotmart.
            Desde demos visuales hasta conexiones reales con la API.
          </p>
        </div>

        {/* Estado de credenciales */}
        <Card className={`mb-8 ${credentials.hasCredentials ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${credentials.hasCredentials ? 'text-green-800' : 'text-yellow-800'}`}>
              <CheckCircle className={`h-5 w-5 mr-2 ${credentials.hasCredentials ? 'text-green-600' : 'text-yellow-600'}`} />
              Estado de Credenciales Hotmart
            </CardTitle>
          </CardHeader>
          <CardContent className={credentials.hasCredentials ? 'text-green-700' : 'text-yellow-700'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Client ID:</strong> {credentials.clientId ? `${credentials.clientId.slice(0, 8)}...` : '❌ No configurado'}
              </div>
              <div>
                <strong>Product ID:</strong> {credentials.productId || '❌ No configurado'}
              </div>
              <div>
                <strong>Estado:</strong> {credentials.hasCredentials ? '✅ Configurado' : '⚠️ Incompleto'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Usuario y Credenciales */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Usuario de Prueba</h2>
          <UserStatusChecker />
        </div>

        {/* Grid de tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {test.icon}
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                  </div>
                  <Badge variant={
                    test.status === 'ready' ? 'default' : 
                    test.status === 'protected' ? 'secondary' : 'outline'
                  }>
                    {test.status === 'ready' ? 'Listo' : 
                     test.status === 'protected' ? 'Login requerido' : 'Demo'}
                  </Badge>
                </div>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Características */}
                <div className="space-y-2 mb-4">
                  {test.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Botón de acción */}
                <Link to={test.path}>
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Probar Ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guía de uso */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🚀 Cómo Probar Todo</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Para testing sin contenido real:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. <strong>Hotmart Test Player</strong> - Usa modo "Demo Visual" o "Mock Content"</li>
                  <li>2. <strong>Demo de Integración</strong> - Ve la documentación visual</li>
                  <li>3. <strong>Academia Hotmart</strong> - Navega la interfaz completa</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Para testing con API real:</h4>
                <ol className="space-y-2 text-sm">
                  <li>1. Verifica que tienes credenciales configuradas ✅</li>
                  <li>2. Usa <strong>Hotmart Test Player</strong> en modo "API Real"</li>
                  <li>3. Chequea el debug info para ver respuestas</li>
                  <li>4. Prueba el <strong>Módulo Individual</strong> para contenido real</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información técnica */}
        <Card className="mt-6 bg-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">⚙️ Información Técnica</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-white">Componentes Principales:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• HotmartVideoPlayer</li>
                  <li>• HotmartTestPlayer</li>
                  <li>• ModuleCard (con acceso)</li>
                  <li>• useUserAccess hook</li>
                </ul>
              </div>
              
              <div>
                <strong className="text-white">APIs Integradas:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Hotmart OAuth2</li>
                  <li>• Hotmart Products API</li>
                  <li>• Supabase (membresías)</li>
                  <li>• Stripe (pagos)</li>
                </ul>
              </div>
              
              <div>
                <strong className="text-white">Estados de Prueba:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• ✅ Demo visual funcional</li>
                  <li>• ✅ Mock content listo</li>
                  <li>• ⚙️ API real disponible</li>
                  <li>• 🔐 Control de acceso activo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestNavigationPage;