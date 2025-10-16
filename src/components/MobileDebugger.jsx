import React, { useState, useEffect } from 'react';

const MobileDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});

  const checkTailwind = () => {
    try {
      // Método 1: Buscar variables CSS de Tailwind
      const computedStyle = getComputedStyle(document.documentElement);
      const hasTailwindVars = [
        '--tw-translate-x',
        '--tw-translate-y', 
        '--tw-rotate',
        '--tw-ring-color'
      ].some(varName => computedStyle.getPropertyValue(varName) !== '');
      
      if (hasTailwindVars) return true;

      // Método 2: Buscar en las hojas de estilo
      const stylesheets = Array.from(document.styleSheets);
      for (const sheet of stylesheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (const rule of rules) {
              if (rule.cssText && (
                rule.cssText.includes('--tw-') ||
                rule.cssText.includes('tailwindcss') ||
                rule.cssText.includes('.container') ||
                rule.cssText.includes('.sr-only') ||
                rule.cssText.includes('.fixed')
              )) {
                return true;
              }
            }
          }
        } catch (e) {
          // CORS o acceso denegado, intentar otros métodos
        }
      }

      // Método 3: Crear elemento de prueba con múltiples clases
      const testDiv = document.createElement('div');
      testDiv.className = 'sr-only fixed absolute relative hidden block flex';
      testDiv.style.position = 'absolute';
      testDiv.style.left = '-9999px';
      document.body.appendChild(testDiv);
      
      const style = getComputedStyle(testDiv);
      const hasUtilities = (
        style.position === 'absolute' &&
        (style.display === 'flex' || style.display === 'block')
      );
      
      document.body.removeChild(testDiv);
      return hasUtilities;
    } catch (error) {
      console.error('Error checking Tailwind:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkResponsive = () => {
      const info = {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        viewport: document.querySelector('meta[name="viewport"]')?.content || 'no viewport meta',
        isMobile: window.innerWidth < 768,
        timestamp: new Date().toLocaleString(),
        hasTailwind: checkTailwind(),
        // Verificar breakpoints actuales
        currentBreakpoint: (() => {
          const width = window.innerWidth;
          if (width >= 1536) return '2XL (1536px+)';
          if (width >= 1280) return 'XL (1280px+)';
          if (width >= 1024) return 'LG (1024px+)';
          if (width >= 768) return 'MD (768px+)';
          if (width >= 640) return 'SM (640px+)';
          if (width >= 475) return 'XS (475px+)';
          return 'Mobile (<475px)';
        })()
      };
      setDebugInfo(info);
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-xs border border-gray-700">
      <h3 className="font-bold mb-2">🐛 Mobile Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Screen:</strong> {debugInfo.screenWidth}x{debugInfo.screenHeight}</div>
        <div><strong>Mobile:</strong> {debugInfo.isMobile ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Tailwind:</strong> {debugInfo.hasTailwind ? '✅ Loaded' : '❌ Missing'}</div>
        <div><strong>Viewport:</strong> {debugInfo.viewport}</div>
        <div><strong>Time:</strong> {debugInfo.timestamp}</div>
        <div><strong>Breakpoint:</strong> {debugInfo.currentBreakpoint}</div>
        
        {/* Test responsive classes */}
        <div className="mt-2 p-2 bg-white/10 rounded border">
          <div className="text-yellow-400 font-semibold mb-1">Responsive Test:</div>
          <div className="block sm:hidden text-green-400">📱 Mobile (default)</div>
          <div className="hidden sm:block md:hidden text-blue-400">📟 SM (640px+)</div>
          <div className="hidden md:block lg:hidden text-purple-400">💻 MD (768px+)</div>
          <div className="hidden lg:block xl:hidden text-orange-400">🖥️ LG (1024px+)</div>
          <div className="hidden xl:block 2xl:hidden text-red-400">🖥️ XL (1280px+)</div>
          <div className="hidden 2xl:block text-pink-400">🖥️ 2XL (1536px+)</div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugger;