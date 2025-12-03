import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Briefcase, BookOpen, Mail, Star, LogIn, User, Settings, Shield } from 'lucide-react';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { useToast } from "@/components/ui/feedback/use-toast";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/hooks/useAdmin';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
    },
  },
};

const ServiceCard = ({ icon, title, description, href, details, buttonText = "Saber más" }) => (
  <motion.div
    variants={itemVariants}
    className="bg-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col group h-full backdrop-blur-sm"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <div className="flex-shrink-0 text-brand-accent">{React.cloneElement(icon, { className: "h-8 w-8 sm:h-10 sm:w-10" })}</div>
    <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-brand-text-primary">{title}</h3>
    <p className="mt-3 text-brand-text-secondary flex-grow">{description}</p>
    {details && (
      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
        <h4 className="font-semibold text-brand-text-primary mb-2">Además, con nuestra membresía exclusiva tendrás acceso a:</h4>
        <div className="text-sm text-brand-text-secondary whitespace-pre-line">
          {details}
        </div>
      </div>
    )}
    <Button asChild variant="link" className="mt-6 p-0 text-brand-accent hover:text-brand-accent/80 self-start font-medium">
      <Link to={href}>
        {buttonText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  </motion.div>
);

const services = [
  {
    icon: <Briefcase />,
    title: 'BSB Consulting: Consultoría especializada en crypto',
    description: 'Asesoramiento profesional diseñado para el nuevo entorno financiero. Te ayudamos a gestionar, optimizar y estructurar tu cartera, construir estrategias sostenibles y reducir riesgos en tus operaciones con activos crypto.',
    href: '/consultoria',
  },
  {
    icon: <BookOpen />,
    title: 'BSB Academy: Formación especializada en crypto y activos digitales',
    description: 'Aprende a invertir con autonomía y criterio. Nuestra formación combina píldoras rápidas, masterclasses especializadas y contenido actualizado para que desarrolles una mentalidad financiera sólida y entiendas realmente cómo funciona el ecosistema crypto.',
    href: '/formacion',
    buttonText: 'Accede a la Academia'
  },
  {
    icon: <Bot />,
    title: 'BSB Maker: Tu Asistente de Inversión con IA',
    description: 'Lleva tus decisiones al siguiente nivel con nuestra herramienta de Inteligencia Artificial diseñada para inversores crypto.\n\nAnaliza, compara y optimiza tus estrategias: backtesting de estrategias, señales e insights personalizados, simulación de escenarios y gestión de riesgo, y mucho más',
    href: '/bsb-maker',
    buttonText: 'Explorar BSB Maker'
  },
  {
    icon: <Star />,
    title: 'Paquetes y membresía exclusiva',
    description: 'Descubre nuestros paquetes diseñados para tu perfil, combinando consultoría, formación y herramientas con IA según tus necesidades: ya seas empresa, inversor o quieras introducirte en el ecosistema crypto.\n\nAdemás, con nuestra membresía exclusiva tendrás acceso a:',
    details: '• Descuentos especiales en nuestros servicios.\n• Acceso anticipado al BSB Maker.\n• Acceso anual a BSB Academy\n• Eventos y reuniones con expertos en crypto.',
    href: '/membresias',
    buttonText: 'Explorar paquetes y beneficios'
  },
];

const ContactForm = () => {
  const { toast } = useToast();
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const subject = formData.get('subject');
    const body = formData.get('message');
    window.location.href = `mailto:info@bsbcapital.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast({
      title: "Abriendo cliente de correo",
      description: "Serás redirigido a tu aplicación de correo para enviar el mensaje.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input name="subject" placeholder="Asunto" required className="bg-card border-border text-foreground placeholder:text-muted-foreground" />
      <Textarea name="message" placeholder="Tu mensaje..." rows={5} required className="bg-card border-border text-foreground placeholder:text-muted-foreground" />
      <Button type="submit" className="w-full shadow-lg" size="lg">
        Enviar Mensaje <Mail className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};

const Home = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <>
      <Helmet>
        <title>BSB Capital - Transformamos tu forma de invertir en crypto</title>
        <meta name="description" content="BSB Capital nace como la primera firma que combina asesoramiento financiero independiente con especialización profunda en activos crypto. Profesionalidad, claridad y seguridad." />
      </Helmet>

      {/* Barra de notificación para administradores */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-2 sm:py-3 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Modo Administrador Activo</span>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="ml-4 bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
              >
                <Link to="/admin" className="flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  Ir al Panel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <section className="relative bg-background text-brand-text-primary overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 pt-4 pb-8 sm:pt-6 sm:pb-12 md:pt-8 md:pb-16">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-foreground">
                Transformamos tu forma
              </motion.h1>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight text-foreground mt-1">
                de invertir en crypto
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg text-brand-text-secondary">
                BSB Capital nace como la primera firma que combina asesoramiento financiero independiente con especialización profunda en activos crypto. Guiamos a inversores y empresas hacia decisiones inteligentes mediante análisis avanzado, tecnología y formación.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-6 sm:mt-10">
                <Button asChild size="lg" className="px-8 py-4 shadow-lg">
                  <Link to="/guia-inversion">
                    ENCUENTRA TU SERVICIO IDEAL <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 sm:py-20 md:py-28 bg-brand-green-100">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground">Soluciones de inversión que multiplican tu potencial</motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-center text-base sm:text-lg text-muted-foreground max-w-4xl mx-auto">Corregimos los problemas estructurales del sector crypto: falta de rigor, ausencia de metodología y poca transparencia. Te ofrecemos un ecosistema financiero completo con asesoramiento profesional, análisis avanzado y formación de calidad.</motion.p>
              <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                {services.map((service) => (
                  <ServiceCard key={service.title} {...service} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 sm:py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground">Confianza y resultados comprobados</motion.h2>
              <div className="mt-8 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
                <motion.div variants={itemVariants}>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-green-600">+4 años</p>
                  <p className="text-muted-foreground mt-2">de experiencia en el ecosistema crypto y blockchain</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-green-600">95%</p>
                  <p className="text-muted-foreground mt-2">de satisfacción de clientes</p>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-green-600">+10K</p>
                  <p className="text-muted-foreground mt-2">operaciones analizadas por IA</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 sm:py-20 md:py-28 bg-brand-green-100">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                ¿Listo para empezar?
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-muted-foreground">
                Ponte en contacto con nosotros y empieza a construir una estrategia financiera adaptada al futuro digital.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-6 sm:mt-10 max-w-lg mx-auto">
                <ContactForm />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Home;