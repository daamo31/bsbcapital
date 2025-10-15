import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Rne6CJmSk3VG9oipr5fPA32tndC3TFLYHWrENknJ8fcNvIq8A3Nq0KfLdvwkMAyFvgLOWECBpIuzE2THTX4Mb1s00zqHyg0op';

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00",
];

const consultationPrices = {
  "30min": "price_1RtYGsJmSk3VG9oicAWmQ4sN",
  "60min": "price_1RtYFkJmSk3VG9oi8wUdMK5k",
};

const BookingModal = () => {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: '', email: '', service_interest: '', duration: '', more_info: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !selectedTime || !formData.name || !formData.email || !formData.service_interest || !formData.duration) {
      toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, completa todos los campos obligatorios." });
      return;
    }
    setLoading(true);

    const bookingDateTime = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const priceId = consultationPrices[formData.duration];
    const serviceDescription = `${formData.service_interest} (${formData.duration === '30min' ? '30 min' : '1 hora'})`;

    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: JSON.stringify({ 
          priceId,
          mode: 'payment',
          email: formData.email,
          metadata: {
            client_name: formData.name,
            client_email: formData.email,
            consultation_type: formData.service_interest,
            scheduled_at: bookingDateTime.toISOString(),
            duration_minutes: formData.duration === '30min' ? '30' : '60',
            description: formData.more_info,
            status: 'scheduled',
            // Mantenemos campos originales para compatibilidad
            service: serviceDescription,
            booking_date: bookingDateTime.toISOString(),
            notes: formData.more_info,
          }
        }),
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch(error) {
       toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: "Hubo un problema al redirigirte a la pasarela de pago. Por favor, inténtalo de nuevo.",
      });
      console.error("Stripe checkout error:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-8" size="lg">
          Agendar una llamada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl p-0 glass-card">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 flex flex-col justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1)) || day.getDay() === 0 || day.getDay() === 6}
                    className="rounded-md"
                    locale={es}
                />
                {date && (
                    <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2 text-center text-brand-text-primary">Horas disponibles para {format(date, "PPP", { locale: es })}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimeSlots.map(time => (
                        <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="flex items-center gap-2"
                        >
                            <Clock className="h-4 w-4" /> {time}
                        </Button>
                        ))}
                    </div>
                    </div>
                )}
            </div>
            <div className="p-6 bg-brand-surface/80 rounded-r-lg">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                <DialogTitle className="text-brand-text-primary">Completa tu reserva</DialogTitle>
                <DialogDescription className="text-brand-text-secondary">
                    Selecciona tema, duración, día y hora, y completa tus datos para proceder al pago.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid items-center gap-1.5">
                      <Label htmlFor="service_interest" className="text-brand-text-primary">Tema de la consultoría</Label>
                      <Select onValueChange={(value) => handleSelectChange('service_interest', value)} value={formData.service_interest} required>
                      <SelectTrigger><SelectValue placeholder="Selecciona un tema" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Planificación financiera">Planificación financiera</SelectItem>
                          <SelectItem value="Creación y optimización de carteras">Creación y optimización de carteras</SelectItem>
                          <SelectItem value="Crypto/Web3">Crypto/Web3</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                  <div className="grid items-center gap-1.5">
                      <Label htmlFor="duration" className="text-brand-text-primary">Duración</Label>
                      <Select onValueChange={(value) => handleSelectChange('duration', value)} value={formData.duration} required>
                      <SelectTrigger><SelectValue placeholder="Selecciona duración" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="30min">30 minutos</SelectItem>
                          <SelectItem value="60min">1 hora</SelectItem>
                      </SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="grid items-center gap-1.5">
                    <Label htmlFor="name" className="text-brand-text-primary">Nombre</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="grid items-center gap-1.5">
                    <Label htmlFor="email" className="text-brand-text-primary">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="grid items-center gap-1.5">
                    <Label htmlFor="more_info" className="text-brand-text-primary">Nota (Opcional)</Label>
                    <Textarea id="more_info" value={formData.more_info} onChange={handleChange} placeholder="Añade cualquier información relevante." />
                </div>
                </div>
                <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Proceder al pago
                </Button>
                </DialogFooter>
            </form>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Consultoria = () => {
  return (
    <>
      <Helmet>
        <title>Consultoría Financiera Estratégica - BSB Capital</title>
        <meta name="description" content="Consultoría financiera estratégica y personalizada. Trazamos la ruta contigo hacia el éxito financiero con planificación, optimización de carteras y estrategias crypto." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-brand-text-primary mb-6"
          >
            Consultoría Financiera Estratégica y Personalizada
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-brand-text-secondary mb-8 leading-relaxed"
          >
            En un mercado donde la información se multiplica y la volatilidad marca el pulso, tener un plan no es opcional: es la diferencia entre reaccionar tarde o adelantarse a las oportunidades.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BookingModal />
          </motion.div>
        </div>

        {/* Storytelling Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-surface border border-brand-primary/20 rounded-xl p-8 md:p-12 mb-16 shadow-lg"
        >
          <p className="text-lg md:text-xl text-brand-text-secondary leading-relaxed text-center italic">
            Imagina que tu cartera es un barco. Algunos navegan sin brújula y esperan que el viento les lleve; otros confían en que la tormenta amaine. En BSB Capital trazamos la ruta contigo: analizamos tus activos, identificamos los riesgos invisibles y diseñamos un plan de acción que te permita avanzar con seguridad, ya sea en los mercados tradicionales o en el ecosistema cripto y Web3.
          </p>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-brand-primary/10 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">Planificación Financiera</h3>
                <p className="text-brand-text-secondary">Estrategias claras para optimizar ingresos, gastos e impuestos.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-brand-primary/10 p-3 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">Optimización de Carteras</h3>
                <p className="text-brand-text-secondary">Ajustamos tu portafolio para reducir riesgos sin perder rentabilidad.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-brand-primary/10 p-3 rounded-lg">
                <span className="text-2xl">🌐</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">Crypto & Web3</h3>
                <p className="text-brand-text-secondary">Te guiamos para aprovechar nuevas oportunidades con fundamentos sólidos y control del riesgo.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-brand-primary/10 p-3 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-text-primary mb-2">Onboarding Crypto</h3>
                <p className="text-brand-text-secondary">Has oído hablar de las rentabilidades de las criptomonedas, pero no sabes cómo empezar. Este servicio es tu puerta de entrada, acompañándote paso a paso para invertir de forma segura y consciente.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Case Studies */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-text-primary mb-12">Casos de Éxito</h2>
          
          <div className="space-y-8">
            <div className="bg-brand-surface border-l-4 border-brand-primary rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-brand-primary">1️⃣</span>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-primary mb-2">Planificación Financiera</h3>
                  <p className="text-brand-text-secondary italic leading-relaxed">
                    "Un profesional independiente con ingresos variables nos pidió estructura. Creamos un plan financiero que le permitió separar ahorro, inversión y liquidez mensual. Ahora sabe exactamente cuánto puede invertir cada mes sin comprometer su estilo de vida."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border-l-4 border-brand-gold rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-brand-gold">2️⃣</span>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-primary mb-2">Optimización de Carteras</h3>
                  <p className="text-brand-text-secondary italic leading-relaxed">
                    "Un cliente con un portafolio sobreexpuesto a altcoins nos pidió claridad. Tras nuestro análisis, redistribuimos un 30% de sus activos hacia productos estables y generadores de yield. Resultado: menos volatilidad y mayor previsibilidad de ingresos, sin renunciar a crecimiento."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border-l-4 border-brand-green-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-brand-green-600">3️⃣</span>
                <div>
                  <h3 className="text-xl font-bold text-brand-text-primary mb-2">Onboarding Crypto</h3>
                  <p className="text-brand-text-secondary italic leading-relaxed">
                    "Un empresario había oído hablar de Bitcoin y DeFi, pero nunca se atrevió a dar el paso. En nuestro onboarding, le enseñamos a abrir su primera wallet, comprar sus primeros activos y entender conceptos de seguridad básica. Hoy, diversifica un 15% de su portafolio en cripto con confianza."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-brand-primary/5 rounded-xl p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-brand-text-primary mb-4">
            ¿Listo para tomar el control de tu futuro financiero?
          </h2>
          <p className="text-brand-text-secondary mb-6">
            No dejes que la incertidumbre del mercado dicte tu destino. Reserva tu consultoría y comienza a construir la estrategia que transformará tu relación con el dinero.
          </p>
          <BookingModal />
        </motion.div>

        {/* Demo Link */}
        <div className="mt-8 text-center">
          <Link 
            to="/demo/consultation-form" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            🧪 Probar formulario detallado (Demo)
          </Link>
        </div>
      </motion.div>
    </>
  );
};

export default Consultoria;