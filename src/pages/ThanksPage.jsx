import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, Mail } from 'lucide-react';

const ThanksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('¡Gracias!');
  const [pageMessage, setPageMessage] = useState('');
  const [pageType, setPageType] = useState('general');

  useEffect(() => {
    const type = searchParams.get('type') || 'general';
    const title = searchParams.get('title');
    const message = searchParams.get('message');

    setPageType(type);

    // Configuraciones por tipo
    const configurations = {
      consultation: {
        title: '¡Consultoría Agendada!',
        message:
          'Tu consultoría ha sido confirmada. Recibirás un email con los detalles y enlace de videollamada próximamente.',
      },
      membership: {
        title: '¡Bienvenido a BSB Capital!',
        message:
          'Tu membresía ha sido activada correctamente. Ahora tienes acceso a todos nuestros servicios premium.',
      },
      contact: {
        title: '¡Mensaje Enviado!',
        message: 'Hemos recibido tu mensaje. Nos pondremos en contacto en breve.',
      },
      academy: {
        title: '¡Acceso Concedido!',
        message: 'Ahora tienes acceso a todos los cursos de BSB Academy. Comienza tu formación.',
      },
      payment: {
        title: '¡Pago Procesado!',
        message: 'Tu pago ha sido procesado exitosamente. Recibirás confirmación por email.',
      },
      general: {
        title: '¡Éxito!',
        message: 'Tu solicitud ha sido procesada correctamente. Gracias por tu confianza.',
      },
    };

    const config = configurations[type] || configurations.general;
    setPageTitle(title || config.title);
    setPageMessage(message || config.message);
  }, [searchParams]);

  const getNextSteps = () => {
    switch (pageType) {
      case 'consultation':
        return [
          'Revisa tu email para confirmar la cita',
          'Prepara tus preguntas y documentos',
          'Únete 5 minutos antes de la hora agendada',
          'Accede desde tu dashboard',
        ];
      case 'membership':
        return [
          'Ve a tu dashboard para acceder a contenidos',
          'Explora los cursos disponibles en BSB Academy',
          'Descarga los recursos de inversión',
          'Contacta al equipo si tienes dudas',
        ];
      case 'academy':
        return [
          'Accede a tus cursos en BSB Academy',
          'Comienza con el módulo introductorio',
          'Sigue tu progreso en el dashboard',
          'Participa en la comunidad',
        ];
      case 'contact':
        return [
          'Esperamos tu respuesta en breve',
          'Revisaremos tu solicitud en 24 horas',
          'Recibirás un email de confirmación',
          'Síguenos en redes sociales',
        ];
      default:
        return [
          'Revisa tu email para detalles',
          'Accede a tu dashboard',
          'Contacta soporte si necesitas ayuda',
          'Explora más servicios',
        ];
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (pageType === 'consultation' || pageType === 'membership' || pageType === 'academy') {
      buttons.push({
        label: 'Ir a Mi Dashboard',
        to: '/dashboard',
        primary: true,
      });
    }

    buttons.push({
      label: 'Volver al Inicio',
      to: '/',
      primary: false,
    });

    return buttons;
  };

  const actionButtons = getActionButtons();
  const nextSteps = getNextSteps();

  return (
    <>
      <Helmet>
        <title>{pageTitle} | BSB Capital</title>
        <meta name="description" content={pageMessage} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageMessage} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-brand-green-100 to-background flex items-center justify-center px-4 py-12">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold-600/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-0 w-72 h-72 bg-brand-green-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl w-full"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-brand-gold-600 to-brand-gold-700 rounded-full blur-xl"
              ></motion.div>
              <CheckCircle className="w-24 h-24 text-secondary relative bg-background rounded-full p-2" />
            </div>
          </motion.div>

          {/* Title and Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{pageTitle}</h1>
            <p className="text-xl text-text-secondary mb-2">{pageMessage}</p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-card backdrop-blur border border-border rounded-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Próximos Pasos:</h2>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 text-text-secondary"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            {actionButtons.map((btn, index) => (
              <Button
                key={index}
                onClick={() => navigate(btn.to)}
                className={
                  btn.primary
                    ? 'bg-primary hover:bg-brand-gold-700 text-primary-foreground font-semibold'
                    : 'border-border hover:bg-brand-green-100 text-foreground'
                }
                variant={btn.primary ? 'default' : 'outline'}
                size="lg"
              >
                {btn.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ))}
          </motion.div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="border-t border-border pt-8 mt-8"
          >
            <p className="text-text-secondary text-center mb-6">¿Necesitas ayuda adicional?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-border hover:bg-brand-green-100 text-foreground"
                onClick={() => navigate('/contacto')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-brand-green-100 text-foreground"
                onClick={() => navigate('/blog')}
              >
                Ver Blog y Recursos
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default ThanksPage;
