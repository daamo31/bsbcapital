import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import WatermarkedVideo from '@/components/WatermarkedVideo';
import ContentProtection from '@/components/ContentProtection';

export default function TestPage() {
  const { user, signIn, signOut } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState({});

  const updateResult = (test, result) => {
    setTestResults(prev => ({ ...prev, [test]: result }));
  };

  const setLoadingState = (test, isLoading) => {
    setLoading(prev => ({ ...prev, [test]: isLoading }));
  };

  // Test 1: Login con usuario de prueba
  const testLogin = async () => {
    setLoadingState('login', true);
    try {
      const result = await signIn('test@bsbcapital.com', 'TestUser123!');
      if (result.error) {
        updateResult('login', { success: false, error: result.error.message });
      } else {
        updateResult('login', { success: true, message: 'Login exitoso' });
      }
    } catch (error) {
      updateResult('login', { success: false, error: error.message });
    } finally {
      setLoadingState('login', false);
    }
  };

  // Test 2: Crear checkout
  const testCheckout = async () => {
    if (!user) {
      updateResult('checkout', { success: false, error: 'Usuario no logueado' });
      return;
    }

    setLoadingState('checkout', true);
    try {
      const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/hotmart-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('checkout', { 
          success: true, 
          message: 'Checkout creado', 
          data: data.checkout_url 
        });
      } else {
        updateResult('checkout', { success: false, error: data.error });
      }
    } catch (error) {
      updateResult('checkout', { success: false, error: error.message });
    } finally {
      setLoadingState('checkout', false);
    }
  };

  // Test 3: Verificar acceso
  const testAccess = async () => {
    if (!user) {
      updateResult('access', { success: false, error: 'Usuario no logueado' });
      return;
    }

    setLoadingState('access', true);
    try {
      const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/verify-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          product_id: '6308462'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('access', { 
          success: true, 
          message: `Acceso: ${data.has_access ? 'PERMITIDO' : 'DENEGADO'}`,
          data: data 
        });
      } else {
        updateResult('access', { success: false, error: data.error });
      }
    } catch (error) {
      updateResult('access', { success: false, error: error.message });
    } finally {
      setLoadingState('access', false);
    }
  };

  // Test 4: Rate limiting
  const testRateLimit = async () => {
    setLoadingState('rateLimit', true);
    try {
      const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/rate-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test-action',
          ip: '127.0.0.1'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('rateLimit', { 
          success: true, 
          message: `Rate limit: ${data.allowed ? 'PERMITIDO' : 'BLOQUEADO'}`,
          data: data
        });
      } else {
        updateResult('rateLimit', { success: false, error: data.error });
      }
    } catch (error) {
      updateResult('rateLimit', { success: false, error: error.message });
    } finally {
      setLoadingState('rateLimit', false);
    }
  };

  const TestResult = ({ test, title }) => {
    const result = testResults[test];
    if (!result) return null;

    return (
      <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
        <AlertDescription>
          <strong>{title}:</strong> {result.message || result.error}
          {result.data && (
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        🧪 Página de Pruebas - Sistema Hotmart
      </h1>

      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Nombre:</strong> {user.user_metadata?.full_name || 'No definido'}</p>
              <Button onClick={signOut} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">No hay usuario logueado</p>
          )}
        </CardContent>
      </Card>

      {/* Credenciales de prueba */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Usuario de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p><strong>Email:</strong> test@bsbcapital.com</p>
            <p><strong>Password:</strong> TestUser123!</p>
            <p className="text-sm text-gray-600 mt-2">
              Este usuario ya tiene acceso al producto 6308462 configurado.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tests */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Test 1: Login */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Test 1: Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testLogin} 
              disabled={loading.login || user}
              className="w-full"
            >
              {loading.login ? 'Probando...' : 'Probar Login'}
            </Button>
            <TestResult test="login" title="Login" />
          </CardContent>
        </Card>

        {/* Test 2: Checkout */}
        <Card>
          <CardHeader>
            <CardTitle>🛒 Test 2: Crear Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testCheckout} 
              disabled={loading.checkout || !user}
              className="w-full"
            >
              {loading.checkout ? 'Creando...' : 'Crear Checkout'}
            </Button>
            <TestResult test="checkout" title="Checkout" />
          </CardContent>
        </Card>

        {/* Test 3: Verificar acceso */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Test 3: Verificar Acceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testAccess} 
              disabled={loading.access || !user}
              className="w-full"
            >
              {loading.access ? 'Verificando...' : 'Verificar Acceso'}
            </Button>
            <TestResult test="access" title="Verificación de Acceso" />
          </CardContent>
        </Card>

        {/* Test 4: Rate limiting */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Test 4: Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testRateLimit} 
              disabled={loading.rateLimit}
              className="w-full"
            >
              {loading.rateLimit ? 'Probando...' : 'Probar Rate Limit'}
            </Button>
            <TestResult test="rateLimit" title="Rate Limiting" />
          </CardContent>
        </Card>
      </div>

      {/* Demo de características de seguridad */}
      {user && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🎥 Demo: Video con Watermark</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentProtection>
                <WatermarkedVideo
                  src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
                  userEmail={user.email}
                  className="w-full max-w-md mx-auto"
                />
              </ContentProtection>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Este video tiene watermark con tu email y protección anti-descarga.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 Demo: Contenido Protegido</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentProtection>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-4">Contenido Exclusivo</h3>
                  <p className="mb-4">
                    Este contenido está protegido contra:
                  </p>
                  <ul className="text-left max-w-md mx-auto space-y-2">
                    <li>✅ Click derecho deshabilitado</li>
                    <li>✅ Herramientas de desarrollador bloqueadas</li>
                    <li>✅ Screenshots dificultados</li>
                    <li>✅ Contenido se oculta al cambiar de pestaña</li>
                  </ul>
                  <p className="mt-4 text-sm opacity-90">
                    Intenta hacer click derecho o abrir DevTools (F12)
                  </p>
                </div>
              </ContentProtection>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instrucciones de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Ejecuta el <strong>Test 1</strong> para hacer login con el usuario de prueba</li>
            <li>Una vez logueado, ejecuta el <strong>Test 2</strong> para crear un checkout</li>
            <li>Ejecuta el <strong>Test 3</strong> para verificar que el usuario tiene acceso</li>
            <li>Ejecuta el <strong>Test 4</strong> varias veces para probar el rate limiting</li>
            <li>Explora las demos de <strong>video con watermark</strong> y <strong>contenido protegido</strong></li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">
              💡 Nota: El usuario de prueba ya tiene acceso configurado al producto 6308462, 
              por lo que el Test 3 debería mostrar "PERMITIDO".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}