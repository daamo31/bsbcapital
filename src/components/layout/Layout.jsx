import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, Loader2, LogIn, User, Settings } from 'lucide-react';
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

    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({ email: email });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({ variant: "destructive", title: "Ya estás suscrito", description: "Este correo electrónico ya está en nuestra lista." });
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img alt="Logotipo de BSB Capital" className="h-13 w-auto" src="/images/black_logo-Photoroom.png" />
              <span className="font-bold text-xl text-white">BSB Capital</span>
            </Link>
            <p className="mt-4 text-sm text-brand-green-100/70">
              La primera firma que combina asesoramiento financiero independiente con especialización profunda en criptoactivos.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:col-span-2">
            <div>
              <p className="font-semibold text-white">Servicios</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/bsb-maker" className="text-brand-green-100/70 hover:text-white transition-colors">BSB Maker</Link></li>
                <li><Link to="/consultoria" className="text-brand-green-100/70 hover:text-white transition-colors">Consultoría</Link></li>
                <li><Link to="/formacion" className="text-brand-green-100/70 hover:text-white transition-colors">Formación</Link></li>
                <li><Link to="/membresias" className="text-brand-green-100/70 hover:text-white transition-colors">Planes</Link></li>
                <li><Link to="/algo-fund" className="text-brand-green-100/70 hover:text-white transition-colors">Algo Fund</Link></li>
                <li><Link to="/otros-servicios" className="text-brand-green-100/70 hover:text-white transition-colors">Otros Servicios</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Empresa</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/empresa" className="text-brand-green-100/70 hover:text-white transition-colors">Sobre Nosotros</Link></li>
                <li><Link to="/blog" className="text-brand-green-100/70 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contacto" className="text-brand-green-100/70 hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="font-semibold text-white">Suscríbete a Free Access</p>
              <p className="mt-2 text-sm text-brand-green-100/70">Newsletter gratuita con análisis y reflexiones financieras para empezar a conocernos.</p>
              <form onSubmit={handleSubscription} className="mt-4 flex gap-2">
                <Input
                  type="email"
                  placeholder="Tu email"
                  className="bg-brand-green-900 border-brand-green-600 text-white placeholder:text-brand-green-100/50 flex-grow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" variant="default" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-brand-green-600 pt-8 flex flex-col items-center text-sm text-center">
          <p className="text-brand-green-100/50">&copy; {new Date().getFullYear()} BSB Capital. Todos los derechos reservados.</p>
          <p className="text-brand-green-100/50 mt-1">Oficina en Dubái. Asesores financieros acreditados en España.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            <Link to="/legal/aviso-legal" className="text-brand-green-100/50 hover:text-white transition-colors">Aviso Legal</Link>
            <Link to="/legal/privacidad" className="text-brand-green-100/50 hover:text-white transition-colors">Política de Privacidad</Link>
            <Link to="/legal/cookies" className="text-brand-green-100/50 hover:text-white transition-colors">Política de Cookies</Link>
            <Link to="/legal/terminos-de-uso" className="text-brand-green-100/50 hover:text-white transition-colors">Términos de Uso</Link>
            <Link to="/legal/condiciones-generales" className="text-brand-green-100/50 hover:text-white transition-colors">Condiciones Generales</Link>
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
    { name: 'Inicio', href: '/' },
    { name: 'BSB Maker', href: '/bsb-maker' },
    { name: 'Consultoría', href: '/consultoria' },
    { name: 'Formación', href: '/formacion' },
    { name: 'Planes', href: '/membresias' },
    { name: 'Otros Servicios', href: '/otros-servicios' },
    { name: 'Empresa', href: '/empresa' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img alt="Logotipo de BSB Capital" className="h-13 w-auto" src="/images/black_logo-Photoroom.png" />
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className="text-base lg:text-lg font-semibold text-text-secondary hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-4">
          <Button asChild variant="outline" className="border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white">
            <Link to="/contacto">Contactar</Link>
          </Button>
          {user ? (
            <>
              {isAdmin && <AdminDropdown />}
              <Button asChild>
                <Link to="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  Mi Cuenta
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg border-t">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} onClick={closeMenu} className="text-base sm:text-lg font-semibold text-text-secondary hover:text-primary transition-colors py-2">
                {link.name}
              </Link>
            ))}
            <div className="border-t pt-6 mt-4 flex flex-col gap-4">
              <Button asChild className="w-full border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white" variant="outline" onClick={closeMenu}>
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
                    <Link to="/dashboard">
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
      <main className="flex-grow pt-16 sm:pt-20">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Layout;