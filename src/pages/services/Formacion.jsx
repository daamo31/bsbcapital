import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, CheckCircle, Film, FileText, LifeBuoy, ShieldCheck, BarChart, Users, HelpCircle, RefreshCw, MessageSquare, Quote } from 'lucide-react';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/data-display/accordion";
    import CheckoutModal from '@/components/consultations/CheckoutModal';

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
        { question: "¿Cómo accedo al curso?", answer: "Tras completar la compra, recibirás un correo electrónico con un enlace para acceder al área de alumnos de forma inmediata. Podrás empezar tu formación al instante." },
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
            <motion.section variants={itemVariants} className="aurora-background text-center py-12 sm:py-20 md:py-32">
              <div className="container mx-auto px-4 sm:px-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold main-gradient-text">Academia BSB Capital</h1>
                <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-brand-text-secondary">
                  Formación práctica en inversión, fiscalidad y crypto para tomar decisiones con calma y criterio.
                </p>
                <div className="mt-8">
                  <ComprarCursoButton>Accede al curso</ComprarCursoButton>
                </div>
              </div>
            </motion.section>

            {/* What's Included Section */}
            <motion.section variants={itemVariants} className="py-12 sm:py-16 md:py-24 bg-background">
              <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">¿Qué incluye el curso?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
            <motion.section variants={itemVariants} className="py-12 sm:py-16 md:py-24 bg-brand-green-100">
              <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Transforma tu manera de invertir</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
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

           

            {/* Testimonials Carousel Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-100 via-brand-green-50 to-brand-green-100">
              <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center main-gradient-text mb-12">Lo que dicen nuestros alumnos</h2>
              
                <div className="relative overflow-hidden">
                  <div className="flex animate-[scroll_40s_linear_infinite] pause-animation">
                    {/* Testimonial 1 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                            AG
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Ana García</h3>
                            <p className="text-sm text-brand-text-secondary">Contable, Sevilla</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Nunca pensé que entendería los derivados. El curso me abrió los ojos: ahora protejo mis ETFs con opciones y ya he evitado 2 caídas importantes. ¡Mi cartera está blindada! 🛡️"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 1 semana</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            MR
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Miguel Rodríguez</h3>
                            <p className="text-sm text-brand-text-secondary">Ingeniero, Barcelona</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Tenía un lío tremendo con las crypto en Hacienda. Después del módulo fiscal lo tengo todo controlado: plantillas, Excel automatizado, cero estrés 🎯"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 3 días</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            CP
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Carlos Pérez</h3>
                            <p className="text-sm text-brand-text-secondary">Trader, Madrid</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Era un gambler total. El módulo de gestión de riesgo me enseñó a operar como los institucionales. Ahora tengo consistencia y duermo tranquilo 😴"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 2 semanas</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 4 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            LS
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Laura Sánchez</h3>
                            <p className="text-sm text-brand-text-secondary">Médica, Valencia</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Como médica no tenía tiempo para estudiar trading. Los checklists del curso son oro puro: analizo, ejecuto y listo. Ya voy por el 18% este año 📈"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 5 días</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 5 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            JM
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Javier Martín</h3>
                            <p className="text-sm text-brand-text-secondary">Autónomo, Bilbao</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Estaba perdiendo pasta como un loco en futuros. El curso me enseñó gestión de riesgo real: position sizing, stops... Ahora opero como un profesional 💪"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 10 días</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 6 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            EP
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Elena Prieto</h3>
                            <p className="text-sm text-brand-text-secondary">Arquitecta, Zaragoza</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Me daba pánico tocar crypto por el tema fiscal. Después del curso tengo todo claro: declaraciones, costes, ganancias... Ya declaré sin problemas 📊"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 1 mes</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 7 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            DR
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">David Ruiz</h3>
                            <p className="text-sm text-brand-text-secondary">Programador, Málaga</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Trabajo en tech y quería aprovechar mi cartera de acciones. Con las opciones del curso ahora genero ingresos extra cubriendo riesgo. Genial! 🚀"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 4 días</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 8 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            SC
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Sofía Castro</h3>
                            <p className="text-sm text-brand-text-secondary">Abogada, Granada</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Tenía Bitcoin desde 2020 pero no sabía cómo declararlo bien. El módulo fiscal me salvó la vida: ahora sé exactamente qué hacer cada año 🎯"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 2 semanas</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 9 */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            RT
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Raúl Torres</h3>
                            <p className="text-sm text-brand-text-secondary">Comercial, Murcia</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Era un desastre con el risk management. Perdía el 50% y lo recuperaba... hasta que no. Ahora tengo un sistema: nunca más del 2% por trade 💡"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 1 semana</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonials duplicados para loop infinito */}
                    <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                      <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                        <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                            AG
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-brand-text-primary">Ana García</h3>
                            <p className="text-sm text-brand-text-secondary">Contable, Sevilla</p>
                          </div>
                        </div>
                        <p className="text-brand-text-secondary italic">
                          "Nunca pensé que entendería los derivados. El curso me abrió los ojos: ahora protejo mis ETFs con opciones y ya he evitado 2 caídas importantes. ¡Mi cartera está blindada! 🛡️"
                        </p>
                        <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-2">• hace 1 semana</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
            <motion.section variants={itemVariants} className="py-16 md:py-24 bg-brand-green-100">
              <div className="container mx-auto px-4 text-center max-w-3xl">
                <ShieldCheck className="h-16 w-16 mx-auto text-brand-gold mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold">Garantía de Satisfacción</h2>
                <p className="mt-4 text-brand-green-100/80">Tu inversión en conocimiento está protegida. Tienes un período de garantía para probar el curso sin riesgo. Si no cumple tus expectativas, te devolvemos tu dinero.</p>
                <div className="mt-8">
                  <ComprarCursoButton>Comprar curso ahora</ComprarCursoButton>
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