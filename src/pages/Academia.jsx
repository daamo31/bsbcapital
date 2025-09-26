import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, Star, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const Academia = () => {
  return (
    <>
      <Helmet>
        <title>Academia - BSB Capital</title>
        <meta name="description" content="Únete a nuestras comunidades, accede a cursos y masterclasses exclusivas para llevar tu formación al siguiente nivel." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="aurora-background"
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-center"
            >
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold">Academia BSB</motion.h1>
                <motion.p variants={itemVariants} className="mt-4 text-lg text-brand-text-secondary max-w-3xl mx-auto">
                    Tu centro de conocimiento para dominar los mercados. Conecta, aprende y accede a contenido exclusivo para tomar decisiones más inteligentes.
                </motion.p>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
                <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl flex flex-col items-center text-center">
                    <div className="bg-brand-accent/20 p-4 rounded-full">
                        <BookOpen className="h-10 w-10 text-brand-accent" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold">Cursos y Masterclass</h2>
                    <p className="mt-4 text-brand-text-secondary flex-grow">
                        Accede a contenido exclusivo de BSB Capital. Cursos temáticos y masterclasses diseñadas por expertos para profundizar en estrategias de inversión y trading.
                    </p>
                    <p className="mt-4 text-sm font-semibold text-brand-primary">Acceso con Trader Plan Pro y Premium Investor</p>
                    <Button asChild className="mt-6" size="lg">
                      <Link to="/membresias">Ver Membresías <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl flex flex-col items-center text-center">
                    <div className="bg-brand-accent/20 p-4 rounded-full">
                        <Users className="h-10 w-10 text-brand-accent" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold">Comunidad BSB</h2>
                    <p className="mt-4 text-brand-text-secondary flex-grow">
                        Un espacio exclusivo para inversores. Conecta con otros miembros, comparte ideas y accede a debates y análisis en tiempo real para crecer juntos.
                    </p>
                    <p className="mt-4 text-sm font-semibold text-brand-primary">Acceso con Premium Investor</p>
                    <Button asChild className="mt-6" size="lg">
                      <Link to="/membresias">Ver Membresías <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-8 rounded-xl flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
                    <div className="bg-brand-accent/20 p-4 rounded-full">
                        <Star className="h-10 w-10 text-brand-accent" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold">Comunidad Élite BSB</h2>
                    <p className="mt-4 text-brand-text-secondary flex-grow">
                        El círculo más exclusivo. Networking de alto nivel, análisis avanzados y un canal privado prioritario para miembros con un enfoque patrimonial.
                    </p>
                    <p className="mt-4 text-sm font-semibold text-brand-primary">Acceso con Wealth Membership</p>
                    <Button asChild className="mt-6" size="lg">
                      <Link to="/membresias">Ver Membresías <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Academia;