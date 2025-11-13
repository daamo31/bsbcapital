import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

const teamMembers = [
  {
    name: 'Juan Salgado Blanco',
    role: 'Co-Founder & CEO',
    imageUrl: 'https://horizons-cdn.hostinger.com/817ad863-5db3-450e-8aa2-198248142884/68bb8eeb7cfe69a6fc0ea78780a5945f.jpg',
    bio: 'Experto en criptoactivos y mercados financieros, Juan lidera la visión y estrategia de BSB Capital. Su enfoque se centra en la innovación y la aplicación de tecnologías de vanguardia para la gestión de activos.',
    linkedin: 'https://www.linkedin.com/in/juan-salgado-blanco-63a23417a/',
  },
  
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Empresa = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={fadeIn}
      className="bg-background text-text-primary"
    >
      {/* Hero Section */}
      <section className="py-20 md:py-32 aurora-background">
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold main-gradient-text">
            Innovación y Experiencia en Finanzas
          </motion.h1>
          <motion.p variants={fadeIn} className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-text-secondary">
            En BSB Capital, fusionamos la experiencia humana con la inteligencia artificial para redefinir el futuro de la inversión y la gestión de activos.
          </motion.p>
        </div>
      </section>

      {/* Misión y Visión Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Nuestra Misión</h2>
              <p className="mt-4 text-lg text-text-secondary">
                Democratizar el acceso a herramientas financieras sofisticadas, permitiendo a nuestros clientes tomar decisiones de inversión más inteligentes y seguras. Nos comprometemos a ofrecer transparencia, innovación y resultados.
              </p>
            </motion.div>
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Nuestra Visión</h2>
              <p className="mt-4 text-lg text-text-secondary">
                Ser líderes en la revolución FinTech, creando un ecosistema donde la tecnología y las finanzas convergen para generar un valor sin precedentes para inversores de todos los niveles, desde principiantes hasta institucionales.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Equipo Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Conoce a Nuestro Equipo</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
              Un equipo de visionarios, estrategas y expertos dedicados a construir el futuro de las finanzas.
            </p>
          </motion.div>
          <motion.div variants={stagger} className="flex justify-center flex-wrap gap-8">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeIn}
                className="bg-background rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 border border-border max-w-sm w-full"
              >
                <div className="p-8 text-center">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <img
                      className="rounded-full w-full h-full object-cover border-4 border-brand-gold-600"
                      src={member.imageUrl}
                      alt={`Foto de ${member.name}`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary">{member.name}</h3>
                  <p className="text-md font-semibold text-brand-green-600">{member.role}</p>
                  <p className="mt-4 text-sm text-text-secondary h-24">{member.bio}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 text-brand-green-600 hover:text-brand-green-900 transition-colors"
                  >
                    <Linkedin size={24} />
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Empresa;