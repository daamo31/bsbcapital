import React from 'react';
import { Helmet } from 'react-helmet';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { motion } from 'framer-motion';
import { Linkedin, Search, ShieldCheck, Rocket, BookOpen } from 'lucide-react';

const teamMembers = [
  {
    name: 'Juan Salgado Blanco',
    role: 'Founder & CEO – BSB Capital',
    subtitle: 'Digital Assets Investment Manager · Trader · EFA',
    imageUrl:
      'https://horizons-cdn.hostinger.com/817ad863-5db3-450e-8aa2-198248142884/68bb8eeb7cfe69a6fc0ea78780a5945f.jpg',
    bio: 'Asesor financiero y gestor de inversiones especializado en activos crypto. Inversor desde 2018, ha trabajado con divisas, renta variable, derivados y activos crypto. Es cofundador de CLCRIPTO, la firma fiscal especializada en crypto más grande de España, integrada en el despacho internacional ECIJA durante 2025. Certificado como European Financial Advisor (EFA) y con formación en Blockchain Management.',
    fullBio:
      'Juan Salgado Blanco es asesor financiero y gestor de inversiones especializado en activos crypto. Inversor desde 2018, ha trabajado con divisas, renta variable, derivados y activos crypto, lo que le permite tener una visión completa del mercado y de los riesgos reales que asume un inversor. Es cofundador de CLCRIPTO, la firma fiscal especializada en crypto más grande de España y que fue integrada en el despacho internacional ECIJA durante 2025, donde ha participado en el diseño de soluciones para inversores, empresas y proyectos del entorno crypto. Está certificado como European Financial Advisor (EFA) y cuenta con formación en Blockchain Management, lo que refuerza su capacidad para unir criterio financiero y tecnología. En BSB Capital, Juan dirige la estrategia, define los marcos de análisis y marca la línea metodológica que se aplica tanto en las consultorías como en la academia y en el desarrollo de herramientas como BSB Maker.',
    linkedin: 'https://www.linkedin.com/in/juanbsb/',
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Empresa = () => {
  return (
    <>
      <Helmet>
        <title>BSB Capital | Consultoría y formación en activos digitales.</title>
        <meta
          name="description"
          content="Conoce a la primera firma que combina asesoramiento financiero independiente con especialización crypto y tecnología de vanguardia."
        />
        <link rel="canonical" href="https://bsbcapital.io/empresa" />
        <meta property="og:url" content="https://bsbcapital.io/empresa" />
        <meta
          property="og:title"
          content="Sobre BSB Capital | Profesionalidad en el mundo Crypto"
        />
        <meta
          property="og:description"
          content="Descubre la visión y el equipo detrás de BSB Capital. Asesoramiento con rigor, ética e innovación."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://bsbcapital.io/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Empresa',
                item: 'https://bsbcapital.io/empresa',
              },
            ],
          })}
        </script>
        <meta
          name="keywords"
          content="empresa crypto, equipo bsb capital, consultores blockchain, visión financiera, activos digitales, asesoramiento ético"
        />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        variants={fadeIn}
        className="bg-background text-text-primary"
      >
        {/* Hero Section */}
        <section className="pt-10 md:pt-16 pb-20 md:pb-32 bg-background">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <Breadcrumbs items={[{ label: 'Sobre BSB Capital' }]} />
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-bold text-foreground">
              Sobre BSB Capital
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-text-secondary"
            >
              BSB Capital nace como la primera firma que combina asesoramiento financiero
              independiente con especialización crypto y activos digitales, aportando
              profesionalidad, claridad y seguridad a un sector que durante años ha estado reservado
              a perfiles muy técnicos.
            </motion.p>
          </div>
        </section>

        {/* Propósito Section */}
        <section className="py-16 md:py-24 bg-brand-green-100">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div variants={fadeIn} className="text-center mb-16">
              <p className="text-lg md:text-xl text-text-secondary max-w-4xl mx-auto">
                Nuestro propósito es guiar a inversores y empresas hacia decisiones inteligentes
                mediante un modelo que integra análisis avanzado, tecnología y formación.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
            >
              <motion.div variants={fadeIn}>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                  Nuestra Misión
                </h2>
                <p className="text-lg text-text-secondary">
                  Nuestra misión es corregir los problemas estructurales que han acompañado al
                  sector crypto desde sus inicios: falta de rigor, ausencia de metodología y poca
                  transparencia. Buscamos ofrecer un ecosistema financiero completo que combine
                  asesoramiento profesional, análisis avanzado y formación de calidad para invertir
                  en activos digitales.
                </p>
              </motion.div>
              <motion.div variants={fadeIn}>
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                  Nuestra Visión
                </h2>
                <p className="text-lg text-text-secondary">
                  Aspiramos a que nunca más tengas la sensación de estar solo frente a un mercado
                  que no entiendes. Nuestra visión es ayudarte a integrar los activos digitales en
                  tu patrimonio de forma ordenada, coherente y alineada con tus objetivos personales
                  a la vez que construimos un espacio de formación donde puedas encontrar las
                  herramientas que más se adaptan a ti y la forma de aplicarlas a tus inversiones.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Valores Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Nuestros Valores</h2>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div
                variants={fadeIn}
                className="bg-background p-6 rounded-lg shadow-lg border border-border"
              >
                <Search className="h-10 w-10 text-brand-gold-600 mb-3" />
                <h3 className="text-xl font-bold text-text-primary mb-3">Transparencia</h3>
                <p className="text-text-secondary">
                  Construimos confianza compartiendo conocimiento y eliminando barreras.
                </p>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="bg-background p-6 rounded-lg shadow-lg border border-border"
              >
                <ShieldCheck className="h-10 w-10 text-brand-gold-600 mb-3" />
                <h3 className="text-xl font-bold text-text-primary mb-3">Responsabilidad</h3>
                <p className="text-text-secondary">
                  El mundo crypto exige criterio: actuamos con rigor y ética.
                </p>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="bg-background p-6 rounded-lg shadow-lg border border-border"
              >
                <Rocket className="h-10 w-10 text-brand-gold-600 mb-3" />
                <h3 className="text-xl font-bold text-text-primary mb-3">Innovación</h3>
                <p className="text-text-secondary">
                  Integramos tecnologías de vanguardia para impulsar el futuro financiero.
                </p>
              </motion.div>
              <motion.div
                variants={fadeIn}
                className="bg-background p-6 rounded-lg shadow-lg border border-border"
              >
                <BookOpen className="h-10 w-10 text-brand-gold-600 mb-3" />
                <h3 className="text-xl font-bold text-text-primary mb-3">Educación</h3>
                <p className="text-text-secondary">
                  Creemos que formar es la base para transformar.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Liderazgo Section */}
        <section className="py-16 md:py-24 bg-brand-green-100">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Images Column */}
              <motion.div
                variants={fadeIn}
                className="relative w-full h-auto overflow-hidden rounded-xl shadow-xl"
              >
                <img
                  src="/images/juan-liderazgo.png"
                  alt="Juan Salgado Blanco - Fundador y CEO de BSB Capital, Asesor Financiero Certificado EFA especializado en criptomonedas"
                  className="w-full h-auto block"
                  loading="lazy"
                  width="1024"
                  height="904"
                />
              </motion.div>

              {/* Text Column */}
              <motion.div variants={fadeIn} className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">Liderazgo</h2>
                <p className="text-lg text-text-secondary mb-6">
                  BSB Capital es una firma boutique de asesoramiento financiero dirigida por Juan
                  Salgado Blanco. El modelo es sencillo: un cliente, un profesional. No hay capas
                  intermedias ni estructuras interminables; las decisiones estratégicas, el análisis
                  de mercado y la metodología pasan por la misma persona que trabaja en tu caso.
                </p>
                <p className="text-lg text-text-secondary">
                  Cuando contratas una consultoría, te suscribes a la membresía o entras en la BSB
                  Academy, trabajas directamente con quien diseña la forma de invertir y opera cada
                  día en los mercados.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Equipo Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                Juan Salgado Blanco
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                El líder y fundador detrás de la visión de BSB Capital
              </p>
            </motion.div>

            <motion.div variants={stagger} className="flex justify-center">
              <motion.div
                variants={fadeIn}
                className="bg-background rounded-xl shadow-lg overflow-hidden border border-border max-w-4xl w-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                  {/* Foto y datos básicos */}
                  <div className="text-center lg:text-left">
                    <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-6">
                      <img
                        className="rounded-full w-full h-full object-cover border-4 border-brand-gold-600"
                        src={teamMembers[0].imageUrl}
                        alt={`Foto de ${teamMembers[0].name}`}
                        loading="lazy"
                        width="192"
                        height="192"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary">{teamMembers[0].name}</h3>
                    <p className="text-lg font-semibold text-brand-green-600 mt-2">
                      {teamMembers[0].role}
                    </p>
                    <p className="text-md text-text-secondary mt-1">{teamMembers[0].subtitle}</p>
                    <a
                      href={teamMembers[0].linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-brand-green-600 hover:text-brand-green-900 transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                  </div>

                  {/* Biografía completa */}
                  <div className="lg:col-span-2">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-text-secondary leading-relaxed mb-4">
                        Juan Salgado Blanco es asesor financiero y gestor de inversiones
                        especializado en activos crypto. Inversor desde 2018, ha trabajado con
                        divisas, renta variable, derivados y activos crypto, lo que le permite tener
                        una visión completa del mercado y de los riesgos reales que asume un
                        inversor.
                      </p>

                      <p className="text-text-secondary leading-relaxed mb-4">
                        Es cofundador de <span className="font-semibold">CLCRIPTO</span>, la firma
                        fiscal especializada en crypto más grande de España y que fue integrada en
                        el despacho internacional{' '}
                        <span className="font-semibold">ECIJA durante 2025</span>, donde ha
                        participado en el diseño de soluciones para inversores, empresas y proyectos
                        del entorno crypto.
                      </p>

                      <p className="text-text-secondary leading-relaxed mb-4">
                        Está certificado como{' '}
                        <span className="font-semibold">European Financial Advisor (EFA)</span> y
                        cuenta con formación en Blockchain Management, lo que refuerza su capacidad
                        para unir criterio financiero y tecnología.
                      </p>

                      <p className="text-text-secondary leading-relaxed">
                        En BSB Capital, Juan dirige la estrategia, define los marcos de análisis y
                        marca la línea metodológica que se aplica tanto en las consultorías como en
                        la academia y en el desarrollo de herramientas como BSB Maker. Para
                        proyectos que lo requieren, se apoya en una red de colaboradores
                        especializados en materia fiscal, legal y tecnológica, manteniendo siempre
                        un único criterio de dirección y una visión coherente para el cliente.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-brand-green-100">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto mb-8 font-medium">
                Si quieres llevar tu inversión en crypto al siguiente nivel, nuestros paquetes y
                membresía exclusiva ofrecen acceso a nuestras consultorías, nuestra comunidad
                exclusiva y nuestros análisis avanzados de cartera.
              </p>
              <div className="flex justify-center">
                <a
                  href="/paquetes-cripto"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-brand-gold-600 rounded-lg hover:bg-brand-gold-700 hover:shadow-lg hover:-translate-y-1"
                >
                  Descubre los paquetes y la membresía exclusiva
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Empresa;
