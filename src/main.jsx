import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { Toaster } from '@/components/ui/feedback/toaster';
import { autoCleanOnLoad, setupSupabaseErrorInterceptor } from '@/utils/supabaseTokenCleaner';
import { initCSSStability } from '@/utils/cssStabilizer';
import '@/index.css';

// Configurar limpieza automática de tokens corruptos
autoCleanOnLoad();
setupSupabaseErrorInterceptor();

// Inicializar estabilidad CSS para evitar "discoteca" de colores
initCSSStability();

// Deshabilitar logs en producción (mantener solo errores críticos)
if (import.meta.env.PROD) {
  // Guardar referencias originales por si necesitas depurar
  window.__originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    debug: console.debug,
    trace: console.trace,
  };

  // Deshabilitar logs en producción
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
  // console.warn y console.error se mantienen para problemas importantes

  // Para habilitar temporalmente los logs en producción, ejecuta en consola:
  // Object.assign(console, window.__originalConsole);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
    <Toaster />
  </BrowserRouter>
);
