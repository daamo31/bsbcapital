import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ContentProtection = ({ children }) => {
  const { user } = useAuth();
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';

    // Disable drag and drop
    const preventDragDrop = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable right-click context menu
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
    const preventKeyboardShortcuts = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect DevTools (basic detection)
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    // Console warning
    const consoleWarning = () => {
      console.clear();
      console.log('%c🛑 STOP!', 'color: red; font-size: 50px; font-weight: bold;');
      console.log('%cEste es una función del navegador destinada a desarrolladores. El contenido de esta página está protegido por derechos de autor.', 'color: red; font-size: 16px;');
      console.log('%cSi alguien te dijo que pegues algo aquí, es una estafa y te pueden robar información.', 'color: red; font-size: 16px;');
    };

    // Blur content when screenshot is attempted
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(10px)';
      } else {
        document.body.style.filter = 'none';
      }
    };

    // Event listeners
    document.addEventListener('selectstart', preventDragDrop);
    document.addEventListener('dragstart', preventDragDrop);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', detectDevTools);

    // Initial checks
    detectDevTools();
    consoleWarning();

    // Periodic checks
    const interval = setInterval(() => {
      detectDevTools();
      consoleWarning();
    }, 1000);

    // Cleanup
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.filter = '';
      
      document.removeEventListener('selectstart', preventDragDrop);
      document.removeEventListener('dragstart', preventDragDrop);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(interval);
    };
  }, []);

  // Block content if DevTools are detected
  if (isDevToolsOpen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white p-8">
          <h1 className="text-2xl font-bold mb-4">🛑 Contenido Protegido</h1>
          <p className="mb-4">
            Por favor, cierra las herramientas de desarrollador para continuar.
          </p>
          <p className="text-sm opacity-70">
            Este contenido está protegido por derechos de autor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
      {/* Invisible overlay to detect screenshots */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
          background: 'linear-gradient(45deg, transparent 49.9%, rgba(255,255,255,0.01) 50%, transparent 50.1%)',
          backgroundSize: '1px 1px'
        }}
      />
    </>
  );
};

export default ContentProtection;