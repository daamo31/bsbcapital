import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, BrainCircuit, ShieldCheck, Check } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-primary/20">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </div>
);

const AlgoFund = () => {
  const darwinexLink = "https://www.darwinex.com/invest/WFH?utm_source=sharelanding&utm_medium=referral&utm_campaign=shareownlanding&utm_content=marcoswolf";

  return (
    <>
      <Helmet>
        <title>BSB Algo Fund (WFH) - Inversión Algorítmica Inteligente</title>
        <meta name="description" content="Invierte en el BSB Algo Fund (WFH), nuestra estrategia de inversión sistemática y automatizada en Darwinex. Potencia tu capital con tecnología y análisis cuantitativo." />
        <meta property="og:title" content="BSB Algo Fund (WFH) - Inversión Algorítmica Inteligente" />
        <meta property="og:description" content="Invierte en el BSB Algo Fund (WFH), nuestra estrategia de inversión sistemática y automatizada en Darwinex. Potencia tu capital con tecnología y análisis cuantitativo." />
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto px-4 py-24 md:py-32 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                BSB Algo Fund: <span className="accent-gradient-text">Tu Capital, Potenciado.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                Presentamos <span className="font-bold text-foreground">WFH</span>, nuestra estrategia de inversión sistemática y automatizada, ahora pública en la plataforma Darwinex. Invierte con inteligencia, delega la gestión.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-primary/30 shadow-lg">
                  <a href={darwinexLink} target="_blank" rel="noopener noreferrer">
                    Quiero Invertir Ahora <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="py-24 bg-background/70 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">La Fusión de Tecnología y Finanzas</h2>
              <p className="mt-4 text-text-secondary">
                El BSB Algo Fund (ticker: WFH) no es solo un fondo, es la materialización de nuestra filosofía: utilizar la tecnología más avanzada para tomar decisiones de inversión objetivas y sistemáticas, eliminando el sesgo emocional y buscando la consistencia a largo plazo.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap size={24} />}
                title="Operativa 100% Automatizada"
                description="Nuestros algoritmos analizan el mercado y ejecutan operaciones 24/7, sin intervención humana, asegurando disciplina y rapidez."
              />
              <FeatureCard
                icon={<BrainCircuit size={24} />}
                title="Estrategia Cuantitativa"
                description="Basado en modelos matemáticos y estadísticos probados para identificar oportunidades de mercado con una ventaja probabilística."
              />
              <FeatureCard
                icon={<ShieldCheck size={24} />}
                title="Gestión de Riesgo Integrada"
                description="Cada operación tiene un riesgo predefinido y controlado. La protección del capital es nuestra máxima prioridad."
              />
            </div>
          </div>
        </div>

        <div className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img  className="rounded-lg shadow-2xl" alt="Gráfico de rendimiento financiero ascendente con líneas de datos" src="https://images.unsplash.com/photo-1634097537825-b446635b2f7f" />
              </div>
              <div className="max-w-lg">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">¿Por qué invertir en el Algo Fund?</h2>
                <p className="mt-4 text-text-secondary">
                  Delega la complejidad del trading en un sistema probado y transparente. Es la solución ideal para quienes buscan diversificar su cartera y obtener exposición a estrategias algorítmicas sin necesidad de ser un experto.
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Rentabilidad Pasiva</h4>
                      <p className="text-text-secondary">Tu capital trabaja para ti, gestionado por algoritmos diseñados para buscar el crecimiento de forma consistente.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Transparencia y Seguridad</h4>
                      <p className="text-text-secondary">Opera a través de Darwinex, una plataforma regulada que garantiza la seguridad de tus fondos y total transparencia en las operaciones.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground">Descorrelación</h4>
                      <p className="text-text-secondary">Añade a tu cartera un activo que opera con una lógica diferente a los mercados tradicionales, mejorando tu diversificación.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand-green-900 text-white">
          <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">¿Listo para Potenciar tu Inversión?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-brand-green-100/80">
              Únete a la nueva era de la inversión. Abre tu cuenta en Darwinex y empieza a invertir en el BSB Algo Fund (WFH) hoy mismo.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" variant="secondary">
                <a href={darwinexLink} target="_blank" rel="noopener noreferrer">
                  Ver Estadísticas e Invertir <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AlgoFund;