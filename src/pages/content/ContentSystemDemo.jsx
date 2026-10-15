import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import ContentPlayer from '@/components/content/ContentPlayer';
import ModuleViewer from '@/components/content/ModuleViewer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Database, Shield, Video, CheckCircle, Users, BookOpen } from 'lucide-react';

const ContentSystemDemo = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Database className="h-6 w-6 text-blue-500" />,
      title: 'Supabase como Control',
      description: 'Permisos y autenticación gestionados completamente en Supabase',
    },
    {
      icon: <Video className="h-6 w-6 text-purple-500" />,
      title: 'Contenido desde Supabase',
      description: 'Vídeos y archivos servidos desde las URL configuradas en Supabase',
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: 'Control Total',
      description: 'Gestión completa de usuarios y accesos desde tu base de datos',
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-orange-500" />,
      title: 'Progreso Trackeable',
      description: 'Seguimiento detallado del progreso de cada usuario',
    },
  ];

  const sampleContent = [
    {
      contentId: 'free_intro',
      title: 'Contenido Gratuito',
      description: 'Este video es accesible para todos los usuarios',
      type: 'free',
    },
    {
      contentId: 'video_1_1',
      title: 'Contenido Básico',
      description: 'Requiere suscripción básica o superior',
      type: 'basic',
    },
    {
      contentId: 'video_2_1',
      title: 'Contenido Premium',
      description: 'Requiere suscripción premium o superior',
      type: 'premium',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">
            Sistema de Contenido con Supabase
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Permisos y contenidos con Supabase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Supabase controla los permisos, metadatos, progreso y URL de cada recurso.
          </p>
        </div>

        {/* Status del Usuario */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Estado del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usuario autenticado: {user.email}</p>
                  <p className="text-sm text-gray-600">Los permisos se verifican en tiempo real</p>
                </div>
                <Badge variant="success">Conectado</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">No autenticado</p>
                  <p className="text-sm text-gray-600">Solo verás contenido gratuito</p>
                </div>
                <Button onClick={() => (window.location.href = '/auth/login')}>
                  Iniciar Sesión
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center border-2 hover:border-green-200 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ejemplos de Contenido Individual */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ejemplos de Control de Acceso</h2>
          <p className="text-gray-600 mb-8">
            Cada elemento se verifica individualmente según la suscripción del usuario en Supabase.
          </p>

          <div className="space-y-8">
            {sampleContent.map((content) => (
              <div key={content.contentId}>
                <div className="mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{content.title}</h3>
                    <Badge
                      variant={
                        content.type === 'free'
                          ? 'success'
                          : content.type === 'basic'
                            ? 'default'
                            : 'destructive'
                      }
                    >
                      {content.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{content.description}</p>
                </div>

                <ContentPlayer
                  contentId={content.contentId}
                  className="border-l-4 border-l-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplo de Módulo Completo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ejemplo de Módulo Completo</h2>
          <p className="text-gray-600 mb-8">
            Vista completa de un módulo con múltiples elementos y diferentes niveles de acceso.
          </p>

          <ModuleViewer moduleId="module_1" />
        </div>

        {/* Cómo Funciona */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              ¿Cómo funciona el nuevo sistema?
            </CardTitle>
            <CardDescription className="text-blue-700">
              Flujo técnico del sistema de contenidos de Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Control de Permisos (Supabase)</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    • <strong>Autenticación:</strong> Usuarios gestionados en Supabase Auth
                  </li>
                  <li>
                    • <strong>Suscripciones:</strong> Verificación en tabla `user_subscriptions`
                  </li>
                  <li>
                    • <strong>Contenido:</strong> Metadatos en tabla `course_content`
                  </li>
                  <li>
                    • <strong>Progreso:</strong> Tracking en tabla `user_progress`
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ventajas del Sistema */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Ventajas del Sistema Híbrido</CardTitle>
            <CardDescription className="text-green-700">
              Beneficios del sistema de contenidos de Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="text-green-800">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Control Total</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ Gestión completa de usuarios</li>
                  <li>✅ Permisos personalizables</li>
                  <li>✅ Métricas y analytics propios</li>
                  <li>✅ Sin dependencias externas para auth</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">Eficiencia de Contenido</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ URLs directas de contenido gestionadas en Supabase</li>
                  <li>✅ Videos optimizados</li>
                  <li>✅ Sin costos de storage</li>
                  <li>✅ Escalabilidad automática</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentSystemDemo;
