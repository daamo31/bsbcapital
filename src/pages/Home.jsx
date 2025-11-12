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
    import { Particles, ParticlesEffect } from '@/components/animate-ui/primitives/effects/particles';
    import { Magnetic } from '@/components/animate-ui/primitives/effects/magnetic';
    import { ShimmeringText } from '@/components/animate-ui/primitives/texts/shimmering';

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
      <Magnetic strength={0.2} range={80} onlyOnHover>
        <motion.div 
          variants={itemVariants} 
          className="bg-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col group h-full"
        >
          <div className="flex-shrink-0 text-brand-accent">{React.cloneElement(icon, { className: "h-8 w-8 sm:h-10 sm:w-10" })}</div>
          <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-brand-text-primary">{title}</h3>
          <p className="mt-3 text-brand-text-secondary flex-grow">{description}</p>
          {details && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-brand-text-primary mb-2">Además, con nuestra membresía exclusiva tendrás acceso a:</h4>
              <div className="text-sm text-brand-text-secondary whitespace-pre-line">
                {details}
              </div>
            </div>
          )}
          <Button asChild variant="link" className="mt-6 p-0 text-brand-accent hover:text-brand-accent/80 self-start">
            <Link to={href}>
              {buttonText} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </Magnetic>
    );

    const services = [
      {
        icon: <Briefcase />,
        title: '💼 Consultoría Crypto',
        description: 'Asesoramiento profesional diseñado para el nuevo entorno financiero. Te ayudamos a gestionar, optimizar y estructurar tu cartera, construir estrategias sostenibles y reducir riesgos en tus operaciones con criptoactivos.',
        href: '/consultoria',
      },
      {
        icon: <BookOpen />,
        title: '📚 Academia Crypto & Finanzas Digitales',
        description: 'Aprende a invertir con autonomía y criterio. Nuestra formación combina píldoras rápidas, masterclasses especializadas y contenido actualizado para que desarrolles una mentalidad financiera sólida y entiendas realmente cómo funciona el ecosistema crypto.',
        href: '/academia',
      },
      {
        icon: <Bot />,
        title: '🤖 BSB Maker — Tu Asistente de Inversión con IA',
        description: 'Lleva tus decisiones al siguiente nivel con nuestra herramienta de Inteligencia Artificial diseñada para inversores crypto. Analiza, compara y optimiza tus estrategias: backtesting de estrategias, señales e insights personalizados, simulación de escenarios y gestión de riesgo, y mucho más.',
        href: '/bsb-maker',
        buttonText: 'Explorar BSB Maker'
      },
      {
        icon: <Star />,
        title: '🌐 Paquetes y Membresía',
        description: 'Descubre nuestros paquetes diseñados para tu perfil, combinando consultoría, formación y herramientas con IA según tus necesidades: ya seas empresa, inversor o asesor financiero.',
        details: '• Descuentos especiales en servicios y formación.\n• Eventos y masterclasses con expertos en crypto y finanzas digitales.\n• Comunidad privada de inversores y profesionales del sector.',
        href: '/membresias',
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
                <Input name="subject" placeholder="Asunto" required className="bg-white text-brand-text-primary" />
                <Textarea name="message" placeholder="Tu mensaje..." rows={5} required className="bg-white text-brand-text-primary" />
                <Button type="submit" className="w-full" size="lg">
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
            <meta name="description" content="Transformamos la forma en que personas y empresas se relacionan con el mundo crypto. Consultoría estratégica, formación práctica y herramientas con IA." />
          </Helmet>
          
          {/* Barra de notificación para administradores */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 sm:py-3 shadow-lg">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Modo Administrador Activo</span>
                  <Button 
                    asChild 
                    size="sm" 
                    variant="secondary" 
                    className="ml-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
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
            <section className="relative aurora-background text-brand-text-primary overflow-hidden">
              <Particles inView>
                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 py-16 sm:py-28 md:py-48">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
                      <span className="main-gradient-text">
                        <ShimmeringText 
                          text="Transformamos tu forma" 
                          duration={2}
                          shimmeringColor="rgba(34, 197, 94, 0.8)"
                          color="var(--color-primary)"
                        />
                      </span><br/> 
                      <span className="text-brand-text-primary">de invertir en crypto</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="mt-4 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg text-brand-text-secondary">
                      En BSB Capital transformamos la forma en que personas y empresas se relacionan con el mundo crypto. 
                      Unimos consultoría estratégica, formación práctica y herramientas con IA para que tomes decisiones con claridad, confianza y visión de futuro.
                    </motion.p>
                    <motion.div variants={itemVariants} className="mt-6 sm:mt-10">
                      <Magnetic strength={0.3} range={100}>
                        <Button asChild size="lg" className="bg-green-900 hover:bg-green-800 text-white px-8 py-4">
                          <Link to="/guia-inversion">
                            Descubrir mi Servicio Ideal <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </Magnetic>
                    </motion.div>
                  </motion.div>
                </div>
                <ParticlesEffect 
                  side="top" 
                  align="center" 
                  count={8} 
                  radius={50} 
                  duration={1.2}
                  className="w-2 h-2 bg-green-400 rounded-full opacity-60"
                />
                <ParticlesEffect 
                  side="bottom" 
                  align="end" 
                  count={6} 
                  radius={40} 
                  delay={0.5}
                  className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-70"
                />
              </Particles>
            </section>
            
            {/* Services Section */}
            <section className="py-12 sm:py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-brand-text-primary">Soluciones de Inversión que <span className="main-gradient-text">Multiplican tu Potencial</span></motion.h2>
                        <motion.p variants={itemVariants} className="mt-4 text-center text-base sm:text-lg text-brand-text-secondary max-w-4xl mx-auto">Tanto si estás dando tus primeros pasos en el mundo crypto, como si ya operas y quieres llevar tu gestión al siguiente nivel, en BSB Capital encontrarás las herramientas y el acompañamiento que necesitas.</motion.p>
                        <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                            {services.map((service) => (
                                <ServiceCard key={service.title} {...service} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 sm:py-20 md:py-28 bg-brand-green-100">
              <div className="container mx-auto px-4 sm:px-6">
                <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                  <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-brand-text-primary">Confianza y <span className="main-gradient-text">Resultados Comprobados</span></motion.h2>
                  <div className="mt-8 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
                    <motion.div variants={itemVariants}>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold main-gradient-text">+4 años</p>
                      <p className="text-brand-text-secondary mt-2">de experiencia en el ecosistema crypto y blockchain</p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold main-gradient-text">95%</p>
                      <p className="text-brand-text-secondary mt-2">de satisfacción de clientes</p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold main-gradient-text">+10K</p>
                      <p className="text-brand-text-secondary mt-2">operaciones analizadas por IA</p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 sm:py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div 
                        variants={containerVariants} 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, amount: 0.2 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text-primary">
                            ¿Listo para <span className="main-gradient-text">Empezar</span>?
                        </motion.h2>
                        <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-brand-text-secondary">
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