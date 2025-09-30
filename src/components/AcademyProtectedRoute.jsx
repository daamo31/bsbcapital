import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AcademyProtectedRoute = ({ children, productId = '6308462' }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isLoading: accessLoading, error, refreshAccess } = useUserAccess(productId);
  const location = useLocation();

  // Mostrar loader mientras carga la autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mostrar loader mientras verifica el acceso
  if (accessLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay problemas con la verificación
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error de verificación</h2>
          <p className="text-muted-foreground mb-4">
            No se pudo verificar tu acceso. Por favor, inténtalo de nuevo.
          </p>
          <Button onClick={refreshAccess} variant="outline">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar página de acceso denegado si no tiene acceso
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
          <p className="text-muted-foreground mb-4">
            No tienes acceso a este contenido. Para acceder a la Academia BSB Capital, 
            necesitas una membresía activa.
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.href = '/formacion'} className="w-full">
              Ver planes disponibles
            </Button>
            <Button onClick={refreshAccess} variant="outline" className="w-full">
              Verificar acceso nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, mostrar el contenido
  return children;
};

export default AcademyProtectedRoute;