import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import emailService from '@/lib/emailService';
import { supabase } from '@/lib/customSupabaseClient';

const EmailTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('takingriskpodcast@gmail.com'); // Email registrado en Resend

  const addResult = (test, result) => {
    const newResult = {
      id: Date.now(),
      test,
      ...result,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]); // Mantener últimos 10 resultados
  };

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      addResult(testName, { success: true, data: result });
    } catch (error) {
      addResult(testName, { success: false, error: error.message });
    }
    setIsLoading(false);
  };

  const tests = [
    {
      name: 'Test Básico',
      description: 'Email de prueba simple',
      action: () => runTest('Test Básico', async () => {
        const { data, error } = await supabase.functions.invoke('resend-email-secure', {
          body: {
            type: 'test',
            to: testEmail,
            data: {
              name: 'Daniel (Test)',
              email: testEmail
            }
          }
        });
        
        if (error) throw new Error(error.message);
        return data;
      })
    },
    {
      name: 'Email de Bienvenida',
      description: 'Email de bienvenida profesional',
      action: () => runTest('Email de Bienvenida', async () => {
        const { data, error } = await supabase.functions.invoke('resend-email-secure', {
          body: {
            type: 'welcome',
            to: testEmail,
            data: {
              name: 'Daniel',
              email: testEmail
            }
          }
        });
        
        if (error) throw new Error(error.message);
        return data;
      })
    },
    {
      name: 'Confirmación de Consultoría',
      description: 'Email de confirmación de consultoría',
      action: () => runTest('Confirmación de Consultoría', async () => {
        const { data, error } = await supabase.functions.invoke('resend-email-secure', {
          body: {
            type: 'consultation_confirmation',
            to: testEmail,
            data: {
              name: 'Daniel',
              email: testEmail,
              consultationType: 'Estrategia de Inversión',
              scheduledDate: '25 de octubre de 2024',
              scheduledTime: '15:00',
              duration: '60 minutos',
              consultationGoals: 'Optimizar mi cartera de inversiones'
            }
          }
        });
        
        if (error) throw new Error(error.message);
        return data;
      })
    },
    {
      name: 'Email Personalizado',
      description: 'Email con contenido personalizado',
      action: () => runTest('Email Personalizado', async () => {
        const { data, error } = await supabase.functions.invoke('resend-email-secure', {
          body: {
            type: 'custom',
            to: testEmail,
            subject: '🎯 Email Personalizado - BSB Capital',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1e40af;">🎯 Email Personalizado</h1>
                <p>Este es un email personalizado desde BSB Capital.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Enviado a:</strong> ${testEmail}</p>
                  <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Sistema:</strong> resend-email-secure</p>
                </div>
                <p style="color: #059669;"><strong>✅ Sistema de emails personalizado funcionando!</strong></p>
              </div>
            `
          }
        });
        
        if (error) throw new Error(error.message);
        return data;
      })
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📧 Test de Sistema de Emails
        </h1>
        <p className="text-gray-600">
          Herramienta para probar todos los tipos de emails del sistema BSB Capital
        </p>
      </div>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configuración</CardTitle>
          <CardDescription>
            Configura el email de destino para las pruebas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="test-email">Email de Destino</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">
              Los emails de prueba se enviarán a esta dirección
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tests Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Tests Disponibles</CardTitle>
          <CardDescription>
            Ejecuta tests individuales para cada tipo de email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                <Button 
                  onClick={test.action}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? 'Ejecutando...' : `Ejecutar ${test.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ejecutar Todos */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Test Completo</CardTitle>
          <CardDescription>
            Ejecutar todos los tests en secuencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={async () => {
              for (const test of tests) {
                await test.action();
                // Esperar 1 segundo entre tests para no sobrecargar
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Ejecutando Tests...' : 'Ejecutar Todos los Tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados de Tests</CardTitle>
            <CardDescription>
              Últimos {testResults.length} resultados (más recientes primero)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <Alert key={result.id} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? '✅' : '❌'}
                      </Badge>
                      <span className="font-medium">{result.test}</span>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                  <AlertDescription className="mt-2">
                    {result.success ? (
                      <div>
                        <p className="text-green-800">✅ Test exitoso</p>
                        {result.data && (
                          <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-800">❌ Error: {result.error}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">� Email de Destino:</h4>
              <p className="text-blue-800">
                Actualmente configurado para: <code className="bg-white px-1">takingriskpodcast@gmail.com</code>
                <br />
                (Email registrado en Resend - requerido para testing)
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">✅ Función Activa:</h4>
              <p className="text-green-800">
                Usando: <code className="bg-white px-1">resend-email-secure</code>
                <br />
                (Versión final optimizada con máxima seguridad)
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900">⚡ Para usar en producción:</h4>
              <p className="text-yellow-800">
                Configura tu dominio en resend.com/domains y actualiza el email FROM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTester;