import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { useToast } from '@/components/ui/feedback/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Building, Home, ShieldCheck } from 'lucide-react';

const ServiceCard = ({ icon, title, children, onActionClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <p className="text-muted-foreground flex-grow">{children}</p>
        <Button onClick={onActionClick} className="mt-6 w-full md:w-auto self-start">
          Quiero más información
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const OtrosServicios = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor, completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('service_inquiries').insert({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
    });

    setLoading(false);

    if (error) {
      toast({
        title: 'Error al enviar',
        description: 'Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Solicitud enviada',
        description: 'Gracias por tu interés. Nos pondremos en contacto contigo pronto.',
      });
      setFormData({ fullName: '', email: '', phone: '', message: '' });
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <Helmet>
        <title>Otros Servicios de Inversión y Fiscalidad - BSB Capital</title>
        <meta
          name="description"
          content="Soluciones exclusivas para proteger y hacer crecer tu patrimonio: traslado de residencia a Dubái, inversiones inmobiliarias estratégicas y cumplimiento normativo en criptoactivos."
        />
      </Helmet>
      <div className="bg-background text-foreground">
        <header className="py-20 md:py-32 text-center bg-background">
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-4xl md:text-6xl font-bold text-foreground"
            >
              Otros Servicios de Inversión y Fiscalidad
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-text-2"
            >
              Soluciones exclusivas para proteger y hacer crecer tu patrimonio: traslado de
              residencia a Dubái, inversiones inmobiliarias estratégicas y cumplimiento normativo en
              criptoactivos.
            </motion.p>
          </div>
        </header>

        <main className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {/* Service Images */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <img
                  src="/service-image-1.jpg"
                  alt="Vista panorámica de Dubái"
                  className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              >
                <img
                  src="/service-image-2.jpg"
                  alt="Skyline de Dubái al atardecer"
                  className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                <img
                  src="/service-image-3.jpg"
                  alt="CLCRIPTO - Consultoría Legal Cripto"
                  className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
                />
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceCard
                icon={<Building className="h-6 w-6 text-primary" />}
                title="Traslada tu residencia a Dubái"
                onActionClick={scrollToForm}
              >
                ¿Quieres proteger tu patrimonio y pagar menos impuestos? En BSB Capital te
                acompañamos en todo el proceso de traslado de residencia a Dubái, disfrutando de un
                entorno fiscal único en el mundo: 0% de impuestos sobre la renta personal. Haz
                crecer tu libertad financiera en un país diseñado para el éxito.
              </ServiceCard>
              <ServiceCard
                icon={<Home className="h-6 w-6 text-primary" />}
                title="Invierte en el mercado inmobiliario de Dubái"
                onActionClick={scrollToForm}
              >
                El sector inmobiliario en Dubái es uno de los más sólidos y rentables a nivel
                global. Te damos acceso a proyectos exclusivos, con alta demanda y potencial de
                revalorización. Nuestro equipo te asesora desde la selección hasta la ejecución,
                para que tu inversión sea segura y estratégica.
              </ServiceCard>
              <ServiceCard
                icon={<ShieldCheck className="h-6 w-6 text-primary" />}
                title="Cumplimiento normativo y fiscalidad crypto"
                onActionClick={scrollToForm}
              >
                En colaboración con CLCRIPTO, ofrecemos un servicio especializado en fiscalidad de
                criptoactivos basado en la ética, la transparencia y el cumplimiento normativo.
                Nuestro objetivo es garantizar que cada operación esté correctamente trazada y
                alineada con las exigencias fiscales internacionales, para que inviertas con
                seguridad jurídica y tranquilidad. CLCRIPTO es nuestro socio de confianza en este
                ámbito, reconocido por su compromiso con la legalidad y la integridad profesional.
              </ServiceCard>
            </div>

            <div ref={formRef} className="mt-24 md:mt-32 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <Card className="shadow-2xl shadow-primary/10">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Contacta con nosotros</CardTitle>
                    <p className="text-muted-foreground pt-2">
                      Déjanos tus datos y nos pondremos en contacto contigo.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                          id="fullName"
                          placeholder="Tu nombre y apellidos"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono (Opcional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea
                          id="message"
                          placeholder="Cuéntanos cómo podemos ayudarte..."
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Solicitar asesoría personalizada
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OtrosServicios;
