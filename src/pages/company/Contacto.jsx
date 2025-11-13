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
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary">🚀 Ponte en Contacto con BSB Capital</h1>
          <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">
            Tu camino hacia decisiones financieras más inteligentes empieza con una conversación. Estamos aquí para guiarte.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-brand-primary/10 text-brand-primary p-3 rounded-full">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-brand-text-primary">📧 Email – Respuesta inmediata</h3>
                <p className="text-brand-text-secondary">La forma más rápida de resolver tus dudas o recibir información sobre nuestros servicios.</p>
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
                <h3 className="text-xl font-semibold text-brand-text-primary">🏢 Oficina Principal – Operaciones Globales</h3>
                <p className="text-brand-text-secondary">Nuestro hub estratégico en Dubái, conectando inversiones y oportunidades alrededor del mundo.</p>
                <p className="font-medium text-brand-text-primary">Dubái, Emiratos Árabes Unidos</p>
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
        
        {/* Sección Mensaje Directo */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-text-primary">💬 Mensaje Directo</h2>
            <p className="text-brand-text-secondary mt-2">
              ¿Prefieres escribirnos? Envíanos un mensaje y te responderemos con recomendaciones concretas y soluciones prácticas.
            </p>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const subject = formData.get('subject');
              const message = formData.get('message');
              window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            }}
            className="space-y-6"
          >
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-brand-text-primary mb-2">
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-text-primary mb-2">
                Tu mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Cuéntanos más detalles sobre tu consulta..."
              ></textarea>
            </div>
            
            <div className="text-center">
              <Button type="submit" size="lg">
                Enviar Mensaje <Mail className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default Contacto;