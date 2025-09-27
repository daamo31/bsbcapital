import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, CheckCircle, Film, FileText, LifeBuoy, ShieldCheck, BarChart, Users, HelpCircle, RefreshCw, MessageSquare } from 'lucide-react';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import CheckoutModal from '@/components/CheckoutModal';

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

    const Formacion = () => {
      const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

      const ComprarCursoButton = ({ children, ...props }) => (
        <Button 
          size="lg" 
          onClick={() => setIsCheckoutModalOpen(true)}
          {...props}
        >
          {children} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      );

      const benefits = [
        { icon: <ShieldCheck className="h-8 w-8 text-primary" />, title: "Claridad Fiscal", description: "Navega por la fiscalidad de criptoactivos y derivados sin estrés." },
        { icon: <BarChart className="h-8 w-8 text-primary" />, title: "Gestión del Riesgo", description: "Aprende a proteger tu capital con métodos institucionales." },
        { icon: <Users className="h-8 w-8 text-primary" />, title: "Casos Reales", description: "Aplica estrategias probadas en mercados reales, no solo teoría." },
      ];

      const programModules = [
        { title: "Módulo 1: Fundamentos de gestión del riesgo", content: "Domina las bases para proteger tu capital y operar con confianza, minimizando pérdidas y maximizando la consistencia." },
        { title: "Módulo 2: Fiscalidad y cumplimiento (crypto)", content: "Entiende tus obligaciones fiscales con criptoactivos en España y aprende a declararlos correctamente para evitar sorpresas." },
        { title: "Módulo 3: Operativa con derivados (visión institucional)", content: "Descubre cómo los profesionales utilizan futuros y opciones para cubrir carteras y especular con riesgo controlado." },
        { title: "Módulo 4: Estructuras y checklists de ejecución", content: "Obtén nuestros sistemas y checklists paso a paso para analizar activos, ejecutar operaciones y gestionar tu cartera de forma sistemática." },
      ];

      const faqs = [
        { question: "¿Cómo accedo al curso?", answer: "Tras completar la compra en Hotmart, recibirás un correo electrónico con un enlace para acceder al área de alumnos de forma inmediata. Podrás empezar tu formación al instante." },
        { question: "¿Hay devoluciones?", answer: "Sí, ofrecemos una garantía de satisfacción. Puedes solicitar una devolución completa según la política de reembolso de Hotmart y nuestras condiciones. Consulta nuestros términos para más detalles." },
        { question: "¿Qué tipo de soporte incluye?", answer: "El curso incluye soporte básico por email para resolver dudas sobre el contenido de las lecciones. Escríbenos a info@bsbcapital.io y te ayudaremos." },
      ];

      return (
        <>
          <Helmet>
            <title>Academia BSB Capital | Curso de Inversión, Fiscalidad y Crypto</title>
            <meta name="description" content="Formación práctica con vídeos y plantillas. Acceso 24/7 vía Hotmart. Empieza hoy." />
            {/* Hotmart Pixel */}
            <script dangerouslySetInnerHTML={{
              __html: `
                (function(h,o,t,m,a,r){
                  h.HotmartPixelObject=m;h[m]=h[m]||function(){
                  (h[m].q=h[m].q||[]).push(arguments)};a=o.createElement(t);
                  r=o.getElementsByTagName(t)[0];a.async=1;a.src='//static.hotmart.com/pixel/htmtag.min.js';
                  r.parentNode.insertBefore(a,r)
                })(window,document,'script','htag');
                htag('config', 'D102065526G');
                htag('event', 'PageView');
              `
            }} />
            <script type="application/ld+json">{`
              {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "Academia BSB Capital: Curso de Inversión, Fiscalidad y Crypto",
                "description": "Formación práctica con vídeos y plantillas. Acceso 24/7 vía Hotmart. Empieza hoy.",
                "brand": {
                  "@type": "Brand",
                  "name": "BSB Capital"
                },
                "url": "https://bsbcapital.io/formacion",
                "offers": {
                  "@type": "Offer",
                  "url": "https://go.hotmart.com/D102065526G?dp=",
                  "priceCurrency": "EUR"
                }
              }
            `}</script>
          </Helmet>
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            {/* Hero Section */}
            <motion.section variants={itemVariants} className="aurora-background text-center py-20 md:py-32">
              <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-brand-text-primary">Academia BSB Capital</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-brand-text-secondary">
                  Formación práctica en inversión, fiscalidad y crypto para tomar decisiones con calma y criterio.
                </p>
                <div className="mt-8">
                  <ComprarCursoButton>Comprar curso</ComprarCursoButton>
                </div>
              </div>
            </motion.section>

            {/* What's Included Section */}
            <motion.section variants={itemVariants} className="py-16 md:py-24 bg-background">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">¿Qué incluye el curso?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="text-center p-6 bg-card rounded-lg border">
                    <Film className="h-10 w-10 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Vídeos paso a paso</h3>
                    <p className="text-muted-foreground mt-2">Lecciones claras y concisas que puedes ver a tu ritmo, cuando quieras.</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-lg border">
                    <FileText className="h-10 w-10 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Plantillas descargables</h3>
                    <p className="text-muted-foreground mt-2">Checklists y hojas de cálculo listas para usar en tu propia gestión.</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-lg border">
                    <LifeBuoy className="h-10 w-10 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold">Soporte y Actualizaciones</h3>
                    <p className="text-muted-foreground mt-2">Soporte por email y acceso a futuras actualizaciones del contenido.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Benefits Section */}
            <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-100">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Transforma tu manera de invertir</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div>{benefit.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{benefit.title}</h3>
                        <p className="text-muted-foreground mt-1">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Program Section */}
            <motion.section variants={itemVariants} className="py-16 md:py-24">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Programa del Curso</h2>
                <Accordion type="single" collapsible className="w-full">
                  {programModules.map((module, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={index}>
                      <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground">{module.content}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-100">
              <div className="container mx-auto px-4 text-center max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">Lo que dicen nuestros alumnos</h2>
                <div className="bg-card p-8 rounded-lg border">
                  <p className="text-xl italic text-muted-foreground">"Este es un placeholder para un testimonio increíble de un alumno satisfecho. El curso le cambió la vida y ahora es un inversor mucho más seguro y rentable."</p>
                  <p className="font-bold mt-4 text-primary">- Alumno Feliz</p>
                </div>
              </div>
            </motion.section>

            {/* FAQs Section */}
            <motion.section variants={itemVariants} className="py-16 md:py-24">
              <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={index}>
                      <AccordionTrigger className="text-lg font-semibold">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </motion.section>

            {/* Guarantee & Final CTA */}
            <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-900 text-white">
              <div className="container mx-auto px-4 text-center max-w-3xl">
                <ShieldCheck className="h-16 w-16 mx-auto text-brand-gold mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold">Garantía de Satisfacción</h2>
                <p className="mt-4 text-brand-green-100/80">Tu inversión en conocimiento está protegida. Tienes un período de garantía para probar el curso sin riesgo. Si no cumple tus expectativas, te devolvemos tu dinero.</p>
                <div className="mt-8">
                  <ComprarCursoButton className="bg-brand-gold text-brand-green-900 hover:bg-brand-gold/90">Comprar curso ahora</ComprarCursoButton>
                </div>
              </div>
            </motion.section>

            {/* Disclaimer & Support */}
            <motion.section variants={itemVariants} className="py-16">
              <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                  <h3 className="text-2xl font-bold">¿Dudas?</h3>
                  <p className="text-muted-foreground mt-2">Escríbenos a <a href="mailto:info@bsbcapital.io" className="text-primary font-semibold hover:underline">info@bsbcapital.io</a> y te ayudaremos.</p>
                </div>
                <div className="border-t pt-8">
                  <h3 className="text-xl font-bold mb-4">📌 Disclaimer Financiero</h3>
                  <p className="text-sm text-muted-foreground">La información contenida en este curso tiene carácter meramente informativo y educativo. En ningún caso constituye una garantía de resultados ni una obligación de obtener rendimientos determinados. Los servicios de BSB Capital se centran en el análisis, acompañamiento y asesoramiento especializado, pero las decisiones finales de inversión o gestión patrimonial corresponden exclusivamente al cliente, quien reconoce y acepta que toda inversión conlleva riesgos significativos, incluyendo la pérdida total o parcial del capital invertido. Los resultados pasados no son indicativos de rendimientos futuros.</p>
                </div>
              </div>
            </motion.section>
          </motion.div>
          
          {/* Modal de Checkout */}
          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
          />
        </>
      );
    };

    export default Formacion;