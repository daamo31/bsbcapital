// Utility para limpiar tokens corruptos de Supabase automáticamente
export const cleanCorruptedSupabaseTokens = (forceReload = false) => {
  try {
    // Limpiar todos los tokens de Supabase del localStorage
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      console.log('🧹 Limpiando token corrupto:', key);
      localStorage.removeItem(key);
    });

    // Limpiar también sessionStorage por si acaso
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        sessionKeysToRemove.push(key);
      }
    }

    sessionKeysToRemove.forEach((key) => {
      console.log('🧹 Limpiando token corrupto de sessionStorage:', key);
      sessionStorage.removeItem(key);
    });

    if (keysToRemove.length > 0 || sessionKeysToRemove.length > 0 || forceReload) {
      console.log('✅ Tokens limpiados (o forzado). Recargando página...');
      // Recargar la página para reinicializar Supabase
      window.location.reload();
    }
  } catch (error) {
    console.error('Error limpiando tokens:', error);
  }
};

// Interceptar errores 403 de Supabase y limpiar automáticamente
export const setupSupabaseErrorInterceptor = () => {
  // Interceptar fetch para detectar errores 403 de Supabase
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);

      // Si es una petición a Supabase y devuelve 403
      if (args[0]?.toString().includes('supabase.co/auth/v1/user') && response.status === 403) {
        console.warn('🚨 Detectado error 403 en Supabase Auth - Limpiando tokens y recargando...');
        cleanCorruptedSupabaseTokens(true);
      }

      return response;
    } catch (error) {
      console.error('Error en fetch interceptor:', error);
      throw error;
    }
  };
};

// Auto-limpieza al cargar la página si detectamos patrones de tokens corruptos
export const autoCleanOnLoad = () => {
  try {
    // Verificar si hay tokens que parecen corruptos
    const authToken = localStorage.getItem('sb-ietktalvzyykynhdkqhv-auth-token');

    if (authToken) {
      try {
        const parsed = JSON.parse(authToken);

        // Verificar si el token tiene estructura válida
        if (!parsed.access_token || !parsed.refresh_token || !parsed.expires_at) {
          console.warn('🚨 Token con estructura inválida detectado');
          cleanCorruptedSupabaseTokens();
          return;
        }

        // Verificar si el token está expirado hace mucho tiempo
        const expiresAt = new Date(parsed.expires_at * 1000);
        const now = new Date();
        const hoursSinceExpiration = (now - expiresAt) / (1000 * 60 * 60);

        if (hoursSinceExpiration > 24) {
          console.warn('🚨 Token expirado desde hace más de 24 horas');
          cleanCorruptedSupabaseTokens();
          return;
        }
      } catch (parseError) {
        console.warn('🚨 Token no parseble detectado:', parseError);
        cleanCorruptedSupabaseTokens();
        return;
      }
    }
  } catch (error) {
    console.error('Error en auto-limpieza:', error);
  }
};

export default {
  cleanCorruptedSupabaseTokens,
  setupSupabaseErrorInterceptor,
  autoCleanOnLoad,
};
