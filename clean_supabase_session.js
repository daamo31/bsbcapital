// Utilidad para limpiar sesiones corruptas de Supabase
// Ejecuta esto en la consola del navegador si sigues teniendo problemas

console.log('🧹 Limpiando sesiones corruptas de Supabase...');

// Limpiar localStorage
localStorage.removeItem('supabase.auth.token');
localStorage.removeItem('sb-ietktalvzyykynhdkqhv-auth-token');
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(`Eliminado: ${key}`);
  }
});

// Limpiar sessionStorage
sessionStorage.removeItem('supabase.auth.token');
sessionStorage.removeItem('sb-ietktalvzyykynhdkqhv-auth-token');
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth')) {
    sessionStorage.removeItem(key);
    console.log(`Eliminado: ${key}`);
  }
});

// Limpiar cookies relacionadas con auth
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

console.log('✅ Sesiones limpiadas. Recarga la página.');

// Recargar la página automáticamente
setTimeout(() => {
  window.location.reload();
}, 1000);