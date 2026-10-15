import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Play, BookOpen, Settings, BarChart3, Crown } from 'lucide-react';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAdmin } from '@/hooks/useAdmin';

const AcademyNavigation = () => {
  const navigate = useNavigate();
  const { hasAccess, userSubscription } = useUserAccess();
  const { isAdmin } = useAdmin();

  const academyRoutes = [
    {
      title: 'Catálogo de Cursos',
      description: 'Explora todos los cursos disponibles',
      path: '/academia/catalogo',
      icon: BookOpen,
      color: 'bg-blue-500',
      premium: false,
    },
    {
      title: 'Mi Contenido',
      description: 'Accede a tus cursos activos',
      path: '/academia/catalogo',
      icon: Play,
      color: 'bg-green-500',
      premium: true,
    },
    {
      title: 'Panel de Admin',
      description: 'Gestión de contenido (Admin)',
      path: '/academia/admin',
      icon: Settings,
      color: 'bg-purple-500',
      premium: true,
      adminOnly: true,
    },
  ];

  const quickActions = [
    {
      title: 'Ver Membresías',
      description: 'Gestiona tu suscripción',
      action: () => navigate('/membresias'),
      icon: Crown,
      color: 'bg-yellow-500',
    },
    {
      title: 'Panel Cliente',
      description: 'Dashboard principal',
      action: () => navigate('/client-dashboard'),
      icon: BarChart3,
      color: 'bg-indigo-500',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderRouteCard = (route) => {
    const isAccessible = !route.premium || hasAccess || isAdmin;
    const isAdminRoute = route.adminOnly;

    return (
      <Card
        key={`${route.title}-${route.path}`}
        className={`cursor-pointer transition-all hover:shadow-md ${!isAccessible ? 'opacity-60' : ''}`}
        onClick={() => isAccessible && handleNavigation(route.path)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${route.color} text-white`}>
              <route.icon className="h-5 w-5" />
            </div>
            <div className="flex gap-1">
              {route.premium && (
                <Badge variant={isAccessible ? 'default' : 'secondary'}>Premium</Badge>
              )}
              {isAdminRoute && <Badge variant="destructive">Admin</Badge>}
            </div>
          </div>
          <CardTitle className="text-lg">{route.title}</CardTitle>
          <CardDescription>{route.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button
            className="w-full"
            variant={isAccessible ? 'default' : 'outline'}
            disabled={!isAccessible}
          >
            {!isAccessible ? '🔒 Requiere Premium' : 'Acceder'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academia BSB Capital</h1>
        <p className="text-gray-600">Cursos y acceso de la cuenta</p>
      </div>

      {/* Estado del Usuario */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Estado del Usuario</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant={hasAccess ? 'default' : 'secondary'}>
            {hasAccess ? '✅ Acceso Activo' : '❌ Sin Acceso'}
          </Badge>
          {userSubscription && (
            <Badge variant="outline">Plan: {userSubscription.subscription_type || 'N/A'}</Badge>
          )}
        </div>
      </div>

      {/* Rutas de la Academia */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Academia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academyRoutes.map(renderRouteCard)}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={action.action}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full">Ir</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyNavigation;
