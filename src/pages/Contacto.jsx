import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';

const Contacto = () => {
  const contactEmail = "info@bsbcapital.io";

  return (
    <>
      <Helmet>
        <title>Contacto - BSB Capital</title>
        <meta name="description" content="Ponte en contacto con nuestro equipo para cualquier consulta. Estamos aquí para ayudarte." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary">Ponte en Contacto</h1>
          <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o quieres saber más sobre nuestros servicios? No dudes en contactarnos.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-brand-primary/10 text-brand-primary p-3 rounded-full">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">Email</h3>
                <p className="text-brand-text-secondary">La forma más rápida de obtener una respuesta.</p>
                <a href={`mailto:${contactEmail}`} className="text-brand-primary font-medium hover:underline">
                  {contactEmail}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-brand-primary/10 text-brand-primary p-3 rounded-full">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">Oficina Principal</h3>
                <p className="text-brand-text-secondary">Nuestra sede central para operaciones globales.</p>
                <p className="font-medium text-brand-text-primary">Dubái, Emiratos Árabes Unidos</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-brand-primary/10 text-brand-primary p-3 rounded-full">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">Agenda una Llamada</h3>
                <p className="text-brand-text-secondary">Reserva una consultoría directamente con nuestro equipo.</p>
                <Button asChild variant="link" className="p-0 h-auto text-brand-primary">
                    <a href="/consultoria">Ver servicios de consultoría</a>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <img
              className="rounded-lg shadow-xl object-cover w-full h-full"
              alt="Un moderno espacio de oficina con personas colaborando"
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
            />
          </div>
        </div>
        
        <div className="text-center mt-20">
            <Button size="lg" asChild>
                <a href={`mailto:${contactEmail}`}>
                    Enviar un Mensaje Directo <Mail className="ml-2 h-5 w-5" />
                </a>
            </Button>
        </div>
      </motion.div>
    </>
  );
};

export default Contacto;