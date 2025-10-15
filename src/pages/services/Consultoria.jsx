import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Clock, BarChart3, Briefcase, Globe, Rocket, Quote } from 'lucide-react';
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
        <Button className="mt-8 bg-white text-brand-green-900 hover:bg-brand-gold-100 hover:text-brand-green-900 shadow-lg transition-all duration-300" size="lg">
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
        <title>Consultoría - BSB Capital</title>
        <meta name="description" content="Asesoramiento experto en planificación financiera, creación y optimización de carteras, y crypto/web3." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-600 via-brand-green-600 to-brand-green-900">
          {/* Background overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green-900/20 to-transparent"></div>
          
          {/* Content */}
          <div className="relative container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Consultoría Financiera <span className="text-brand-gold-100">Estratégica y Personalizada</span>
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-3xl mx-auto">
              En un mercado donde la información se multiplica y la volatilidad marca el pulso, tener un plan no es opcional: es la diferencia entre reaccionar tarde o adelantarse a las oportunidades.
            </p>
            
            <div className="mt-8">
              <BookingModal />
            </div>
          </div>
        </div>

        {/* Storytelling Section */}
        <div className="bg-brand-green-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-brand-green-200">
                <p className="text-xl text-brand-green-900 leading-relaxed">
                  Imagina que tu cartera es un barco. Algunos navegan sin brújula y esperan que el viento les lleve; otros confían en que la tormenta amaine. En BSB Capital trazamos la ruta contigo: analizamos tus activos, identificamos los riesgos invisibles y diseñamos un plan de acción que te permita avanzar con seguridad, ya sea en los mercados tradicionales o en el ecosistema cripto y Web3.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-600 via-brand-green-600 to-brand-green-900">
          {/* Background overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green-900/20 to-transparent"></div>
          
          {/* Content */}
          <div className="relative container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:bg-white">
                <BarChart3 className="h-12 w-12 text-brand-green-600 mb-4" />
                <h3 className="text-xl font-bold text-brand-green-900 mb-3">Planificación Financiera</h3>
                <p className="text-brand-green-800">Estrategias claras para optimizar ingresos, gastos e impuestos.</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:bg-white">
                <Briefcase className="h-12 w-12 text-brand-green-600 mb-4" />
                <h3 className="text-xl font-bold text-brand-green-900 mb-3">Optimización de Carteras</h3>
                <p className="text-brand-green-800">Ajustamos tu portafolio para reducir riesgos sin perder rentabilidad.</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:bg-white">
                <Globe className="h-12 w-12 text-brand-green-600 mb-4" />
                <h3 className="text-xl font-bold text-brand-green-900 mb-3">Crypto & Web3</h3>
                <p className="text-brand-green-800">Te guiamos para aprovechar nuevas oportunidades con fundamentos sólidos y control del riesgo.</p>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:bg-white">
                <Rocket className="h-12 w-12 text-brand-green-600 mb-4" />
                <h3 className="text-xl font-bold text-brand-green-900 mb-3">Onboarding Crypto</h3>
                <p className="text-brand-green-800">Has oído hablar de las rentabilidades de las criptomonedas, pero no sabes cómo empezar. Este servicio es tu puerta de entrada, acompañándote paso a paso para invertir de forma segura y consciente.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Carousel Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-100 via-brand-green-50 to-brand-green-100">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center text-brand-green-900 mb-12">Lo que dicen nuestros clientes</h2>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-[scroll_40s_linear_infinite] pause-animation">
              {/* Testimonial 1 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                      CM
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Carlos Mendoza</h3>
                      <p className="text-sm text-brand-text-secondary">Freelancer, Madrid</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Llevaba años sin control de mis finanzas como freelancer. En 2 meses con BSB Capital ya tengo mi fondo de emergencia completo y un plan de inversión que me da tranquilidad. ¡Brutal cómo cambió mi mentalidad financiera! 🚀"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 3 semanas</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      AS
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Ana Sánchez</h3>
                      <p className="text-sm text-brand-text-secondary">Arquitecta, Barcelona</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Tenía mis ahorros en el banco ganando 0%. Después de la consultoría redistribuí todo: ETFs, algo de crypto y renta fija. En 6 meses ya veo resultados reales. Su enfoque es súper profesional 💪"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 1 mes</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      JR
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Javier Ruiz</h3>
                      <p className="text-sm text-brand-text-secondary">Empresario, Valencia</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Quería entrar en crypto pero no sabía ni por dónde empezar. Me explicaron todo desde cero: wallets, DeFi, riesgos... Ahora tengo un 10% en crypto bien diversificado y duermo tranquilo 👌"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 2 semanas</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      MG
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">María García</h3>
                      <p className="text-sm text-brand-text-secondary">Médica, Sevilla</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Como médica no tenía tiempo para estudiar inversiones. La consultoría me ayudó a automatizar todo: plan de pensiones, ETFs... Todo en piloto automático. Ahora mi dinero trabaja mientras yo trabajo 🔥"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 5 días</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      LM
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Luis Martín</h3>
                      <p className="text-sm text-brand-text-secondary">Ingeniero, Bilbao</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Honestly, tenía dudas al principio. Pero después de 3 meses siguiendo su estrategia de DCA en ETFs, ya voy viendo la diferencia. No es magia, pero funciona. Recomendable para gente seria 👍"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 1 semana</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      SP
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Sara Pérez</h3>
                      <p className="text-sm text-brand-text-secondary">Consultora, Zaragoza</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Tenía un portfolio muy conservador, todo en depósitos. Me costó el cambio pero ahora tengo una mezcla equilibrada. Los primeros meses fueron intensos, pero el seguimiento fue genial 🎯"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 2 meses</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 7 */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      DR
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">David Rodríguez</h3>
                      <p className="text-sm text-brand-text-secondary">Comercial, Málaga</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Mi objetivo era comprar casa en 2 años. Creamos un plan específico: parte en renta fija, parte en bolsa. Va todo según lo previsto, creo que lo voy a conseguir incluso antes 🏠"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 4 días</span>
                  </div>
                </div>
              </div>

              {/* Duplicamos los primeros testimonials para crear loop infinito */}
              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                      CM
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Carlos Mendoza</h3>
                      <p className="text-sm text-brand-text-secondary">Freelancer, Madrid</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Llevaba años sin control de mis finanzas como freelancer. En 2 meses con BSB Capital ya tengo mi fondo de emergencia completo y un plan de inversión que me da tranquilidad. ¡Brutal cómo cambió mi mentalidad financiera! �"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 3 semanas</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      AS
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Ana Sánchez</h3>
                      <p className="text-sm text-brand-text-secondary">Arquitecta, Barcelona</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Tenía mis ahorros en el banco ganando 0%. Después de la consultoría redistribuí todo: ETFs, algo de crypto y renta fija. En 6 meses ya veo resultados reales. Su enfoque es súper profesional 💪"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 1 mes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-brand-green-700 mt-6 italic">
            💡 Pasa el cursor por encima para pausar la animación
          </p>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-900 via-brand-green-800 to-brand-green-900">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              ¿Listo para transformar tu estrategia financiera?
            </h2>
            <BookingModal />
          </div>
        </div>

  
      </motion.div>
    </>
  );
};

export default Consultoria;