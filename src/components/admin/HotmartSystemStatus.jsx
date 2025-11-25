import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useUserAccess } from '../../hooks/useUserAccess';

const HotmartSystemStatus = () => {
  const { isAdmin, checkingAdmin } = useAdmin();
  const { hasActiveSubscription } = useUserAccess();
  const [systemStatus, setSystemStatus] = useState({});

  useEffect(() => {
    // Verificar configuración del sistema
    const checkSystemStatus = () => {
      const status = {
        hotmartConfigured: !!import.meta.env.VITE_HOTMART_PRODUCT_ID,
        productId: import.meta.env.VITE_HOTMART_PRODUCT_ID,
        clientIdConfigured: !!import.meta.env.VITE_HOTMART_CLIENT_ID,
        clientSecretConfigured: !!import.meta.env.VITE_HOTMART_CLIENT_SECRET,
        embedModeEnabled: import.meta.env.VITE_HOTMART_EMBED_MODE === 'true',
        supabaseConfigured: !!import.meta.env.VITE_SUPABASE_URL,
        stripeConfigured: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        siteUrl: import.meta.env.VITE_SITE_URL
      };
      setSystemStatus(status);
    };

    checkSystemStatus();
  }, []);

  const StatusIndicator = ({ status, label }) => (
    <div className="flex items-center space-x-2 p-2 rounded">
      <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={status ? 'text-green-700' : 'text-red-700'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🎯 BSB Capital - Sistema Hotmart
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Estado del Sistema */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Estado del Sistema</h2>
              <div className="space-y-2">
                <StatusIndicator 
                  status={systemStatus.hotmartConfigured} 
                  label="Hotmart Product ID Configurado" 
                />
                <StatusIndicator 
                  status={systemStatus.clientIdConfigured} 
                  label="Client ID Configurado" 
                />
                <StatusIndicator 
                  status={systemStatus.clientSecretConfigured} 
                  label="Client Secret Configurado" 
                />
                <StatusIndicator 
                  status={systemStatus.embedModeEnabled} 
                  label="Modo Embed Activado" 
                />
                <StatusIndicator 
                  status={systemStatus.supabaseConfigured} 
                  label="Supabase Configurado" 
                />
                <StatusIndicator 
                  status={systemStatus.stripeConfigured} 
                  label="Stripe Configurado" 
                />
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">👤 Estado del Usuario</h2>
              <div className="space-y-2">
                <StatusIndicator 
                  status={!checkingAdmin && isAdmin} 
                  label="Acceso de Administrador" 
                />
                <StatusIndicator 
                  status={hasActiveSubscription} 
                  label="Suscripción Activa" 
                />
              </div>
              
              {checkingAdmin && (
                <div className="mt-4 text-blue-600">
                  🔍 Verificando permisos de administrador...
                </div>
              )}
            </div>

            {/* Configuración Detallada */}
            <div className="md:col-span-2 bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">⚙️ Configuración Actual</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Product ID:</strong> {systemStatus.productId || 'No configurado'}
                </div>
                <div>
                  <strong>Site URL:</strong> {systemStatus.siteUrl || 'No configurado'}
                </div>
                <div>
                  <strong>Embed Mode:</strong> {systemStatus.embedModeEnabled ? 'Activado' : 'Desactivado'}
                </div>
                <div>
                  <strong>Client ID:</strong> {systemStatus.clientIdConfigured ? 'Configurado ✓' : 'No configurado ✗'}
                </div>
              </div>
            </div>

            {/* Enlaces de Prueba */}
            <div className="md:col-span-2 bg-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🔗 Enlaces de Prueba</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href="/academia" 
                  className="block bg-purple-600 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🎓 Academia Principal
                </a>
                <a 
                  href="/test/academia-real" 
                  className="block bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🧪 Test Academia Real
                </a>
                <a 
                  href="/content/hotmart-professional-integration" 
                  className="block bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  💼 Demo Profesional
                </a>
                <a 
                  href="/examples/ejemplo-uso-hotmart" 
                  className="block bg-orange-600 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  📖 Ejemplo de Uso
                </a>
              </div>
            </div>
          </div>

          {/* Resumen Final */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🚀 Sistema Listo</h3>
            <p className="mb-4">
              Tu integración con Hotmart está configurada y lista para usar. 
              Los usuarios pueden acceder a los cursos directamente desde tu plataforma 
              sin ser redirigidos a Hotmart.
            </p>
            <div className="text-sm opacity-90">
              <strong>Product ID BSB Capital:</strong> {systemStatus.productId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotmartSystemStatus;