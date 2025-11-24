import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ietktalvzyykynhdkqhv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw';

// Log de diagnóstico para identificar problemas
console.log('🔧 Supabase Client Configuration:', {
  url: SUPABASE_URL,
  hasAnonKey: !!SUPABASE_ANON_KEY,
  environment: import.meta.env.MODE,
  nodeEnv: import.meta.env.NODE_ENV
});

// Configuración mejorada para producción
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

const getGlobal = () => {
	if (typeof globalThis !== 'undefined') return globalThis;
	if (typeof window !== 'undefined') return window;
	return global;
};

// Validación de configuración
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase configuration missing. Check environment variables.');
}

// Log de configuración en desarrollo y producción para debugging
console.log('🔍 Supabase Environment Debug:', {
  url: SUPABASE_URL,
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD
});

const g = getGlobal();
if (!g.__supabase_client__) {
	try {
		g.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfig);
		console.log('✅ Supabase client created successfully');
	} catch (error) {
		console.error('❌ Error creating Supabase client:', error);
		// Fallback sin configuración adicional
		g.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
		console.log('⚠️ Using fallback Supabase client configuration');
	}
}

export const supabase = g.__supabase_client__;

// Función auxiliar para diagnosticar problemas con Edge Functions
export const diagnoseEdgeFunction = async (functionName) => {
  console.log(`🔍 Diagnosing Edge Function: ${functionName}`);
  
  try {
    // Test de conectividad básica
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'OPTIONS',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`✅ Edge Function ${functionName} connectivity test:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    return { success: true, status: response.status };
  } catch (error) {
    console.error(`❌ Edge Function ${functionName} connectivity test failed:`, error);
    return { success: false, error: error.message };
  }
};