import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/data-display/card';
import { Badge } from '../components/ui/data-display/badge';
import { 
  TestTube, 
  Play, 
  Crown, 
  Database, 
  Video, 
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useUserAccess } from '../hooks/useUserAccess';
import { useAuth } from '../contexts/SupabaseAuthContext';
import UserStatusChecker from '../components/common/UserStatusChecker';

const TestSystemPage = () => {
  const { user } = useAuth();
  const { hasAccess, isLoading, userSubscription, hotmartData } = useUserAccess();
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const isPremiumMockMode = hotmartData?.mockMode || userSubscription?.id === 'mock-premium-sub';

  const systemTests = [
    {
      id: 'auth',
      name: 'Autenticación',
      description: 'Verificar usuario autenticado',
      icon: CheckCircle,
      test: () => !!user,
      status: user ? 'success' : 'error',
      message: user ? `Usuario: ${user.email}` : 'Usuario no autenticado'
    },
    {
      id: 'access',
      name: 'Control de Acceso',
      description: 'Verificar acceso a contenido premium',
      icon: Crown,
      test: () => hasAccess || isPremiumMockMode,
      status: (hasAccess || isPremiumMockMode) ? 'success' : 'warning',
      message: isPremiumMockMode ? 'Acceso premium simulado activo' : hasAccess ? 'Acceso premium verificado' : 'Sin acceso premium'
    },
    {
      id: 'subscription',
      name: 'Suscripción',
      description: 'Estado de la suscripción del usuario',
      icon: Database,
      test: () => !!userSubscription,
      status: userSubscription ? 'success' : 'warning',
      message: userSubscription ? `Tipo: ${userSubscription.subscription_type || 'Mock'}` : 'Sin suscripción activa'
    },
    {
      id: 'hotmart',
      name: 'Integración Hotmart',
      description: 'Servicio de contenido Hotmart',
      icon: Video,
      test: () => !!hotmartData,
      status: hotmartData ? 'success' : 'warning',
      message: hotmartData ? 'Datos de Hotmart disponibles' : 'Sin datos de Hotmart'
    }
  ];

  const navigationTests = [
    {
      name: 'Academia Principal',
      path: '/academia',
      description: 'Dashboard principal de la academia'
    },
    {
      name: 'Catálogo de Cursos',
      path: '/academia/catalogo',
      description: 'Lista pública de cursos'
    },
    {
      name: 'Mi Contenido',
      path: '/academia/contenido',
      description: 'Contenido premium (requiere acceso)',
      requiresAccess: true
    },
    {
      name: 'Panel Admin',
      path: '/academia/admin',
      description: 'Administración (requiere admin)',
      requiresAdmin: true
    },
    {
      name: 'Test Hotmart',
      path: '/test/hotmart',
      description: 'Player de prueba con contenido Hotmart'
    },
    {
      name: 'Dashboard Cliente',
      path: '/client-dashboard',
      description: 'Dashboard del cliente'
    }
  ];

  const runSystemCheck = async () => {
    setIsRunningTests(true);
    const results = {};
    
    for (const test of systemTests) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      results[test.id] = {
        passed: test.test(),
        status: test.status,
        message: test.message
      };
    }
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return TestTube;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Testing Completo</h1>
        <p className="text-gray-600">Verifica el estado completo del sistema de membresías y contenido</p>
      </div>

      {/* Estado Premium */}
      {isPremiumMockMode && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-purple-800 font-bold text-lg">¡Modo Premium Simulado Activo!</h3>
              <p className="text-purple-600">Todas las funciones premium están habilitadas para testing</p>
            </div>
          </div>
        </div>
      )}

      {/* Test de Estado del Usuario */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserStatusChecker />
          </CardContent>
        </Card>
      </div>

      {/* Test del Sistema */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runSystemCheck} 
                disabled={isRunningTests}
                className="w-full"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ejecutando Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar Test Completo
                  </>
                )}
              </Button>

              {Object.keys(testResults).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {systemTests.map((test) => {
                    const result = testResults[test.id];
                    const StatusIcon = getStatusIcon(test.status);
                    
                    return (
                      <div key={test.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${getStatusColor(test.status)} text-white`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{test.name}</h4>
                            <p className="text-sm text-gray-600">{test.description}</p>
                          </div>
                        </div>
                        <p className="text-sm">{result?.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegación de Test */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Test de Navegación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {navigationTests.map((navTest, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{navTest.name}</h4>
                    <div className="flex gap-1">
                      {navTest.requiresAccess && (
                        <Badge variant={hasAccess || isPremiumMockMode ? "default" : "secondary"}>
                          Premium
                        </Badge>
                      )}
                      {navTest.requiresAdmin && (
                        <Badge variant="destructive">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{navTest.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = navTest.path}
                    disabled={navTest.requiresAccess && !hasAccess && !isPremiumMockMode}
                  >
                    {navTest.requiresAccess && !hasAccess && !isPremiumMockMode ? '🔒 Sin Acceso' : 'Probar'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estado de Carga</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Verificando...</span>
              </div>
            ) : (
              <Badge variant="outline">✅ Cargado</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Acceso Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={hasAccess || isPremiumMockMode ? "default" : "secondary"}>
              {hasAccess || isPremiumMockMode ? '✅ Activo' : '❌ Inactivo'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Modo de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isPremiumMockMode ? "default" : "outline"}>
              {isPremiumMockMode ? '🧪 Simulado' : '📱 Real'}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestSystemPage;