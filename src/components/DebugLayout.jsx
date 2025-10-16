import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Menu, X, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Layout de debug que iremos expandiendo paso a paso
const DebugLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'BSB Maker', href: '/bsb-maker' },
    { name: 'Consultoría', href: '/consultoria' },
    { name: 'Formación', href: '/formacion' },
    { name: 'Membresías', href: '/membresias' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header con fixed position como el original */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <img 
              alt="Logotipo de BSB Capital" 
              className="h-13 w-auto" 
              src="https://horizons-cdn.hostinger.com/817ad863-5db3-450e-8aa2-198248142884/b6e16d0690a67f5cbf9123ef9d9129e7.png" 
            />
          </Link>
          
          {/* Navigation desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* Buttons desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <Button asChild variant="outline">
              <Link to="/contacto">Contactar</Link>
            </Button>
            {user ? (
              <Button asChild>
                <Link to="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  Mi Cuenta
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Button onClick={toggleMenu} variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu sin Framer Motion */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  onClick={closeMenu} 
                  className="text-base sm:text-lg font-semibold text-text-secondary hover:text-primary transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t pt-6 mt-4 flex flex-col gap-4">
                <Button asChild className="w-full" variant="outline" onClick={closeMenu}>
                  <Link to="/contacto">Contactar</Link>
                </Button>
                {user ? (
                  <Button asChild className="w-full" onClick={closeMenu}>
                    <Link to="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" onClick={closeMenu}>
                    <Link to="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content con padding-top para el header fixed */}
      <main className="flex-grow pt-16 sm:pt-20">
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Contenido Principal</h2>
            <p className="mb-4">Ancho: {window.innerWidth}px | Alto: {window.innerHeight}px</p>
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer simplificado */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 BSB Capital</p>
        </div>
      </footer>
    </div>
  );
};

export default DebugLayout;