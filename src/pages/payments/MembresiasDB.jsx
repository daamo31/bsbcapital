import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Check, ArrowRight, Loader2, X } from 'lucide-react';
import { useToast } from "@/components/ui/feedback/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Mover fallbackPlans fuera del componente para evitar recrearlo en cada render
const fallbackPlans = [
    {
      id: 'free-access',
      name: 'Free Access',
      price_monthly: 0,
      price_annual: 0,
      currency: 'EUR',
      features: ['Newsletter gratuita', 'Acceso limitado al contenido', 'Comunidad básica'],
      highlight: false,
      description: 'Para empezar',
      stripe_price_id: null,
      stripe_price_id_annual: null
    },
    {
      id: 'trader-plan-pro',
      name: 'Trader Plan Pro',
      price_monthly: 29.99,
      price_annual: 299.99,
      currency: 'EUR',
      features: [
        'Formación completa',
        'Comunidad privada',
        'Señales básicas',
        'Soporte por email'
      ],
      highlight: false,
      description: 'Plan básico',
      stripe_price_id: 'price_1SDKO8JmSk3VG9oiCLuGoE4s',
      stripe_price_id_annual: 'price_1SDKQZJmSk3VG9oiGudek18k'
    },
    {
      id: 'premium-investor',
      name: 'Premium Investor',
      price_monthly: 97,
      price_annual: 999.99,
      currency: 'EUR',
      features: [
        'Todo lo anterior',
        'Análisis de mercado diarios',
        'Señales premium',
        'Webinars exclusivos',
        'Soporte prioritario'
      ],
      highlight: true,
      description: 'Plan popular',
      stripe_price_id: 'price_1SDKTKJmSk3VG9oiBTv0HaYK',
      stripe_price_id_annual: 'price_1SDKVXJmSk3VG9oiLEm9JOoD'
    },
    {
      id: 'wealth-membership',
      name: 'Wealth Membership',
      price_monthly: null, // No hay mensual
      price_annual: 2007,
      currency: 'EUR',
      features: [
        'Todo lo anterior',
        'Consultoría 1-1 personalizada',
        'Portfolio management',
        'Soporte 24/7',
        'Acceso anticipado a nuevos productos'
      ],
      highlight: false,
      description: 'Plan completo (solo anual)',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_1SDKb2JmSk3VG9oiJr1unLZZ'
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
  const [isAnnual, setIsAnnual] = useState(false); // Estado para toggle mensual/anual
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
      console.log('💰 Billing type:', isAnnual ? 'annual' : 'monthly');
      
      // Determinar el precio correcto según la selección
      let priceId, billingType;
      if (isAnnual && plan.stripe_price_id_annual) {
        priceId = plan.stripe_price_id_annual;
        billingType = 'annual';
      } else {
        priceId = plan.stripe_price_id || plan.stripe_price_monthly;
        billingType = 'monthly';
      }

      if (!priceId) {
        throw new Error(`No hay precio ${billingType} disponible para este plan`);
      }
      
      // Usar el mismo patrón exacto que en consultas
      const checkoutData = { 
        priceId,
        mode: 'subscription',
        email: user.email,
        userId: user.id,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          billing_cycle: billingType,
          user_id: user.id,
          access_type: 'membership'
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
  }, [user, navigate, loadingPlan, isAnnual, toast]);

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
        <title>Membresías - BSB Capital</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold">
            Elige tu camino hacia el <span className="main-gradient-text">éxito financiero</span>
          </h1>
          <p className="text-lg text-gray-600 mt-4">
            Planes mensuales diseñados para tu crecimiento financiero
          </p>
        </div>

        {/* Toggle Mensual/Anual */}
        <div className="flex justify-center mt-8 mb-12">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Ahorra 15%
              </span>
            </button>
          </div>
        </div>

                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {plans.map((plan) => {
            // Calcular el precio correcto según la selección
            const monthlyPrice = plan.price_monthly ?? 0;
            const annualPrice = plan.price_annual ?? 0;
            const currentPrice = isAnnual && annualPrice > 0 ? annualPrice : monthlyPrice;
            const hasAnnualOption = annualPrice > 0 && (plan.stripe_price_id_annual || plan.stripe_price_annual);
            const isLoading = loadingPlan === plan.id;
            
            // Calcular descuento anual si existe
            const annualDiscount = hasAnnualOption && monthlyPrice > 0 
              ? Math.round((1 - (annualPrice / (monthlyPrice * 12))) * 100)
              : 0;
            
            return (
              <Card key={plan.id} className={`${plan.highlight ? 'border-primary border-2' : ''} h-full flex flex-col`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4">
                    {currentPrice === 0 ? 'Gratis' : `${currentPrice}€`}
                    {currentPrice > 0 && (
                      <span className="text-lg">
                        {isAnnual ? '/año' : '/mes'}
                      </span>
                    )}
                  </div>
                  
                  {/* Mostrar precio original y descuento si es anual */}
                  {isAnnual && hasAnnualOption && monthlyPrice > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 line-through">
                        {(monthlyPrice * 12).toFixed(2)}€/año
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Ahorras {annualDiscount}% ({((monthlyPrice * 12) - annualPrice).toFixed(2)}€)
                      </div>
                    </div>
                  )}
                  
                  {/* Mensaje si no hay opción anual */}
                  {isAnnual && !hasAnnualOption && currentPrice > 0 && (
                    <div className="mb-4 text-sm text-gray-500">
                      Solo disponible mensualmente
                    </div>
                  )}
                  
                  <ul className="space-y-2">
                    {Array.isArray(plan.features) ? plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    )) : null}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading || (isAnnual && !hasAnnualOption && currentPrice > 0)}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentPrice === 0 ? 'Gratis' : 
                     (isAnnual && !hasAnnualOption && currentPrice > 0) ? 'No disponible' :
                     'Seleccionar'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Tabla Comparativa */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compara todos los planes</h2>
            <p className="text-lg text-gray-600">Encuentra el plan perfecto para ti</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-6 font-semibold text-gray-900">Características</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center p-6">
                      <div className={`font-semibold ${plan.highlight ? 'text-primary' : 'text-gray-900'}`}>
                        {plan.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {plan.price_monthly === 0 ? 'Gratis' : `${plan.price_monthly}€/mes`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Newsletter gratuita', free: true, trader: true, premium: true, wealth: true },
                  { name: 'BSB Marker', free: false, trader: true, premium: true, wealth: true },
                  { name: 'Formación completa', free: false, trader: true, premium: false, wealth: true },
                  { name: 'Comunidad privada', free: false, trader: false, premium: true, wealth: true },
                  { name: 'Análisis de mercado', free: false, trader: false, premium: true, wealth: true },
                  { name: 'Webinars exclusivos', free: false, trader: true, premium: true, wealth: true },
                  { name: 'Consultoría personalizada', free: false, trader: false, premium: false, wealth: true },
                  { name: 'Soporte 24/7', free: false, trader: false, premium: false, wealth: true }
                ].map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-6 font-medium text-gray-900">{feature.name}</td>
                    {plans.map((plan) => {
                      let hasFeature = false;
                      const planName = plan.name.toLowerCase();
                      
                      if (planName.includes('free')) hasFeature = feature.free;
                      else if (planName.includes('trader') || planName.includes('pro')) hasFeature = feature.trader;
                      else if (planName.includes('premium')) hasFeature = feature.premium;
                      else if (planName.includes('wealth')) hasFeature = feature.wealth;
                      
                      return (
                        <td key={plan.id} className="p-6 text-center">
                          {hasFeature ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembresiasDB;
