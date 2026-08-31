import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  Loader2,
  LogIn,
  User,
  Settings,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { useToast } from '@/components/ui/feedback/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import AdminDropdown from '@/components/admin/AdminDropdown';
import CookieConsent from '@/components/common/CookieConsent';

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscription = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Error',
        description: 'Por favor, introduce tu correo electrónico.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('newsletter_subscriptions').insert({ email: email });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          variant: 'destructive',
          title: 'Ya estás suscrito',
          description: 'Este correo electrónico ya está en nuestra lista.',
        });
      } else {
        toast({
          title: 'Error en la suscripción',
          description: 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
      console.error('Error inserting newsletter subscription:', error);
    } else {
      toast({
        title: '¡Suscripción exitosa!',
        description: 'Gracias por unirte a Free Access.',
      });
      setEmail('');
    }
  };

  return (
    <footer className="bg-brand-green-900 text-brand-green-100">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img
                alt="Logotipo de BSB Capital - Inteligencia financiera en criptoactivos"
                className="h-13 w-auto"
                src="/images/white_logo-Photoroom.png"
                width="1081"
                height="1080"
                loading="lazy"
              />
              <span className="font-bold text-xl text-white">BSB Capital</span>
            </Link>
            <p className="mt-4 text-sm text-brand-green-100/70">
              La primera firma que combina asesoramiento financiero independiente con
              especialización crypto y activos digitales.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:col-span-3">
            <div>
              <p className="font-semibold text-white">Servicios</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="/consultoria-cripto"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    BSB Consulting
                  </Link>
                </li>
                <li>
                  <Link
                    to="/formacion-criptoactivos"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    BSB Academy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/bsb-maker"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    BSB Maker
                  </Link>
                </li>
                <li>
                  <Link
                    to="/servicios-adicionales-cripto"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    Otros servicios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Empresa</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    to="/empresa"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    BSB Capital
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacto"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Redes Sociales</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.linkedin.com/company/bsb-capital-finance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                    bsbcapital.io
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/bsbcapital.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-green-100/70 hover:text-white transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                    bsbcapital.io
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-brand-green-600 pt-8 flex flex-col items-center text-sm text-center">
          <p className="text-brand-green-100/50">
            &copy; {new Date().getFullYear()} BSB Capital. Todos los derechos reservados.
          </p>
          <p className="text-brand-green-100/50 mt-1">
            Oficina en Dubái. Asesor financiero acreditado en España.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            <Link
              to="/legal/aviso-legal"
              className="text-brand-green-100/50 hover:text-white transition-colors"
            >
              Aviso Legal
            </Link>
            <Link
              to="/legal/privacidad"
              className="text-brand-green-100/50 hover:text-white transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              to="/legal/cookies"
              className="text-brand-green-100/50 hover:text-white transition-colors"
            >
              Política de Cookies
            </Link>
            <Link
              to="/legal/terminos-de-uso"
              className="text-brand-green-100/50 hover:text-white transition-colors"
            >
              Términos de Uso
            </Link>
            <Link
              to="/legal/condiciones-generales"
              className="text-brand-green-100/50 hover:text-white transition-colors"
            >
              Condiciones Generales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const navLinks = [
    { name: 'BSB Consulting', href: '/consultoria-cripto' },
    { name: 'BSB Academy', href: '/formacion-criptoactivos' },
    { name: 'BSB Maker', href: '/bsb-maker' },
    { name: 'Paquetes', href: '/paquetes-cripto' },
    { name: 'Otros Servicios', href: '/servicios-adicionales-cripto' },
    { name: 'BSB Capital', href: '/empresa' },
    { name: 'Blog', href: '/blog' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img
            alt="Logotipo de BSB Capital - Consultoría y soluciones en criptoactivos"
            className="h-13 w-auto"
            src="/images/black_logo-Photoroom.png"
            width="1081"
            height="1080"
            loading="lazy"
          />
        </Link>
        <nav className="hidden xl:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm xl:text-base font-semibold text-text-secondary hover:text-primary transition-colors whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        {/* Support for 1024px to 1280px range with even more compact nav */}
        <nav className="hidden lg:flex xl:hidden items-center gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-xs font-bold text-text-secondary hover:text-primary transition-colors whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white h-9 px-3"
          >
            <Link to="/contacto">Contacto</Link>
          </Button>
          {user ? (
            <>
              {isAdmin && <AdminDropdown />}
              <Button asChild size="sm" className="h-9 px-3">
                <Link to="/area-cliente">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden xl:inline">Mi Cuenta</span>
                  <span className="xl:hidden">Cuenta</span>
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="h-9 px-3">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                <span className="hidden xl:inline">Iniciar Sesión</span>
                <span className="xl:hidden">Login</span>
              </Link>
            </Button>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-2">
          <Button onClick={toggleMenu} variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {/* Mobile menu sin AnimatePresence - FIX para móvil */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t max-h-[calc(100vh-4rem)] overflow-y-auto">
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
              <Button
                asChild
                className="w-full border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white"
                variant="outline"
                onClick={closeMenu}
              >
                <Link to="/contacto">Contactar</Link>
              </Button>
              {user ? (
                <>
                  {isAdmin && (
                    <Button asChild className="w-full" variant="outline" onClick={closeMenu}>
                      <Link to="/admin" className="text-orange-600 hover:text-orange-700">
                        <Settings className="mr-2 h-4 w-4" />
                        Panel de Administración
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="w-full" onClick={closeMenu}>
                    <Link to="/area-cliente">
                      <User className="mr-2 h-4 w-4" />
                      Mi Cuenta
                    </Link>
                  </Button>
                </>
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
  );
};

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16 sm:pt-20">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Layout;
