import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/customSupabaseClient';

const EmailTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, result) => {
    const newResult = {
      id: Date.now(),
      test,
      ...result,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]);
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

  const testBasico = () => runTest('Test Básico', async () => {
    const { data, error } = await supabase.functions.invoke('resend-email-secure', {
      body: {
        type: 'test',
        to: 'cualquier@email.com',
        data: { name: 'Daniel Test' }
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  });

  const testDiagnostico = () => runTest('Diagnóstico Completo', async () => {
    const { data, error } = await supabase.functions.invoke('resend-email-secure', {
      body: {
        type: 'test',
        to: 'test@example.com',
        data: { 
          name: 'Diagnóstico BSB',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      }
    });
    
    if (error) throw new Error(error.message);
    
    // Agregar información extra al resultado
    return {
      ...data,
      diagnostic: true,
      sentAt: new Date().toLocaleString(),
      function: 'resend-email-secure',
      resendApi: 'https://api.resend.com'
    };
  });

  const testBienvenida = () => runTest('Email de Bienvenida', async () => {
    const { data, error } = await supabase.functions.invoke('resend-email-secure', {
      body: {
        type: 'welcome',
        to: 'danieldelamo31@gmail.com',
        data: { name: 'Daniel' }
      }
    });
    
    if (error) throw new Error(error.message);
    return data;
  });

  const testConsultoria = () => runTest('Confirmación de Consultoría', async () => {
    const { data, error } = await supabase.functions.invoke('resend-email-secure', {
      body: {
        type: 'consultation_confirmation',
        to: 'danieldelamo31@gmail.com',
        data: {
          name: 'Daniel',
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
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📧 Tester de Emails BSB Capital
        </h1>
        <p className="text-gray-600">
          Sistema de testing con múltiples destinatarios
        </p>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🟢 Sistema Activo</CardTitle>
          <CardDescription>
            Función: resend-email-secure | Remitente: BSB Capital | Plan: Gratuito (limitado)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <strong>📤 Remitente:</strong><br/>
              BSB Capital &lt;onboarding@resend.dev&gt;
            </div>
            <div className="bg-white p-3 rounded border">
              <strong>📨 Destinatario:</strong><br/>
              • danieldelamo31@gmail.com<br/>
              <span className="text-xs text-green-600">✅ Confirmado por dashboard</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧪 Tests Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={testBasico}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <span className="text-lg mb-1">🧪</span>
              Test Básico
            </Button>
            
            <Button 
              onClick={testDiagnostico}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col border-blue-300 text-blue-700"
            >
              <span className="text-lg mb-1">🔍</span>
              Diagnóstico
            </Button>
            
            <Button 
              onClick={testBienvenida}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <span className="text-lg mb-1">👋</span>
              Bienvenida
            </Button>
            
            <Button 
              onClick={testConsultoria}
              disabled={isLoading}
              variant="outline"
              className="h-20 flex flex-col"
            >
              <span className="text-lg mb-1">📅</span>
              Consultoría
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result) => (
                <Alert key={result.id} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? '✅' : '❌'}
                    </Badge>
                    <span className="font-medium">{result.test}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <AlertDescription>
                    {result.success ? (
                      <div>
                        <p className="text-green-800 mb-2">✅ Email enviado exitosamente</p>
                        {result.data && (
                          <div className="space-y-2 text-sm">
                            {result.data.sender && (
                              <div className="bg-blue-100 p-2 rounded">
                                <strong>📤 Remitente:</strong> {result.data.sender}
                              </div>
                            )}
                            {result.data.actualRecipients && (
                              <div className="bg-green-100 p-2 rounded">
                                <strong>📨 Enviado a:</strong> {result.data.actualRecipients.join(', ')}
                              </div>
                            )}
                            {result.data.id && (
                              <div className="bg-purple-100 p-2 rounded">
                                <strong>🆔 ID Resend:</strong> {result.data.id}
                                <p className="text-xs mt-1 text-purple-700">✅ Confirmación de que el email se procesó por Resend</p>
                              </div>
                            )}
                            {result.data.testingMode && (
                              <div className="bg-yellow-100 p-2 rounded">
                                <strong>🧪 Modo Testing:</strong> Activo
                                <p className="text-xs mt-1 text-yellow-700">Los emails van a direcciones de prueba configuradas</p>
                              </div>
                            )}
                            {result.data.diagnostic && (
                              <div className="bg-indigo-100 p-2 rounded">
                                <strong>🔍 Diagnóstico Completo:</strong>
                                <p className="text-xs mt-1 text-indigo-700">Función: {result.data.function}</p>
                                <p className="text-xs text-indigo-700">API: {result.data.resendApi}</p>
                                <p className="text-xs text-indigo-700">Enviado: {result.data.sentAt}</p>
                              </div>
                            )}
                            <div className="bg-orange-100 p-2 rounded border border-orange-300">
                              <strong className="text-orange-800">⚠️ Si no recibes el email:</strong>
                              <p className="text-xs mt-1 text-orange-700">1. Revisa tu carpeta de SPAM/CORREO NO DESEADO</p>
                              <p className="text-xs text-orange-700">2. Los emails vienen de onboarding@resend.dev</p>
                              <p className="text-xs text-orange-700">3. Plan gratuito de Resend tiene limitaciones</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-800">❌ Error: {result.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📖 Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <strong className="text-blue-900">📧 Destinatario:</strong>
              <p className="text-blue-800">Solo se envía a danieldelamo31@gmail.com (propietario confirmado por dashboard)</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong className="text-green-900">👤 Remitente:</strong>
              <p className="text-green-800">BSB Capital &lt;onboarding@resend.dev&gt;</p>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <strong className="text-orange-900">⚠️ Plan Gratuito:</strong>
              <p className="text-orange-800">Resend solo permite enviar al propietario de la cuenta</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">⚠️ Importante: Verificación de Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
              <strong className="text-orange-900">🗂️ Revisa tu carpeta de SPAM:</strong>
              <p className="text-orange-800 mt-1">Los emails pueden ir a spam porque usamos onboarding@resend.dev (dominio de desarrollo)</p>
            </div>
            <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
              <strong className="text-red-900">🚫 Limitaciones del Plan Gratuito:</strong>
              <p className="text-red-800 mt-1">Resend plan gratuito tiene límites y restricciones de entrega</p>
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <strong className="text-green-900">✅ Dashboard Confirmado:</strong>
              <p className="text-green-800 mt-1">Solo 1 email enviado visible en métricas de Resend (a danieldelamo31@gmail.com)</p>
            </div>
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <strong className="text-blue-900">✅ Propietario Real:</strong>
              <p className="text-blue-800 mt-1">danieldelamo31@gmail.com (confirmado por dashboard de Resend)</p>
            </div>
            <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
              <strong className="text-purple-900">🔍 Diagnóstico:</strong>
              <p className="text-purple-800 mt-1">Use el botón "Diagnóstico" para obtener información completa del envío</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTester;
