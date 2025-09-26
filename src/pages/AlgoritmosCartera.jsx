import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const PlaceholderPage = ({ title, description }) => {
  const { toast } = useToast();
  const handleUnimplemented = () => {
    toast({
      title: "🚧 ¡Función no implementada!",
      description: "Esta función aún no está disponible, ¡pero puedes solicitarla en tu próximo mensaje! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>{title} - BSB Capital</title>
        <meta name="description" content={description} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-4xl font-bold text-bsb-green">{title}</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        <div className="mt-8">
          <img  class="mx-auto rounded-lg shadow-xl" alt="Contenido de la página en construcción" src="https://images.unsplash.com/photo-1674027001838-09e049c47212" />
        </div>
        <Button onClick={handleUnimplemented} className="mt-8 bg-bsb-gold text-white hover:bg-bsb-gold/90">
          Solicitar más información
        </Button>
      </motion.div>
    </>
  );
};

const AlgoritmosCartera = () => (
  <PlaceholderPage
    title="Algoritmos & Cartera"
    description="Optimización de carteras y algoritmos de trading avanzados. Estamos preparando el contenido de esta sección."
  />
);

export default AlgoritmosCartera;