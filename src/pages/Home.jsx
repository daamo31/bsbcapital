import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Bot, Briefcase, BookOpen, Mail, Star, LogIn, User, Settings, Shield } from 'lucide-react';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from "@/components/ui/use-toast";
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

    const ServiceCard = ({ icon, title, description, href, isGroup = false, subServices }) => (
      <motion.div 
        variants={itemVariants} 
        className="bg-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 flex flex-col group h-full"
      >
        <div className="flex-shrink-0 text-brand-accent">{React.cloneElement(icon, { className: "h-8 w-8 sm:h-10 sm:w-10" })}</div>
        <h3 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-brand-text-primary">{title}</h3>
        <p className="mt-3 text-brand-text-secondary flex-grow">{description}</p>
        {isGroup ? (
          <div className="mt-6 space-y-3">
            {subServices.map(sub => (
              <Button asChild variant="link" key={sub.name} className="p-0 text-brand-accent hover:text-brand-accent/80 self-start w-full justify-start">
                <Link to={sub.href} className="flex items-center">
                  {sub.name} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <Button asChild variant="link" className="mt-6 p-0 text-brand-accent hover:text-brand-accent/80 self-start">
            <Link to={href}>
              Saber más <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </motion.div>
    );

    const services = [
      {
        icon: <Bot />,
        title: 'Trading',
        description: 'Convierte la volatilidad en oportunidad. Herramientas de IA y algoritmos avanzados que te permiten operar con ventaja frente al resto de traders.',
        isGroup: true,
        subServices: [
          { name: 'BSB Maker', href: '/bsb-maker' },
          { name: 'Algo Fund', href: '/algo-fund' },
        ]
      },
      {
        icon: <Briefcase />,
        title: 'Consultoría',
        description: 'Decisiones financieras con respaldo profesional. Asesoramiento experto en tesorería, inversión y criptoactivos, diseñado para proteger y hacer crecer tu patrimonio y siempre adaptado a tus necesidades.',
        href: '/consultoria',
      },
      {
        icon: <BookOpen />,
        title: 'Academia',
        description: 'Aprende con un método distinto. Formación dinámica basada en píldoras rápidas y masterclass especializadas, pensada para que avances desde lo básico hasta estrategias avanzadas de inversión de manera clara y aplicable.',
        href: '/formacion',
      },
      {
        icon: <Star />,
        title: 'Membresías',
        description: 'El acceso que te diferencia del resto. Planes exclusivos que incluyen beneficios, descuentos y una comunidad privada de inversores visionarios.',
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
            <title>BSB Capital - Inteligencia Financiera Potenciada por IA</title>
            <meta name="description" content="Fusionamos experiencia de mercado y tecnología de vanguardia para ofrecer soluciones de inversión fiables, escalables y a tu medida." />
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
              <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 py-16 sm:py-28 md:py-48">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
                    <span className="text-brand-text-primary">Inteligencia Financiera</span><br/> <span className="main-gradient-text">Potenciada por IA</span>
                  </motion.h1>
                  <motion.p variants={itemVariants} className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg text-brand-text-secondary">
                    En BSB Capital unimos consultoría con asesores financieros, algoritmos y herramientas desarrolladas con IA para que inviertas con confianza y construyas un futuro sólido.
                  </motion.p>
                  <motion.div variants={itemVariants} className="mt-6 sm:mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button asChild size="lg">
                      <Link to="/bsb-maker">
                        Explorar BSB Maker <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    
                    {user && (
                      <Button asChild size="lg" variant="secondary">
                        <Link to="/academia">
                          <BookOpen className="mr-2 h-5 w-5" />
                          Acceder a Academia
                        </Link>
                      </Button>
                    )}
                    
                    <Button asChild size="lg" className="bg-green-900 hover:bg-green-800 text-white">
                      <Link to="/guia-inversion">
                        Descubrir mi Servicio Ideal <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </section>
            
            {/* Services Section */}
            <section className="py-12 sm:py-20 md:py-28 bg-background">
                <div className="container mx-auto px-4 sm:px-6">
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                        <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-brand-text-primary">Soluciones de Inversión que <span className="main-gradient-text">Multiplican tu Potencial</span></motion.h2>
                        <motion.p variants={itemVariants} className="mt-4 text-center text-base sm:text-lg text-brand-text-secondary max-w-2xl mx-auto">Tanto si quieres operar con autonomía, formarte con rigor o delegar tu capital en expertos, en BSB Capital tenemos el plan que transforma tu manera de invertir.</motion.p>
                        <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
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
                      <p className="text-brand-text-secondary mt-2">de trading cripto rentable</p>
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
                            ¿Listo para <span className="main-gradient-text">empezar</span>?
                        </motion.h2>
                        <motion.p variants={itemVariants} className="mt-4 text-base sm:text-lg text-brand-text-secondary">
                            Ponte en contacto con nosotros. Nuestro equipo está listo para ayudarte a alcanzar tus objetivos financieros.
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