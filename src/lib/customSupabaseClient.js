import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ietktalvzyykynhdkqhv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw';

// Configuración mejorada para producción con CORS
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
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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

// Log de configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}

const g = getGlobal();
if (!g.__supabase_client__) {
	try {
		g.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, supabaseConfig);
	} catch (error) {
		console.error('Error creating Supabase client:', error);
		// Fallback sin configuración adicional
		g.__supabase_client__ = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
	}
}

export const supabase = g.__supabase_client__;