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
        <h1 className="text-4xl font-bold text-brand-text-primary">{title}</h1>
        <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">{description}</p>
        <div className="mt-8">
          <img className="mx-auto rounded-lg shadow-xl" alt="Contenido de la página en construcción" src="https://images.unsplash.com/photo-1504983875-d3b163aba9e6" />
        </div>
        <Button onClick={handleUnimplemented} className="mt-8">
          Leer artículos
        </Button>
      </motion.div>
    </>
  );
};

const Blog = () => (
  <PlaceholderPage
    title="Blog y Recursos"
    description="Análisis de mercado, guías de inversión y las últimas noticias del sector. Nuestro blog está en camino."
  />
);

export default Blog;