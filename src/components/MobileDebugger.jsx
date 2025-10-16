import React, { useState, useEffect } from 'react';

const MobileDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkResponsive = () => {
      const info = {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        viewport: document.querySelector('meta[name="viewport"]')?.content || 'no viewport meta',
        isMobile: window.innerWidth < 768,
        timestamp: new Date().toLocaleString(),
        // Verificar si Tailwind está cargado
        hasTailwind: !!document.querySelector('style')?.textContent?.includes('tailwind'),
        // Verificar clases responsive específicas
        responsiveClasses: {
          sm: getComputedStyle(document.documentElement).getPropertyValue('--tw-screen-sm') || 'not found',
          md: getComputedStyle(document.documentElement).getPropertyValue('--tw-screen-md') || 'not found',
          lg: getComputedStyle(document.documentElement).getPropertyValue('--tw-screen-lg') || 'not found',
        }
      };
      setDebugInfo(info);
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-xs text-xs">
      <h3 className="font-bold mb-2">🐛 Mobile Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Screen:</strong> {debugInfo.screenWidth}x{debugInfo.screenHeight}</div>
        <div><strong>Mobile:</strong> {debugInfo.isMobile ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Tailwind:</strong> {debugInfo.hasTailwind ? '✅ Loaded' : '❌ Missing'}</div>
        <div><strong>Viewport:</strong> {debugInfo.viewport}</div>
        <div><strong>Time:</strong> {debugInfo.timestamp}</div>
        
        {/* Test responsive classes */}
        <div className="mt-2 p-2 bg-black/20 rounded">
          <div className="block sm:hidden">📱 Mobile View (default)</div>
          <div className="hidden sm:block md:hidden">📟 SM (640px+)</div>
          <div className="hidden md:block lg:hidden">💻 MD (768px+)</div>
          <div className="hidden lg:block xl:hidden">🖥️ LG (1024px+)</div>
          <div className="hidden xl:block">🖥️ XL (1280px+)</div>
        </div>
      </div>
    </div>
  );
};

export default MobileDebugger;