import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Shield, BarChart, Megaphone } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [advertisingCookies, setAdvertisingCookies] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('bsb_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const settings = JSON.parse(consent);
      setAnalyticsCookies(settings.analytics);
      setAdvertisingCookies(settings.advertising);
    }
  }, []);

  const handleSavePreferences = (settings) => {
    localStorage.setItem('bsb_cookie_consent', JSON.stringify(settings));
    setShowBanner(false);
    setShowSettings(false);
    // Aquí podrías inicializar los scripts de tracking basados en la configuración
  };

  const acceptAll = () => {
    handleSavePreferences({ necessary: true, analytics: true, advertising: true });
  };

  const rejectAll = () => {
    handleSavePreferences({ necessary: true, analytics: false, advertising: false });
  };

  const openSettings = () => {
    setShowBanner(false);
    setShowSettings(true);
  };

  const saveCustomSettings = () => {
    handleSavePreferences({ necessary: true, analytics: analyticsCookies, advertising: advertisingCookies });
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4"
          >
            <div className="container mx-auto">
              <div className="bg-card p-6 rounded-lg shadow-2xl border flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-muted-foreground flex-grow">
                  <p>En BSB Capital utilizamos cookies propias y de terceros para mejorar la experiencia de usuario y analizar el tráfico. Puede aceptar todas las cookies, rechazarlas o configurar sus preferencias. <Link to="/legal/cookies" className="text-primary hover:underline">Política de Cookies</Link>.</p>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button onClick={acceptAll} className="w-full sm:w-auto">Aceptar todas</Button>
                  <Button onClick={rejectAll} variant="secondary" className="w-full sm:w-auto">Rechazar todas</Button>
                  <Button onClick={openSettings} variant="outline" className="w-full sm:w-auto">Configurar</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configuración de Cookies</DialogTitle>
            <DialogDescription>
              Gestiona tus preferencias de cookies. Puedes cambiar esta configuración en cualquier momento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <div className="flex items-start gap-4">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <Label htmlFor="necessary-cookies" className="font-bold">Cookies Necesarias</Label>
                  <p className="text-sm text-muted-foreground">Esenciales para el funcionamiento del sitio. No se pueden desactivar.</p>
                </div>
              </div>
              <Switch id="necessary-cookies" checked disabled />
            </div>
            <div className="flex items-center justify-between p-4 rounded-md border">
              <div className="flex items-start gap-4">
                <BarChart className="h-5 w-5 text-primary mt-1" />
                <div>
                  <Label htmlFor="analytics-cookies" className="font-bold">Cookies de Análisis</Label>
                  <p className="text-sm text-muted-foreground">Nos ayudan a entender cómo interactúas con la web.</p>
                </div>
              </div>
              <Switch id="analytics-cookies" checked={analyticsCookies} onCheckedChange={setAnalyticsCookies} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-md border">
              <div className="flex items-start gap-4">
                <Megaphone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <Label htmlFor="advertising-cookies" className="font-bold">Cookies de Publicidad</Label>
                  <p className="text-sm text-muted-foreground">Permiten mostrarte anuncios más relevantes para ti.</p>
                </div>
              </div>
              <Switch id="advertising-cookies" checked={advertisingCookies} onCheckedChange={setAdvertisingCookies} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveCustomSettings} className="w-full">Guardar Preferencias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;