// CSS Cache Buster - Utilidad para forzar recarga de estilos
export const clearCSSCache = () => {
  // Eliminar todos los elementos de estilo del head
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
  stylesheets.forEach(sheet => {
    if (sheet.href && sheet.href.includes('assets')) {
      // Solo recargar los assets del build, no Google Fonts
      const newHref = sheet.href.split('?')[0] + '?v=' + Date.now();
      const newSheet = sheet.cloneNode(true);
      newSheet.href = newHref;
      sheet.parentNode.insertBefore(newSheet, sheet);
      setTimeout(() => sheet.remove(), 100);
    }
  });
};

export const forceCSSReload = () => {
  // Forzar reflow del DOM para asegurar que se apliquen los nuevos estilos
  document.body.offsetHeight;
  
  // Limpiar variables CSS específicas que pueden estar causando conflictos
  const rootStyle = document.documentElement.style;
  const cssVars = [
    '--background',
    '--foreground', 
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--card',
    '--card-foreground',
    '--accent',
    '--accent-foreground'
  ];
  
  // Remover y reaplicar variables CSS críticas
  cssVars.forEach(varName => {
    rootStyle.removeProperty(varName);
  });
  
  // Forzar un nuevo render
  requestAnimationFrame(() => {
    document.documentElement.classList.add('css-reload');
    setTimeout(() => {
      document.documentElement.classList.remove('css-reload');
    }, 10);
  });
};

export const initCSSStability = () => {
  // Aplicar cuando la página se carga
  window.addEventListener('load', forceCSSReload);
  
  // Aplicar cuando cambia la página (para SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(forceCSSReload, 50);
    }
  }).observe(document, { subtree: true, childList: true });
};