import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useMembership } from '@/hooks/useMembership';
import ConsultationPricingCard from '@/components/consultations/ConsultationPricingCard';
import { Crown, Users, TrendingUp, Shield, Zap, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConsultationPricing = () => {
  const { user } = useAuth();
  const { isActive: isMember, loading, getConsultationDiscount, getMembershipBadge } = useMembership();
  const navigate = useNavigate();

  const consultationTypes = [
    {
      durationType: '30_min',
      title: 'Consultoría Express',
      description: 'Ideal para consultas específicas y resolución de dudas puntuales',
      features: [
        'Análisis rápido de tu situación',
        'Respuestas a preguntas específicas',
        'Recomendaciones inmediatas',
        'Seguimiento por email 7 días',
        'Resumen ejecutivo por escrito'
      ],
      popular: false
    },
    {
      durationType: '60_min',
      title: 'Consultoría Completa',
      description: 'Análisis profundo y estrategia personalizada para tus objetivos',
      features: [
        'Análisis completo de tu situación financiera',
        'Estrategia de inversión personalizada',
        'Plan de acción detallado',
        'Herramientas y recursos específicos',
        'Seguimiento por email 14 días',
        'Sesión de seguimiento gratuita (15 min)',
        'Informe detallado por escrito'
      ],
      popular: true
    }
  ];

  const handleBooking = (durationType, pricing) => {
    // Navigate to booking page with selected consultation type
    navigate(`/consultoria/agendar`, {
      state: {
        durationType,
        pricing,
        isMember
      }
    });
  };

  return (
    <>
      <Helmet>
        <title>Consultorías BSB Capital - Precios y Planes</title>
        <meta name="description" content="Agenda tu consultoría de inversión personalizada. Descuentos especiales para miembros." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Consultorías de Inversión Personalizadas
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                Recibe asesoramiento experto adaptado a tu situación financiera y objetivos de inversión
              </p>
              
              {isMember && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-4 py-2 rounded-full">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">¡Como miembro tienes 20% de descuento!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Membership Benefits Banner */}
          {!isMember && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Crown className="h-6 w-6" />
                        ¿Sabías que puedes ahorrar hasta un 20%?
                      </h2>
                      <p className="text-blue-100 text-lg">
                        Con una membresía BSB Capital obtienes descuentos en todas las consultorías
                        además de acceso a contenido exclusivo y herramientas premium.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button 
                        onClick={() => navigate('/membresias')}
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Ver Membresías
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Consultation Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {consultationTypes.map((consultation, index) => (
              <motion.div
                key={consultation.durationType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ConsultationPricingCard
                  durationType={consultation.durationType}
                  title={consultation.title}
                  description={consultation.description}
                  features={consultation.features}
                  popular={consultation.popular}
                  onBooking={handleBooking}
                />
              </motion.div>
            ))}
          </div>

          {/* Process Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">¿Cómo funciona?</CardTitle>
                <p className="text-gray-600">Proceso simple en 4 pasos</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      step: '1',
                      title: 'Selecciona tu consultoría',
                      description: 'Elige entre 30 min o 1 hora según tus necesidades',
                      icon: <Shield className="h-8 w-8 text-blue-600" />
                    },
                    {
                      step: '2', 
                      title: 'Agenda tu cita',
                      description: 'Selecciona fecha y hora que mejor te convenga',
                      icon: <Users className="h-8 w-8 text-green-600" />
                    },
                    {
                      step: '3',
                      title: 'Completa el formulario',
                      description: 'Después del pago, completa tus datos para preparar la sesión',
                      icon: <TrendingUp className="h-8 w-8 text-purple-600" />
                    },
                    {
                      step: '4',
                      title: 'Consultoría personalizada',
                      description: 'Recibe asesoramiento experto y un plan de acción',
                      icon: <Zap className="h-8 w-8 text-orange-600" />
                    }
                  ].map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="flex justify-center mb-4">
                        {step.icon}
                      </div>
                      <div className="mb-2">
                        <Badge variant="outline" className="mb-2">
                          Paso {step.step}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      q: "¿Qué incluye la consultoría?",
                      a: "Análisis personalizado de tu situación, recomendaciones específicas, plan de acción y seguimiento por email."
                    },
                    {
                      q: "¿Cómo funcionan los descuentos de membresía?",
                      a: "Los miembros activos obtienen automáticamente 20% de descuento en todas las consultorías."
                    },
                    {
                      q: "¿Puedo reprogramar mi cita?",
                      a: "Sí, puedes reprogramar hasta 24 horas antes de la consultoría sin costo adicional."
                    },
                    {
                      q: "¿Qué temas puedo consultar?",
                      a: "Inversiones, planificación financiera, gestión de carteras, criptomonedas y estrategias de ahorro."
                    }
                  ].map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-gray-900">{faq.q}</h4>
                      <p className="text-gray-600 text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ConsultationPricing;