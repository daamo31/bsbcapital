// Script para detectar problemas de responsive en móvil
// Se puede ejecutar desde la consola del navegador móvil

function detectMobileIssues() {
  const issues = [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  console.log('=== DIAGNÓSTICO MÓVIL BSB CAPITAL ===');
  console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
  console.log(`User Agent: ${navigator.userAgent}`);
  
  // 1. Verificar elementos que se salen del viewport horizontalmente
  const allElements = document.querySelectorAll('*');
  let elementsOutsideViewport = 0;
  
  allElements.forEach((el, index) => {
    if (el.offsetWidth && el.offsetHeight) { // Solo elementos visibles
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth) {
        elementsOutsideViewport++;
        if (elementsOutsideViewport <= 5) { // Solo mostrar primeros 5
          console.warn(`Elemento fuera del viewport:`, el, `Width: ${rect.width}, Right: ${rect.right}`);
        }
      }
    }
  });
  
  // 2. Verificar el header
  const header = document.querySelector('header');
  if (header) {
    const headerRect = header.getBoundingClientRect();
    console.log(`Header height: ${headerRect.height}px`);
    console.log(`Header position: ${getComputedStyle(header).position}`);
    console.log(`Header z-index: ${getComputedStyle(header).zIndex}`);
  }
  
  // 3. Verificar el main content
  const main = document.querySelector('main');
  if (main) {
    const mainStyles = getComputedStyle(main);
    console.log(`Main padding-top: ${mainStyles.paddingTop}`);
    console.log(`Main margin-top: ${mainStyles.marginTop}`);
  }
  
  // 4. Verificar errores de JavaScript
  const errors = [];
  window.addEventListener('error', (e) => {
    errors.push(e);
    console.error('JavaScript Error:', e.error);
  });
  
  // 5. Verificar elementos con position fixed que puedan causar problemas
  const fixedElements = Array.from(allElements).filter(el => 
    getComputedStyle(el).position === 'fixed'
  );
  
  console.log(`Elementos fixed encontrados: ${fixedElements.length}`);
  fixedElements.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    console.log(`Fixed ${i+1}:`, el, `Height: ${rect.height}`, `Z-index: ${getComputedStyle(el).zIndex}`);
  });
  
  // 6. Verificar elementos muy anchos
  const wideElements = Array.from(allElements).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > viewportWidth + 10; // 10px de tolerancia
  });
  
  console.log(`Elementos demasiado anchos: ${wideElements.length}`);
  wideElements.slice(0, 3).forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    console.warn(`Ancho excesivo ${i+1}:`, el, `Width: ${rect.width}px`);
  });
  
  // 7. Verificar scroll horizontal
  const hasHorizontalScroll = document.documentElement.scrollWidth > viewportWidth;
  console.log(`Scroll horizontal detectado: ${hasHorizontalScroll}`);
  
  // 8. Verificar si la pantalla está completamente blanca
  const bodyStyles = getComputedStyle(document.body);
  const htmlStyles = getComputedStyle(document.documentElement);
  
  console.log(`Body background: ${bodyStyles.backgroundColor}`);
  console.log(`HTML background: ${htmlStyles.backgroundColor}`);
  console.log(`Body height: ${document.body.offsetHeight}px`);
  
  // 9. Verificar contenido visible
  const visibleElements = Array.from(allElements).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top < viewportHeight && rect.bottom > 0 &&
           getComputedStyle(el).visibility !== 'hidden' &&
           getComputedStyle(el).display !== 'none';
  });
  
  console.log(`Elementos visibles: ${visibleElements.length}`);
  
  // 10. Resumen
  console.log('=== RESUMEN ===');
  console.log(`✓ Viewport: ${viewportWidth}x${viewportHeight}`);
  console.log(`${elementsOutsideViewport > 0 ? '⚠️' : '✓'} Elementos fuera del viewport: ${elementsOutsideViewport}`);
  console.log(`${hasHorizontalScroll ? '⚠️' : '✓'} Scroll horizontal: ${hasHorizontalScroll}`);
  console.log(`${fixedElements.length > 2 ? '⚠️' : '✓'} Elementos fixed: ${fixedElements.length}`);
  console.log(`${visibleElements.length < 10 ? '⚠️' : '✓'} Elementos visibles: ${visibleElements.length}`);
  
  return {
    viewportWidth,
    viewportHeight,
    elementsOutsideViewport,
    hasHorizontalScroll,
    fixedElements: fixedElements.length,
    visibleElements: visibleElements.length,
    errors
  };
}

// Auto-ejecutar en 2 segundos para dar tiempo a que cargue la página
setTimeout(() => {
  console.log('🔍 Iniciando diagnóstico automático...');
  detectMobileIssues();
}, 2000);

// También disponible manualmente
window.detectMobileIssues = detectMobileIssues;