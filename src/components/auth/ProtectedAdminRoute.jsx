import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Shield, AlertCircle } from 'lucide-react';

const ProtectedAdminRoute = ({ children, requiredPermission = null }) => {
  const { isAdmin, loading, hasPermission } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Acceso Denegado
              </h3>
              <AlertDescription className="text-red-700">
                No tienes permisos de administrador para acceder a esta página.
                Contacta con el administrador del sistema si crees que esto es un error.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <Shield className="h-4 w-4 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Permisos Insuficientes
              </h3>
              <AlertDescription className="text-orange-700">
                No tienes el permiso "{requiredPermission}" necesario para acceder a esta funcionalidad.
              </AlertDescription>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;