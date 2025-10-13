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
        <title>Consultoría - BSB Capital</title>
        <meta name="description" content="Asesoramiento experto en planificación financiera, creación y optimización de carteras, y crypto/web3." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-4xl font-bold text-brand-text-primary">Consultoría Financiera a Medida</h1>
        <p className="mt-4 text-lg text-brand-text-secondary max-w-2xl mx-auto">Te ayudamos a navegar la complejidad de los mercados con estrategias personalizadas en planificación, carteras y activos digitales.</p>
        
        <BookingModal />

        {/* Enlace temporal para probar el formulario detallado */}
        <div className="mt-6">
          <Link 
            to="/demo/consultation-form" 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            🧪 Probar formulario detallado (Demo)
          </Link>
        </div>

        <div className="mt-12 relative">
            <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-3xl"></div>
            <img  className="relative mx-auto rounded-lg shadow-xl" alt="Dos profesionales discutiendo un gráfico financiero en una tableta con un toque futurista" src="https://images.unsplash.com/photo-1634097537825-b446635b2f7f" />
        </div>
      </motion.div>
    </>
  );
};

export default Consultoria;