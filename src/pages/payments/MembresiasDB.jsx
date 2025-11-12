import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/feedback/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Nuevos planes especializados en crypto
const fallbackPlans = [
    {
      id: 'onboarding-crypto',
      name: 'Onboarding Cripto',
      price_monthly: null, // No tiene mensual
      price_annual: 390,
      price_original: 500, // Precio original para mostrar descuento
      currency: 'EUR',
      features: [
        '2 consultorías personalizadas (1h cada una)',
        'Acceso anual a BSB Academy',
        'Dossier de buenas prácticas',
        'Estructura de cartera recomendada'
      ],
      highlight: false,
      description: 'Introducción al ecosistema cripto',
      objective: 'Introducción al ecosistema cripto, optimización de primeras inversiones y base estratégica de gestión.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_onboarding_crypto_390' // Usar el mismo ID que tienes en BD
    },
    {
      id: 'inversor-premium',
      name: 'Inversor Premium',
      price_monthly: null, // Solo anual
      price_annual: 2400,
      currency: 'EUR',
      features: [
        '6 consultorías personalizadas (1h cada una)',
        'Revisión completa de cartera semestral',
        'Plan estratégico anual adaptado al perfil inversor',
        'Comunidad y acceso exclusivo',
        'Canal privado en WhatsApp / Telegram',
        'Soporte prioritario'
      ],
      highlight: true,
      description: 'Plan popular - Anual',
      objective: 'Acompañamiento continuo y personalizado para la gestión avanzada de inversiones en cripto y Web3.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_inversor_premium_2400' // Usar el mismo ID que tienes en BD
    },
    {
      id: 'gestion-tesoreria-empresas',
      name: 'Gestión Tesorería Cripto para Empresas',
      price_monthly: null, // No tiene mensual
      price_annual: 1200,
      currency: 'EUR',
      features: [
        '2 consultorías personalizadas (1h cada una)',
        'Plan de tesorería y estructura de cartera corporativa',
        'Seguimiento mensual (6 meses)',
        'Renovación mensual: €80/mes'
      ],
      highlight: false,
      description: 'Para empresas',
      objective: 'Ayudar a empresas a integrar y optimizar su tesorería en activos digitales, con análisis de riesgos, oportunidades y estrategias fiscales eficientes.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_gestion_tesoreria_1200' // Usar el mismo ID que tienes en BD
    }
];

const MembresiasDB = () => {
  console.log('MembresiasDB: Component rendering');
  
  const { user, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading plans from Supabase...');
      
      // Consulta directa a subscription_plans con las columnas correctas
      const { data, error } = await supabase
        .from('subscription_plans')
        .select(`
          id,
          name,
          description,
          price,
          price_annual,
          currency,
          stripe_price_id,
          stripe_price_id_annual,
          stripe_product_id,
          features,
          is_active,
          duration_months
        `)
        .eq('is_active', true)
        .order('price', { ascending: true });
      
      console.log('Response from subscription_plans:', { data, error });
      
      if (error) {
        console.error('Error loading plans from Supabase:', error);
        console.log('Using fallback plans due to Supabase error');
        setPlans(fallbackPlans);
        return;
      }
      
      if (data?.length > 0) {
        // Mapear los datos de Supabase al formato esperado por el frontend
        const mappedPlans = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price_monthly: plan.price,
          price_annual: plan.price_annual,
          currency: plan.currency || 'EUR',
          features: Array.isArray(plan.features) ? plan.features : 
                   (typeof plan.features === 'string' ? JSON.parse(plan.features) : []),
          highlight: plan.name === 'Premium Investor', // Destacar el plan premium
          stripe_price_id: plan.stripe_price_id,
          stripe_price_id_annual: plan.stripe_price_id_annual,
          stripe_product_id: plan.stripe_product_id
        }));
        
        console.log('Mapped plans from database:', mappedPlans);
        setPlans(mappedPlans);
      } else {
        console.log('No plans found in database, using fallback');
        setPlans(fallbackPlans);
      }
    } catch (error) {
      console.error('Error in loadPlans:', error);
      console.log('Using fallback plans due to exception');
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loadingAuth) return;
    let isFetching = false;
    if (!isFetching) {
      isFetching = true;
      loadPlans().finally(() => { isFetching = false; });
    }
    // No dependas de loadingData para evitar bucles
  }, [loadPlans, loadingAuth]);

  const handleSelectPlan = useCallback(async (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (loadingPlan === plan.id) return;
    setLoadingPlan(plan.id);

    try {
      console.log('🏁 Selecting plan:', plan);
      
      // Solo usar el precio anual ya que todos los planes son únicos
      const priceId = plan.stripe_price_id_annual;
      const billingType = 'annual';

      if (!priceId) {
        throw new Error(`No hay precio disponible para este plan`);
      }
      
      // Usar el mismo patrón exacto que en consultas
      const checkoutData = { 
        priceId,
        mode: 'payment', // Cambiar a payment para compras únicas
        email: user.email,
        userId: user.id,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          billing_cycle: billingType,
          user_id: user.id,
          access_type: 'package',
          package_type: plan.id
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
      console.log('🚀 Redirecting to Stripe...');

      // Redirigir a Stripe con el sessionId
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        console.error('❌ Stripe redirect error:', stripeError);
        throw new Error(stripeError.message);
      }

    } catch (error) {
      console.error('❌ Error in handleSelectPlan:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  }, [user, navigate, loadingPlan, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Planes y Paquetes - BSB Capital</title>
        <meta name="description" content="Descubre nuestros planes especializados en crypto: Onboarding Cripto, Inversor Premium y Gestión de Tesorería para Empresas." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold">
            📦 Planes y Paquetes — <span className="main-gradient-text">BSB Capital</span>
          </h1>
          <p className="text-lg text-gray-600 mt-6">
            Soluciones especializadas en crypto y activos digitales diseñadas para tu perfil: persona, inversor avanzado o empresa.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const currentPrice = plan.price_annual || plan.price_monthly || 0;
            const isLoading = loadingPlan === plan.id;
            
            return (
              <Card key={plan.id} className={`${plan.highlight ? 'border-primary border-2 relative' : ''} h-full flex flex-col`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">Más Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-4xl font-bold text-primary">€{currentPrice}</div>
                    </div>
                    
                    {/* Mostrar precio original si existe descuento */}
                    {plan.price_original && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">€{plan.price_original}</span>
                        <span className="ml-2 text-green-600 font-medium">
                          / €{plan.id === 'onboarding-crypto' ? '590' : plan.price_original}
                        </span>
                      </div>
                    )}
                    {plan.id === 'onboarding-crypto' && (
                      <div className="text-xs text-green-600 mt-1">
                        (antes €500 / €690)
                      </div>
                    )}
                  </div>

                  {/* Incluye */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Incluye:</h4>
                    <ul className="space-y-2">
                      {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      )) : null}
                    </ul>
                  </div>

                  {/* Objetivo */}
                  {plan.objective && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Objetivo:</h4>
                      <p className="text-sm text-gray-700">{plan.objective}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Seleccionar Plan
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-24 bg-gray-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda para elegir?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cada plan está diseñado para diferentes perfiles y necesidades. Si no estás seguro de cuál es el mejor para ti, 
              puedes usar nuestro sistema de recomendación o contactarnos directamente.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <a href="/guia-inversion">
                Encuentra tu plan ideal <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
              <a href="/consultoria">
                Hablar con un experto
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembresiasDB;
