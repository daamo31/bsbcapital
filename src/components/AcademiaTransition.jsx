import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AcademiaTransition = () => {
  useEffect(() => {
    // Redirigir automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      window.location.href = 'https://go.hotmart.com/D102065526G?dp=';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDirectAccess = () => {
    window.location.href = 'https://go.hotmart.com/D102065526G?dp=';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 to-brand-green-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md mx-4"
      >
        {/* Logo/Branding */}
        <div className="mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader2 className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
        </div>

        {/* Mensaje de bienvenida */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-brand-text-primary mb-3">
            Bienvenido a la Academia BSB Capital
          </h1>
          <p className="text-brand-text-secondary mb-6">
            Te estamos redirigiendo a tu área de formación...
          </p>
        </motion.div>

        {/* Botón de acceso directo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            onClick={handleDirectAccess}
            variant="outline"
            className="mb-4"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acceder ahora
          </Button>
          <p className="text-sm text-muted-foreground">
            O espera unos segundos para acceso automático
          </p>
        </motion.div>

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-6 pt-6 border-t text-xs text-muted-foreground"
        >
          <p>
            💡 Guarda esta página en marcadores para acceso rápido
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AcademiaTransition;