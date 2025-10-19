import React, { useState, useCallback } from 'react';

const emailTypes = [
  'test',
  'welcome',
  'consultation_confirmation',
  'consultation_financial',
  'academia_bsb',
  'trader_plan_pro',
  'premium_investor',
  'wealth_membership',
  'admin_consultation_notification',
  'custom'
];

const EmailTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customTo, setCustomTo] = useState('test@example.com');
  const [customType, setCustomType] = useState('test');
  const [customData, setCustomData] = useState('{\n  "name": "Daniel Test"\n}');
  const [customError, setCustomError] = useState('');

  const addResult = useCallback((test, result) => {
    const newResult = {
      id: Date.now(),
      test,
      ...result,
      timestamp: new Date().toLocaleTimeString('es-ES')
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]);
  }, []);

  const runTest = useCallback(async (testName, testFunction) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      addResult(testName, { success: true, data: result });
    } catch (error) {
      addResult(testName, { success: false, error: error.message });
    }
    setIsLoading(false);
  }, [addResult]);

  const sendCustomEmail = async () => {
    if (customError || !customTo) return;
    setIsLoading(true);
    setCustomError('');
    let parsedData = {};
    try {
      parsedData = customData.trim() ? JSON.parse(customData) : {};
    } catch (e) {
      setCustomError('El campo Datos JSON no es válido.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/resend-email-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: customType,
          to: customTo,
          data: parsedData
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error desconocido');
      addResult(`Custom: ${customType}`, { success: true, data: result });
    } catch (error) {
      addResult(`Custom: ${customType}`, { success: false, error: error.message });
    }
    setIsLoading(false);
  };

  const testBasico = () => runTest('Test Básico (Simple)', async () => {
    const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/resend-email-secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        to: 'danieldelamo31@gmail.com',
        data: { name: 'Daniel Test Básico' }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
    return result;
  });

  const testDiagnostico = () => runTest('Diagnóstico Completo', async () => {
    const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/resend-email-secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        to: 'danieldelamo31@gmail.com',
        data: {
          name: 'Diagnóstico BSB',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
    return {
      ...result,
      diagnostic: true,
      sentAt: new Date().toLocaleString('es-ES'),
      function: 'resend-email-secure',
      resendApi: 'https://api.resend.com'
    };
  });

  const testBienvenida = () => runTest('Email de Bienvenida', async () => {
    const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/resend-email-secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: 'danieldelamo31@gmail.com',
        data: { name: 'Daniel' }
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
    return result;
  });

  const testConsultoria = () => runTest('Confirmación de Consultoría', async () => {
    const response = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/resend-email-secure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Error desconocido');
    return result;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          📧 Tester de Emails BSB Capital
        </h1>
        <p className="text-gray-600">
          Herramienta de diagnóstico para la función resend-email-secure.
        </p>
      </div>
      {/* Loader Global */}
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-md border-2 border-yellow-300">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Enviando email, por favor espera...
        </div>
      )}
      {/* Formulario personalizado */}
      <form
        onSubmit={e => {
          e.preventDefault();
          sendCustomEmail();
        }}
        className="space-y-4"
      >
        <input
          type="email"
          value={customTo}
          onChange={e => setCustomTo(e.target.value)}
          required
        />
        <select
          value={customType}
          onChange={e => setCustomType(e.target.value)}
        >
          {emailTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <textarea
          value={customData}
          onChange={e => {
            setCustomData(e.target.value);
            try {
              if (e.target.value.trim()) JSON.parse(e.target.value);
              setCustomError('');
            } catch {
              setCustomError('Datos JSON no es válido.');
            }
          }}
          onBlur={e => {
            try {
              if (e.target.value.trim()) {
                setCustomData(JSON.stringify(JSON.parse(e.target.value), null, 2));
                setCustomError('');
              }
            } catch {}
          }}
          spellCheck={false}
          autoComplete="off"
        />
        {customError && <div className="text-red-600 text-sm mt-2">{customError}</div>}
        <button type="submit" disabled={isLoading || !customTo || !!customError}>
          {isLoading ? 'Enviando...' : 'Enviar Email Personalizado'}
        </button>
      </form>
      {/* Tests Disponibles */}
      <button onClick={testBasico} disabled={isLoading}>Test Básico</button>
      <button onClick={testDiagnostico} disabled={isLoading}>Diagnóstico Completo</button>
      <button onClick={testBienvenida} disabled={isLoading}>Bienvenida</button>
      <button onClick={testConsultoria} disabled={isLoading}>Conf. Consultoría</button>
      {/* Resultados */}
      {testResults.length > 0 && (
        <div>
          <h2>Historial de Resultados</h2>
          {testResults.map((result) => (
            <div key={result.id} style={{ border: result.success ? '1px solid green' : '1px solid red', margin: 8, padding: 8 }}>
              <strong>{result.test}</strong> - {result.timestamp}
              {result.success ? (
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              ) : (
                <div style={{ color: 'red' }}>{result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailTester;
