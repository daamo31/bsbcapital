import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>404 - Página no encontrada | BSB Capital</title>
        <meta
          name="description"
          content="La página que buscas no existe. Regresa al inicio o explora nuestros servicios."
        />
        <meta property="og:title" content="404 - Página no encontrada" />
        <meta property="og:description" content="La página que buscas no existe en BSB Capital." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-brand-green-100 to-background flex items-center justify-center px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold-600/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-green-600/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-2xl"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[150px] font-bold bg-gradient-to-r from-brand-gold-600 to-brand-gold-700 bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Página No Encontrada
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Lo sentimos, la página que buscas no existe o ha sido movida. Pero no te preocupes,
              estamos aquí para ayudarte.
            </p>
          </motion.div>

          {/* Search Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12 bg-card backdrop-blur border border-border rounded-lg p-6 text-left"
          >
            <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-gold-600" />
              Quizás buscabas:
            </h3>
            <ul className="space-y-2 text-text-secondary">
              <li>
                <Link to="/" className="hover:text-brand-gold-600 transition font-medium">
                  → Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/consultoria-cripto"
                  className="hover:text-brand-gold-600 transition font-medium"
                >
                  → Consultoría Cripto
                </Link>
              </li>
              <li>
                <Link
                  to="/formacion-criptoactivos"
                  className="hover:text-brand-gold-600 transition font-medium"
                >
                  → Formación
                </Link>
              </li>
              <li>
                <Link to="/bsb-maker" className="hover:text-brand-gold-600 transition font-medium">
                  → BSB Maker
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-brand-gold-600 transition font-medium">
                  → Blog
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/">
              <Button
                size="lg"
                className="bg-primary hover:bg-brand-gold-700 text-primary-foreground font-semibold w-full sm:w-auto"
              >
                <Home className="w-5 h-5 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
            <Link to="/contacto">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-brand-green-100 text-foreground w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Contactar Soporte
              </Button>
            </Link>
          </motion.div>

          {/* Additional Help */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-text-secondary text-sm mt-8"
          >
            Si crees que debería existir esta página,{' '}
            <Link
              to="/contacto"
              className="text-brand-gold-600 hover:text-brand-gold-700 font-semibold"
            >
              ponte en contacto con nosotros
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
