import { useEffect, useState } from 'react';

export const useMobileDebug = () => {
  const [mobileInfo, setMobileInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectMobileIssues = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 768;
      
      // Verificar si hay elementos que causen scroll horizontal
      const bodyWidth = document.body.scrollWidth;
      const hasHorizontalScroll = bodyWidth > viewportWidth;
      
      // Verificar elementos fixed
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => 
        getComputedStyle(el).position === 'fixed'
      );
      
      // Verificar header height
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      
      // Verificar main padding
      const main = document.querySelector('main');
      const mainPaddingTop = main ? getComputedStyle(main).paddingTop : '0px';
      
      // Verificar si hay contenido visible
      const visibleElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top < viewportHeight && rect.bottom > 0;
      });
      
      const info = {
        isMobile,
        viewportWidth,
        viewportHeight,
        hasHorizontalScroll,
        bodyWidth,
        fixedElementsCount: fixedElements.length,
        headerHeight,
        mainPaddingTop,
        visibleElementsCount: visibleElements.length,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      setMobileInfo(info);
      setIsLoading(false);
      
      // Log para debugging
      if (isMobile) {
        console.log('🔍 Mobile Debug Info:', info);
        
        if (hasHorizontalScroll) {
          console.warn('⚠️ Scroll horizontal detectado en móvil');
        }
        
        if (visibleElements.length < 5) {
          console.warn('⚠️ Pocos elementos visibles, posible pantalla en blanco');
        }
        
        if (headerHeight > 0 && mainPaddingTop) {
          const headerPx = headerHeight;
          const paddingPx = parseInt(mainPaddingTop);
          if (Math.abs(headerPx - paddingPx) > 5) {
            console.warn(`⚠️ Desajuste header/padding: Header ${headerPx}px, Padding ${paddingPx}px`);
          }
        }
      }
      
      return info;
    };

    // Detectar inmediatamente
    const initialInfo = detectMobileIssues();
    
    // También detectar cuando cambie el tamaño de ventana
    const handleResize = () => {
      detectMobileIssues();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Detectar de nuevo después de un momento para asegurar que todo haya cargado
    const timeoutId = setTimeout(() => {
      detectMobileIssues();
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return { mobileInfo, isLoading };
};

export default useMobileDebug;