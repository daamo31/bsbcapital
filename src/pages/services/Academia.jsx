import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Film,
  ShieldCheck,
  Video,
  Download,
  Mail,
  GraduationCap,
  Smartphone,
  Award,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/data-display/accordion';
import CheckoutModal from '@/components/consultations/CheckoutModal';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

/**
 * Academia Page (BSB Academy)
 *
 * Public-facing landing page for the BSB Academy.
 * It provides a summary of features, method, and pricing.
 * Includes a CheckoutModal for purchasing access.
 */
const Academia = () => {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Use custom hook to check for admin status
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  /** @type {React.RefObject<HTMLVideoElement>} Ref for the hero masterclass video. */
  const videoRef = React.useRef(null);

  /**
   * Intersection Observer to auto-play/pause the masterclass video when it becomes visible.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play only if visible more than 50%
          videoRef.current?.play().catch((error) => console.log('Autoplay prevented:', error));
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );

    const currentVideo = videoRef.current;
    if (currentVideo) {
      observer.observe(currentVideo);
    }

    return () => {
      if (currentVideo) {
        observer.unobserve(currentVideo);
      }
    };
  }, []);

  /**
   * ADMIN BRIDGE:
   * If an admin enters this landing page, they are redirected automatically
   * to the internal content catalog, as they already have permission.
   */
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/academia');
    }
  }, [isAdmin, loading, navigate]);

  /**
   * Specialized button component that changes behavior for Admins.
   */
  const ComprarCursoButton = ({ children, ...props }) => {
    if (isAdmin) {
      return (
        <Button size="lg" onClick={() => navigate('/academia')} {...props}>
          Ir a Academia (Admin) <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      );
    }

    return (
      <Button size="lg" onClick={() => setIsCheckoutModalOpen(true)} {...props}>
        {children} <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    );
  };

  const features = [
    {
      icon: <Video className="h-10 w-10 text-primary mb-4" />,
      title: 'Masterclass profesionales',
      description:
        'Lecciones de 20 minutos, diseñadas para mantener tu atención y ayudarte a avanzar con agilidad. Un formato directo y dinámico que facilita el aprendizaje incluso en los temas más complejos del entorno crypto.',
    },
    {
      icon: <Film className="h-10 w-10 text-primary mb-4" />,
      title: 'Píldoras de conocimiento',
      description:
        'Pequeños vídeos que forman un glosario esencial de términos financieros y crypto. Ideales para entender los conceptos básicos y familiarizarte con el lenguaje del mundo crypto de forma rápida y sencilla.',
    },
    {
      icon: <Download className="h-10 w-10 text-primary mb-4" />,
      title: 'Material descargable',
      description:
        'PDFs, plantillas y hojas de trabajo que complementan cada lección y te ayudan a aplicar lo aprendido en tu propia gestión.',
    },
    {
      icon: <Mail className="h-10 w-10 text-primary mb-4" />,
      title: 'Comunidad privada',
      description:
        'Accederás a nuestros análisis del mercado, en qué estamos invirtiendo en tiempo real y podrás contar con nosotros para resolver tus dudas y validar tus decisiones de inversión.',
    },
  ];

  const methodPoints = [
    {
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      title: 'Aplicación práctica y progresiva',
      description:
        'Combina teoría y práctica con ejemplos reales, análisis y estrategias aplicables desde el primer día.',
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: 'A tu ritmo',
      description: 'Desde cualquier dispositivo y en el momento que elijas.',
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: 'Experiencia y certificación',
      description:
        'Desarrollado por profesionales certificados con amplia experiencia en el sector.',
    },
  ];

  const faqs = [
    {
      question: '¿Cómo funciona la Academia?',
      answer:
        'Con una sola suscripción accedes a todos los cursos, píldoras y materiales descargables. Sin límites y con acceso a las nuevas incorporaciones. Al completar tu compra recibirás acceso inmediato a la plataforma de aprendizaje.',
    },
    {
      question: '¿Recibiré nuevos contenidos con el tiempo?',
      answer:
        'Absolutamente. La Academia se actualiza constantemente con vídeos y materiales para que tu aprendizaje evolucione al ritmo del mercado crypto.',
    },
    {
      question: '¿Puedo acceder desde cualquier lugar?',
      answer:
        'Sí. Solo necesitas conexión a internet: podrás seguir las clases desde tu ordenador, tablet o móvil.',
    },
    {
      question: '¿Incluye soporte?',
      answer:
        'Sí. Ofrecemos soporte por email para resolver dudas sobre los contenidos o el funcionamiento de la plataforma. Escríbenos a info@bsbcapital.io y te ayudaremos.',
    },
    {
      question: '¿Hay garantía de devolución?',
      answer:
        'Sí. Si la Academia no cumple tus expectativas, podrás solicitar la devolución durante el período de garantía. Queremos que aprendas con confianza.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>BSB Academy | Formación en Activos Digitales</title>
        <meta
          name="description"
          content="La plataforma educativa de BSB Capital, especializada en formación en activos digitales, para que aprendas a invertir con confianza y maximices el potencial de tu cartera."
        />
        <link rel="canonical" href="https://bsbcapital.io/formacion-criptoactivos" />
        <meta property="og:url" content="https://bsbcapital.io/formacion-criptoactivos" />
        <meta property="og:title" content="BSB Academy | Formación en Activos Digitales" />
        <meta
          property="og:description"
          content="Aprende a invertir en criptoactivos con seguridad y criterio. Formación profesional para maximizar tu impacto en el mercado."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
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
                    name: 'Formación Criptoactivos',
                    item: 'https://bsbcapital.io/formacion-criptoactivos',
                  },
                ],
              },
              {
                '@type': 'Course',
                name: 'BSB Academy',
                description:
                  'Formación profesional en activos digitales para aprender a invertir con confianza.',
                provider: {
                  '@type': 'Organization',
                  name: 'BSB Capital',
                  sameAs: 'https://bsbcapital.io',
                },
                offers: {
                  '@type': 'Offer',
                  category: 'Subscription',
                },
              },
            ],
          })}
        </script>
        <meta
          name="keywords"
          content="curso criptomonedas, formación blockchain, academia de inversión, aprender bitcoin, educación financiera, trading, análisis técnico"
        />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Hero Section */}
        <motion.section
          variants={itemVariants}
          className="bg-background text-center pt-8 pb-12 sm:pt-12 sm:pb-20 md:pt-16 md:pb-32"
        >
          <div className="container mx-auto px-4 sm:px-6">
            <Breadcrumbs items={[{ label: 'BSB Academy' }]} />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              BSB Academy
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-brand-text-secondary leading-relaxed">
              La plataforma educativa de BSB Capital, especializada en formación en activos
              digitales, para que aprendas a invertir con confianza y maximices el potencial de tu
              cartera.
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-brand-text-secondary leading-relaxed">
              La experiencia práctica es la base del aprendizaje en crypto. En la BSB Academy te
              guiamos para que aprendas evitando los errores más comunes y reduciendo riesgos desde
              el primer día.
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-brand-text-secondary font-medium">
              Aprende de forma continua, a tu ritmo, y con contenidos siempre actualizados.
            </p>
            <div className="mt-10">
              <ComprarCursoButton>Explora hoy la BSB Academy</ComprarCursoButton>
            </div>
          </div>
        </motion.section>

        {/* What includes Section */}
        <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-100">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Qué incluye la Academia?</h2>
              <p className="text-lg text-muted-foreground mb-4">
                En la plataforma encontrarás diferentes módulos que te guiarán desde los fundamentos
                —comprender el mundo crypto y sus dinámicas— hasta la implementación de estrategias
                de nivel profesional.
              </p>
              <p className="text-lg text-muted-foreground">
                Además, la Academia está viva: encontrarás actualizaciones continuas de nuevas
                narrativas, análisis de proyectos y técnicas de valoración para que tu aprendizaje
                evolucione al ritmo del mercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                >
                  {feature.icon}
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Method Section */}
        <motion.section variants={itemVariants} className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto mb-8 md:mb-16 rounded-xl overflow-hidden shadow-2xl">
              <video ref={videoRef} controls muted playsInline loop className="w-full h-auto">
                <source src="/videos/video1.mp4" type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Aprende con un método pensado para ti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {methodPoints.map((point, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                    {point.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQs Section */}
        <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-100">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Preguntas Frecuentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index + 1}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.section>

        {/* Guarantee Section */}
        <motion.section variants={itemVariants} className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <ShieldCheck className="h-16 w-16 mx-auto text-brand-gold mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Garantía de satisfacción BSB Capital
            </h2>
            <div className="space-y-4 text-lg text-brand-green-900/80">
              <p className="font-semibold">Tu aprendizaje está protegido.</p>
              <p>
                Tienes 7 días desde tu compra para explorar libremente la Academia y decidir si es
                lo que esperabas.
              </p>
              <p>
                Si durante ese tiempo sientes que no es para ti, solo tienes que escribirnos a
                info@bsbcapital.io y te haremos el reembolso completo.
              </p>
              <p>
                Gestionamos todo directamente desde BSB Capital — sin intermediarios, sin
                formularios y sin letra pequeña.
              </p>
            </div>
            <div className="mt-10">
              <ComprarCursoButton>Unirme ahora a la BSB Academy</ComprarCursoButton>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section variants={itemVariants} className="py-16 bg-brand-green-100">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">
              Cada inversor tiene su propio punto de partida.
            </h3>
            <p className="text-muted-foreground text-lg">
              Si necesitas orientación o tienes preguntas, escríbenos a{' '}
              <a
                href="mailto:info@bsbcapital.io"
                className="text-primary font-semibold hover:underline"
              >
                info@bsbcapital.io
              </a>
              . Estamos aquí para acompañarte en el proceso.
            </p>
          </div>
        </motion.section>
      </motion.div>

      {/* Modal de Checkout */}
      <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} />
    </>
  );
};

export default Academia;
