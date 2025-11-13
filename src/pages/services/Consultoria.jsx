import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Clock, BarChart3, Briefcase, Globe, Rocket, Quote, ArrowRight, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/feedback/use-toast";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/data-display/calendar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Textarea } from "@/components/ui/forms/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Rne6CJmSk3VG9oipr5fPA32tndC3TFLYHWrENknJ8fcNvIq8A3Nq0KfLdvwkMAyFvgLOWECBpIuzE2THTX4Mb1s00zqHyg0op';

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00",
];

const consultationPrices = {
  "30min": "price_1RtYGsJmSk3VG9oicAWmQ4sN",
  "60min": "price_1RtYFkJmSk3VG9oi8wUdMK5k",
  // Actualizado: IDs de Stripe para prueba en producción
  "test": "price_1SKG4NJmSk3VG9oi6CjvmqLC", // prod_TGnf81ENbBkghj
};

const BookingModal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState();
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: '', email: '', service_interest: '', duration: '', more_info: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSelectChange = (name, value) => setFormData({ ...formData, [name]: value });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const resetForm = () => {
    setCurrentStep(1);
    setDate(null);
    setSelectedTime("");
    setFormData({ name: '', email: '', service_interest: '', duration: '', more_info: '' });
  };

  const isStepValid = (step) => {
    switch(step) {
      case 1: return formData.service_interest && formData.duration;
      case 2: return date;
      case 3: return selectedTime;
      case 4: return formData.name && formData.email;
      default: return true;
    }
  };

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
    const serviceDescription = `${formData.service_interest} (${
      formData.duration === '30min' ? '30 min' : 
      formData.duration === '60min' ? '1 hora' : 
      formData.duration === 'test' ? 'Prueba' : formData.duration
    })`;

    // DEBUG: Log all data before sending
    console.log('🔍 DEBUGGING CONSULTORIA CHECKOUT:', {
      formData,
      priceId,
      bookingDateTime: bookingDateTime.toISOString(),
      consultationPrices
    });

    // Validation before sending
    if (!priceId) {
      console.error('❌ Missing priceId for duration:', formData.duration);
      toast({ 
        variant: "destructive", 
        title: "Error de configuración", 
        description: `No se encontró precio para ${formData.duration}` 
      });
      setLoading(false);
      return;
    }

    // Asegurarnos de que el usuario esté autenticado y tenga un id
    if (!user?.id) {
      console.error('❌ Intento de checkout sin usuario autenticado');
      toast({
        variant: 'destructive',
        title: 'Debes iniciar sesión',
        description: 'Inicia sesión para completar la reserva.'
      });
      setLoading(false);
      // Esperar un momento para que el usuario vea el toast, luego redirigir al login
      setTimeout(() => navigate('/auth/login'), 1200);
      return;
    }

    try {
      const checkoutData = { 
        priceId,
        mode: 'payment',
        email: formData.email,
        userId: user?.id, // <-- Agregamos el userId aquí
        metadata: {
          client_name: formData.name,
          client_email: formData.email,
          consultation_type: formData.service_interest,
          scheduled_at: bookingDateTime.toISOString(),
          duration_minutes: formData.duration === '30min' ? '30' : 
                          formData.duration === '60min' ? '60' : 
                          formData.duration === 'test' ? '5' : '30',
          description: formData.more_info,
          status: 'scheduled',
          // Mantenemos campos originales para compatibilidad
          service: serviceDescription,
          booking_date: bookingDateTime.toISOString(),
          notes: formData.more_info,
        }
      };

      console.log('📤 Sending to create-stripe-checkout:', checkoutData);

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: JSON.stringify(checkoutData),
      });

      console.log('📥 Response from create-stripe-checkout:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(error.message);
      }
      if (data?.error) {
        console.error('❌ Edge function returned error:', data.error);
        throw new Error(data.error);
      }
      if (!data?.sessionId) {
        console.error('❌ No sessionId received:', data);
        throw new Error('No sessionId received from Stripe');
      }

      console.log('✅ Got sessionId:', data.sessionId);

      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        console.error('❌ Stripe redirect error:', stripeError);
        throw new Error(stripeError.message);
      }

    } catch(error) {
      console.error('❌ STRIPE CHECKOUT ERROR:', {
        error,
        message: error.message,
        formData,
        priceId,
        stack: error.stack
      });
      
      toast({
        variant: "destructive",
        title: "Error al procesar el pago", 
        description: `${error.message || "Hubo un problema al redirigirte a la pasarela de pago."} Revisa la consola para más detalles.`,
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="lg">
          📌 Reserva tu consultoría crypto ahora <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Agendar Consultoría</DialogTitle>
          <DialogDescription className="text-center">
            Paso {currentStep} de 4
          </DialogDescription>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </DialogHeader>

        <div className="py-4 min-h-[300px]">
          {/* Step 1: Service & Duration */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-4">¿Qué tipo de consultoría necesitas?</h3>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tema de la consultoría</Label>
                <Select onValueChange={(value) => handleSelectChange('service_interest', value)} value={formData.service_interest}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Optimización de cartera">Optimización de cartera</SelectItem>
                    <SelectItem value="Onboarding cripto">Onboarding cripto</SelectItem>
                    <SelectItem value="Estrategias Crypto & Web3">Estrategias Crypto & Web3</SelectItem>
                    <SelectItem value="Gestión de tesorería cripto para empresas">Gestión de tesorería cripto para empresas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Duración</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={formData.duration === "30min" ? "default" : "outline"}
                    onClick={() => handleSelectChange('duration', '30min')}
                    className={`h-16 flex flex-col ${formData.duration === "30min" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  >
                    <span className="font-semibold">30 min - 200€</span>
                    <span className="text-xs opacity-70">Consulta rápida</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.duration === "60min" ? "default" : "outline"}
                    onClick={() => handleSelectChange('duration', '60min')}
                    className={`h-16 flex flex-col ${formData.duration === "60min" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  >
                    <span className="font-semibold">45 min - 300€</span>
                    <span className="text-xs opacity-70">Consulta completa</span>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.duration === "test" ? "default" : "outline"}
                    onClick={() => handleSelectChange('duration', 'test')}
                    className={`h-16 flex flex-col ${formData.duration === "test" ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted border-border hover:bg-muted/80"}`}
                  >
                    <span className="font-semibold text-xs">Prueba</span>
                    <span className="text-xs opacity-70">Test producción</span>
                  </Button>
                </div>
              </div>
              
              {/* Alerta para prueba de producción */}
              {formData.duration === "test" && (
                <div className="mt-4 p-4 bg-muted border border-border rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-foreground">
                        Modo de Prueba Activado
                      </h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Esta es una consulta de prueba para verificar el flujo de pagos y emails en producción. Duración: 5 minutos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Calendar */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-4">Selecciona una fecha</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(day) => day < new Date(new Date().setDate(new Date().getDate() - 1)) || day.getDay() === 0 || day.getDay() === 6}
                  className="rounded-md border shadow-sm"
                  locale={es}
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Time Selection */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-2">Elige una hora</h3>
              {date && (
                <p className="text-center text-sm text-gray-600 mb-4">
                  {format(date, "EEEE, dd 'de' MMMM", { locale: es })}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTimeSlots.map(time => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="h-12 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    {time}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Personal Info */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-center mb-4">Completa tus datos</h3>
              
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Tema:</span>
                  <span>{formData.service_interest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duración:</span>
                  <span>{
                    formData.duration === "30min" ? "30 minutos" : 
                    formData.duration === "60min" ? "1 hora" : 
                    formData.duration === "test" ? "Prueba (5 min)" : 
                    formData.duration
                  }</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha:</span>
                  <span>{date ? format(date, "dd/MM/yyyy", { locale: es }) : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Hora:</span>
                  <span>{selectedTime}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Tu nombre completo"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="tu@email.com"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="more_info">Información adicional (opcional)</Label>
                  <Textarea 
                    id="more_info" 
                    value={formData.more_info} 
                    onChange={handleChange} 
                    placeholder="Cuéntanos brevemente sobre tu situación o dudas específicas"
                    className="w-full min-h-[80px]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex justify-between w-full">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="flex-1 sm:flex-none"
              >
                Anterior
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="flex-1 sm:flex-none ml-auto"
              >
                Siguiente
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading || !isStepValid(currentStep)}
                className="flex-1 sm:flex-none ml-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Proceder al pago
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "¿Quién puede beneficiarse de la consultoría?",
      answer: "Cualquier persona o empresa interesada en invertir en cripto de forma segura."
    },
    {
      question: "¿Cómo se realiza la consultoría?",
      answer: "Las sesiones son 1:1 online, con duración adaptada a tu necesidad (tenemos dos modalidades: 30 y 60 minutos)."
    },
    {
      question: "¿Puedo contratar solo el Onboarding cripto?",
      answer: "Sí, cada servicio puede contratarse de manera independiente o integrado en una estrategia global."
    },
    {
      question: "¿Qué tipo de soporte incluye?",
      answer: "Soporte por email para resolver dudas sobre el contenido de la consultoría y seguimiento de tu plan. Escríbenos a info@bsbcapital.io."
    },
    {
      question: "¿Cómo protegen mi información?",
      answer: "Todos los datos compartidos son confidenciales y gestionados bajo protocolos de seguridad estrictos."
    }
  ];

  return (
    <section className="py-12 sm:py-20 aurora-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center main-gradient-text mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-brand-text-primary">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-brand-primary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-brand-primary" />
                  )}
                </button>
                {openFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-brand-text-secondary">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Consultoria = () => {
  return (
    <>
      <Helmet>
        <title>BSB Consulting - Consultoría Financiera Especializada en Crypto</title>
        <meta name="description" content="Consultoría financiera especializada en crypto y activos digitales. Navega el mundo crypto con seguridad y aprovecha las oportunidades con BSB Capital." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        {/* Hero Section */}
        <header className="py-12 md:py-32 text-center aurora-background relative overflow-hidden">
          
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-bold main-gradient-text"
              >
                <span className="main-gradient-text">BSB Consulting</span>
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="text-2xl md:text-3xl font-semibold text-foreground mt-4"
              >
                Consultoría Financiera Especializada en Crypto y Activos digitales
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mt-6 text-lg text-muted-foreground max-w-4xl mx-auto"
              >
                El mundo cripto se mueve rápido: nuevas oportunidades, nuevas tecnologías y riesgos que cambian cada día. En BSB Capital, te ayudamos a navegar este universo con seguridad, confianza y control, evitando errores comunes y aprovechando las oportunidades.
              </motion.p>
              
              <div className="mt-8">
                <BookingModal />
              </div>
            </div>
          
        </header>

        {/* Storytelling Section */}
        <div className="aurora-background py-8 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-lg border border-brand-green-200">
                <h3 className="text-2xl font-bold text-brand-green-900 mb-6">Navega el mundo crypto con seguridad</h3>
                <p className="text-xl text-brand-green-900 leading-relaxed mb-4">
                  Imagina que tu cartera es un barco.
                </p>
                <p className="text-lg text-brand-green-800 leading-relaxed mb-4">
                  Algunos confían en el viento; otros esperan a que pase la tormenta.
                </p>
                <p className="text-lg text-brand-green-800 leading-relaxed">
                  En BSB Capital, trazamos la ruta contigo: analizamos tus activos, identificamos riesgos invisibles y diseñamos un plan de acción para que avances con seguridad en el ecosistema cripto y Web3.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metodología Section */}
        <div className="py-12 sm:py-20 aurora-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center main-gradient-text mb-12">
                Nuestro enfoque y metodología:
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">1</div>
                    <h3 className="text-lg font-bold text-brand-text-primary">📝 Completa tu formulario de diagnóstico</h3>
                  </div>
                  <p className="text-brand-text-secondary">Con esta información, en BSB Consulting diseñamos un plan personalizado que te permita avanzar con seguridad en tus inversiones y decisiones financieras.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">2</div>
                    <h3 className="text-lg font-bold text-brand-text-primary">📈 Análisis personalizado de activos y riesgos</h3>
                  </div>
                  <p className="text-brand-text-secondary">Identificamos oportunidades y amenazas invisibles en tu cartera.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">3</div>
                    <h3 className="text-lg font-bold text-brand-text-primary">🧭 Diseño del plan de acción</h3>
                  </div>
                  <p className="text-brand-text-secondary">Estrategias concretas desde wallets y exchanges hasta inversiones en DeFi, NFTs y proyectos Web3.</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">4</div>
                    <h3 className="text-lg font-bold text-brand-text-primary">🔁 Seguimiento y ajustes</h3>
                  </div>
                  <p className="text-brand-text-secondary">Revisiones periódicas para adaptarte a cambios de mercado y nuevas oportunidades.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="py-12 sm:py-20 md:py-32 aurora-background">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center main-gradient-text mb-12">
              Nuestros servicios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-6xl mx-auto">
              <div className="bg-card backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <BarChart3 className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">Optimización de cartera</h3>
                <p className="text-muted-foreground">Optimizamos tus activos digitales para equilibrar rentabilidad y seguridad, integrando cripto de forma estratégica.</p>
              </div>
              <div className="bg-card backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">🪙 Estrategias Crypto & Web3</h3>
                <p className="text-muted-foreground">Te guiamos para aprovechar oportunidades con fundamentos sólidos y control del riesgo.</p>
              </div>
              <div className="bg-card backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <Rocket className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">🚀 Onboarding cripto</h3>
                <p className="text-muted-foreground">Tu puerta de entrada segura al universo crypto. Te acompañamos paso a paso para invertir de forma consciente y segura.</p>
              </div>
              <div className="bg-card backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:border-primary/30">
                <Briefcase className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">🧮 Gestión de tesorería cripto para empresas</h3>
                <p className="text-muted-foreground">Pensado para empresas que ya operan o quieren empezar a operar con activos digitales, este servicio ofrece una gestión profesional para optimizar rendimientos, liquidez y control operativo.</p>
              </div>
            </div>

            {/* Paquetes Section */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg border border-brand-green-200">
                <p className="text-lg text-brand-green-800 text-center leading-relaxed">
                  Si quieres llevar tu inversión en crypto al siguiente nivel, nuestros paquetes y membresía exclusiva ofrecen acceso a consultorías, comunidad exclusiva y análisis avanzado de cartera.
                </p>
                <div className="text-center mt-6">
                  <Button asChild variant="outline" size="lg">
                    <Link to="/membresias">
                      Descubre los paquetes y la membresía exclusiva <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BSB Capital Benefits Section */}
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center main-gradient-text mb-12">
                Beneficios de trabajar con BSB Capital
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-brand-text-primary">Inversión en crypto con seguridad y control del riesgo</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-brand-text-primary">Estrategias personalizadas según tu nivel de experiencia y objetivos</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-brand-text-primary">Acceso a oportunidades emergentes en Web3 y activos digitales</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-brand-text-primary">Evita errores comunes y decisiones impulsivas</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-start p-4 bg-white rounded-lg shadow-sm border md:col-span-2 justify-center"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <p className="text-brand-text-primary">Estrategias adaptadas a tu perfil y estilo de vida</p>
                </motion.div>
              </div>
              
              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <a href="#agendar-sesion">
                    📌 Agenda tu sesión 1:1 <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-green-100 via-brand-green-50 to-brand-green-100">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center main-gradient-text mb-12">Lo que dicen nuestros clientes</h2>
          
            <div className="relative overflow-hidden">
              <div className="flex animate-[scroll_40s_linear_infinite] pause-animation">
                {/* Testimonial 1 */}
                <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
                    <span>⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 3 semanas</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
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

              {/* Testimonial 8 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      PC
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Pedro Caballero</h3>
                      <p className="text-sm text-brand-text-secondary">Abogado, Sevilla</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Como autónomo mis ingresos varían mucho. BSB me ayudó a estructurar un plan adaptado a mi situación: reservas para la época baja y inversiones para cuando sobra. Game changer total 🎯"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 1 semana</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 9 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      LF
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Laura Fernández</h3>
                      <p className="text-sm text-brand-text-secondary">Ejecutiva, Bilbao</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Tenía miedo de invertir en bolsa después de 2008. Me explicaron todo con calma, empezamos poco a poco y ahora tengo una cartera diversificada que me da mucha más confianza 💪"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 2 semanas</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 10 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      RT
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Roberto Torres</h3>
                      <p className="text-sm text-brand-text-secondary">Empresario, Valencia</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Necesitaba optimizar los impuestos de mi empresa. Su asesoramiento fiscal me ha ahorrado miles de euros y además tengo todo más organizado. Súper recomendable 📊"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 3 días</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 11 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      CV
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Carmen Vega</h3>
                      <p className="text-sm text-brand-text-secondary">Profesora, Granada</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Quería empezar a invertir pero no sabía nada. Me explicaron desde lo básico hasta estrategias avanzadas. Ahora entiendo mis inversiones y duermo tranquila 😌"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 10 días</span>
                  </div>
                </div>
              </div>

              {/* Testimonial 12 */}
              <div className="flex-shrink-0 w-72 sm:w-80 mx-2 sm:mx-4">
                <div className="bg-card p-6 rounded-xl shadow-sm border relative h-full">
                  <Quote className="h-8 w-8 text-brand-accent mb-4 opacity-50" />
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      AB
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text-primary">Alejandro Blanco</h3>
                      <p className="text-sm text-brand-text-secondary">Desarrollador, Madrid</p>
                    </div>
                  </div>
                  <p className="text-brand-text-secondary italic">
                    "Trabajo en tech y quería diversificar más allá de las acciones de mi empresa. Me ayudaron a crear un portfolio balanceado. Mi patrimonio ha crecido un 15% este año 🚀"
                  </p>
                  <div className="flex items-center mt-4 text-sm text-brand-text-secondary">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="ml-2">• hace 1 mes</span>
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
            </div>
          </div>
        </div>
        </div>

        {/* FAQs Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <section id="agendar-sesion" className="py-12 sm:py-20 md:py-32 text-center aurora-background">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-2xl sm:text-3xl font-bold main-gradient-text mb-4"
            >
              Da el paso hacia el sector más rentable de los últimos años
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-lg text-brand-text-secondary mb-8 max-w-3xl mx-auto"
            >
              Deja de improvisar en el mundo crypto y empieza a invertir con confianza, estrategia y control del riesgo.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <BookingModal />
              <Button asChild variant="outline" size="lg">
                <a href="mailto:info@bsbcapital.io" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  📌 [Reserva tu consultoría ahora]
                </a>
              </Button>
            </div>
          </div>
        </section>

      </motion.div>
    </>
  );
};

export default Consultoria;