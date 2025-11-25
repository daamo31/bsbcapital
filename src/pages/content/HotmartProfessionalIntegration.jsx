import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import HotmartIframePlayer from '@/components/hotmart/HotmartIframePlayer';
import { 
  Play, 
  CheckCircle, 
  Zap, 
  Shield, 
  Eye,
  Monitor,
  Smartphone,
  Code,
  ExternalLink,
  Star,
  Users,
  Clock
} from 'lucide-react';

/**
 * Página de demostración de la integración profesional con Hotmart
 * Muestra cómo el contenido se integra perfectamente en tu diseño
 */
const HotmartProfessionalIntegration = () => {
  const [activeDemo, setActiveDemo] = useState('main');

  // Configuraciones de demostración
  const demoConfigs = [
    {
      id: 'main',
      title: 'Academia Principal',
      description: 'Reproductor principal para contenido de academia',
      contentId: 'modulo_0_bienvenida',
      hotmartVideoId: 'bienvenida-mentalidad-inversora',
      customHeight: '500px'
    },
    {
      id: 'module',
      title: 'Módulo Específico',
      description: 'Reproductor para módulos individuales',
      contentId: 'modulo_1_riesgo',
      hotmartVideoId: 'gestion-riesgo-fundamentos',
      customHeight: '450px'
    },
    {
      id: 'preview',
      title: 'Vista Previa',
      description: 'Modo preview para mostrar contenido sin acceso completo',
      contentId: 'video_introduccion',
      hotmartVideoId: 'intro-risk-management',
      customHeight: '300px'
    }
  ];

  const features = [
    {
      icon: <Monitor className="h-6 w-6 text-blue-500" />,
      title: 'Integración Perfecta',
      description: 'El contenido de Hotmart se muestra dentro de tu diseño sin redirecciones'
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      title: 'Verificación Automática',
      description: 'Sistema verifica acceso con Supabase y API de Hotmart en tiempo real'
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: 'Carga Rápida',
      description: 'Optimizado para carga rápida y experiencia fluida'
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      title: 'Control Total',
      description: 'Controlas completamente la experiencia del usuario'
    }
  ];

  const benefits = [
    {
      title: 'Para ti (el creador)',
      items: [
        'Solo usas Hotmart - no programas nada',
        'Subes tu contenido una vez en Hotmart',
        'Se integra automáticamente en tu web',
        'Mantienes tu marca y diseño',
        'Control total de accesos'
      ]
    },
    {
      title: 'Para tus alumnos',
      items: [
        'Nunca salen de tu plataforma',
        'Experiencia consistente',
        'Acceso directo al contenido',
        'Interfaz familiar y profesional',
        'Carga rápida y confiable'
      ]
    }
  ];

  const comparisonData = [
    {
      aspect: 'Experiencia del usuario',
      redirection: 'Usuario sale de tu web → Hotmart → regresa',
      embedded: 'Usuario permanece en tu web siempre'
    },
    {
      aspect: 'Branding',
      redirection: 'Se ve branding de Hotmart',
      embedded: 'Solo tu marca y diseño'
    },
    {
      aspect: 'Configuración',
      redirection: 'Solo enlaces directos',
      embedded: 'Configuración una vez, funciona siempre'
    },
    {
      aspect: 'Control',
      redirection: 'Limitado',
      embedded: 'Control total de la experiencia'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 text-sm px-3 py-1">
            ✨ Integración Profesional Hotmart
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tu Academia Dentro de Tu Web
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <strong>La mejor opción:</strong> Tu contenido de Hotmart se muestra perfectamente 
            integrado en tu diseño. Los usuarios nunca salen de tu plataforma.
          </p>
        </div>

        {/* Features principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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

        {/* Demo del reproductor */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">
                Demostración en Vivo
              </CardTitle>
              <CardDescription className="text-blue-700">
                Así es como se ve tu contenido de Hotmart integrado en tu web
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Tabs para diferentes demos */}
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              {demoConfigs.map((config) => (
                <TabsTrigger key={config.id} value={config.id}>
                  {config.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {demoConfigs.map((config) => (
              <TabsContent key={config.id} value={config.id} className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{config.title}</h3>
                  <p className="text-gray-600">{config.description}</p>
                </div>
                
                <HotmartIframePlayer
                  contentId={config.contentId}
                  title={`Demo: ${config.title}`}
                  description={config.description}
                  hotmartVideoId={config.hotmartVideoId}
                  customHeight={config.customHeight}
                  allowFullscreen={true}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Comparación: Redirección vs Embebido */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            ¿Por qué Integración Embebida es Mejor?
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  ❌ Redirección (método básico)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>• Usuario sale de tu web</li>
                  <li>• Ve branding de Hotmart</li>
                  <li>• Experiencia desconectada</li>
                  <li>• Puede perderse o no regresar</li>
                  <li>• No parece profesional</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  ✅ Embebido (recomendado)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Usuario nunca sale de tu web</li>
                  <li>• Solo ve tu marca</li>
                  <li>• Experiencia fluida y profesional</li>
                  <li>• Control total del diseño</li>
                  <li>• Parece que todo es tuyo</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Comparación Detallada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Aspecto</th>
                        <th className="text-left py-2 text-red-700">❌ Redirección</th>
                        <th className="text-left py-2 text-green-700">✅ Embebido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{row.aspect}</td>
                          <td className="py-2 text-red-700">{row.redirection}</td>
                          <td className="py-2 text-green-700">{row.embedded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Beneficios para cada rol */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Beneficios para Todos
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {index === 0 ? <Code className="h-5 w-5 mr-2 text-blue-500" /> : <Users className="h-5 w-5 mr-2 text-green-500" />}
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Proceso técnico */}
        <div className="mb-12">
          <Card className="bg-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">
                ¿Cómo Funciona Técnicamente?
              </CardTitle>
              <CardDescription className="text-gray-300">
                El proceso detrás de la integración embebida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-blue-400">Verificación de Acceso</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Sistema verifica suscripción en Supabase</li>
                    <li>• Consulta API de Hotmart si es necesario</li>
                    <li>• Fallback a verificación local</li>
                  </ul>
                </div>
                
                <div>
                  <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-green-400">Construcción de iframe</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Se construye URL de embed de Hotmart</li>
                    <li>• Se aplican configuraciones de marca</li>
                    <li>• Se configuran parámetros de seguridad</li>
                  </ul>
                </div>
                
                <div>
                  <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-purple-400">Reproducción Integrada</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Iframe se carga dentro de tu diseño</li>
                    <li>• Controles personalizados superpuestos</li>
                    <li>• Comunicación bidireccional con Hotmart</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                🎯 Implementación Lista para Usar
              </h2>
              <p className="text-blue-100 mb-6">
                Esta integración ya está configurada en tu plataforma. 
                Solo necesitas subir tu contenido a Hotmart y se mostrará automáticamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => window.location.href = '/academia'}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Ver Academia en Vivo
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-blue-700"
                  onClick={() => window.open('https://developers.hotmart.com/', '_blank')}
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Documentación Hotmart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotmartProfessionalIntegration;