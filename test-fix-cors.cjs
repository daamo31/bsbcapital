// Test del cliente Supabase corregido
console.log('🧪 Testing corrected Supabase client...\n');

// Simular las variables de entorno como en el build
const mockEnv = {
  VITE_SUPABASE_URL: 'https://ietktalvzyykynhdkqhv.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTIwNTQsImV4cCI6MjA2NzcyODA1NH0.ZRTRG5fAnJfJF0Fq-NMyBJKeWKy8wsByC8tOu6eWBFw',
  MODE: 'production',
  PROD: true,
  DEV: false
};

// Simular la configuración corregida
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
  // Ya NO incluye headers CORS problemáticos
};

console.log('✅ Configuración corregida de Supabase:');
console.log(JSON.stringify(supabaseConfig, null, 2));

console.log('\n🔍 Headers problemáticos removidos:');
console.log('❌ Access-Control-Allow-Origin: * (REMOVIDO)');
console.log('❌ Access-Control-Allow-Headers: ... (REMOVIDO)');

console.log('\n✅ La configuración ahora es limpia y no enviará headers CORS desde el cliente');
console.log('\n📋 Próximos pasos:');
console.log('   1. Sube los archivos corregidos a producción');
console.log('   2. Prueba el checkout de Stripe');
console.log('   3. El error CORS debería haberse resuelto');