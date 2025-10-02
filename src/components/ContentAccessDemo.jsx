import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Crown, Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContentAccessDemo = () => {
  const navigate = useNavigate();
  
  // Ejemplos de diferentes tipos de contenido
  const contents = [
    {
      id: 'module_1',
      title: 'Fundamentos de gestión del riesgo',
      type: 'Módulo',
      description: 'Domina las bases para proteger tu capital',
      duration: '2h 30min'
    },
    {
      id: 'module_2', 
      title: 'Fiscalidad y cumplimiento (crypto)',
      type: 'Módulo',
      description: 'Entiende tus obligaciones fiscales con criptoactivos',
      duration: '1h 45min'
    },
    {
      id: 'module_3',
      title: 'Operativa con derivados',
      type: 'Módulo', 
      description: 'Visión institucional de futuros y opciones',
      duration: '3h 15min'
    },
    {
      id: 'video_1',
      title: 'Introducción al Risk Management',
      type: 'Video',
      description: 'Video introductorio sobre gestión de riesgo',
      duration: '25min'
    },
    {
      id: 'academia',
      title: 'Academia BSB Capital Completa',
      type: 'Curso',
      description: 'Acceso completo a todos los cursos y materiales',
      duration: '20+ horas'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo: Control de Acceso por Membresía</h1>
        <p className="text-gray-600">
          Este demo muestra cómo funciona el control de acceso basado en las membresías del usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Cómo funciona el sistema</CardTitle>
            <CardDescription>
              Control granular de acceso basado en suscripciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Plan Básico</p>
                  <p className="text-sm text-gray-600">Acceso a módulos fundamentales</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Plan Estándar</p>
                  <p className="text-sm text-gray-600">Incluye contenido intermedio y algunos videos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Plan Premium</p>
                  <p className="text-sm text-gray-600">Acceso completo a todo el contenido</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ContentCard = ({ content }) => {
  const { hasAccess, isLoading, userSubscription } = useUserAccess(content.id);
  const navigate = useNavigate();

  const handleAction = () => {
    if (hasAccess) {
      // Simular navegación al contenido
      console.log(`Navegando a: ${content.id}`);
      // navigate(`/content/${content.id}`);
    } else {
      navigate('/membresias');
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      hasAccess 
        ? 'hover:shadow-lg hover:border-blue-300 cursor-pointer' 
        : 'bg-gray-50'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{content.title}</CardTitle>
          {isLoading ? (
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
          ) : hasAccess ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {content.type}
          </span>
          <span className="text-xs text-gray-500">{content.duration}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className={`text-sm mb-4 ${hasAccess ? 'text-gray-600' : 'text-gray-400'}`}>
          {content.description}
        </p>

        {!hasAccess && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Contenido Premium
                </p>
                <p className="text-xs text-yellow-700">
                  {userSubscription 
                    ? `Tu plan "${userSubscription.subscription_plans.name}" no incluye este contenido`
                    : 'Requiere suscripción activa'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleAction}
          className="w-full"
          variant={hasAccess ? "default" : "outline"}
          disabled={isLoading}
        >
          {isLoading ? (
            'Verificando...'
          ) : hasAccess ? (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Acceder
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Suscribirse
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContentAccessDemo;