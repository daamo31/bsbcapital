import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Loader2, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const MembresiasDB = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const fallbackPlans = [
    {
      id: 'free-access',
      name: 'Free Access',
      price_monthly: 0,
      currency: 'EUR',
      features: ['Newsletter gratuita', 'Acceso limitado al contenido'],
      highlight: false,
      description: 'Para empezar',
      stripe_price_monthly: null
    },
    {
      id: 'trader-plan-pro',
      name: 'Trader Plan Pro',
      price_monthly: 29.99,
      currency: 'EUR',
      features: [
        'Formación completa',
        'Comunidad privada',
        'Señales básicas',
        'Soporte por email'
      ],
      highlight: false,
      description: 'Plan básico',
      stripe_price_monthly: 'price_1SDKO8JmSk3VG9oiCLuGoE4s'
    },
    {
      id: 'premium-membership',
      name: 'Premium Membership',
      price_monthly: 97,
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
      stripe_price_monthly: 'price_premium_monthly'
    },
    {
      id: 'wealth-membership',
      name: 'Wealth Membership',
      price_monthly: 197,
      currency: 'EUR',
      features: [
        'Todo lo anterior',
        'Consultoría 1-1 personalizada',
        'Acceso VIP a eventos',
        'Portfolio management',
        'Soporte 24/7',
        'Acceso anticipado a nuevos productos'
      ],
      highlight: false,
      description: 'Plan completo',
      stripe_price_monthly: 'price_wealth_monthly'
    }
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      console.log('Loading plans from Supabase...');
      
      // Intentar primero con RPC
      let { data, error } = await supabase.rpc('get_available_plans_with_content');
      
      if (error) {
        console.error('Error with RPC function:', error);
        console.log('Trying direct table query...');
        
        // Intentar consulta directa a la tabla subscription_plans
        const { data: tableData, error: tableError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('active', true);
          
        if (tableError) {
          console.error('Error with subscription_plans table:', tableError);
          
          // Intentar con otros nombres de tabla posibles
          const { data: plansData, error: plansError } = await supabase
            .from('plans')
            .select('*');
            
          if (plansError) {
            console.error('Error with plans table:', plansError);
            
            // Intentar con membership_plans
            const { data: membershipData, error: membershipError } = await supabase
              .from('membership_plans')
              .select('*');
              
            if (membershipError) {
              console.error('Error with membership_plans table:', membershipError);
              console.log('All table queries failed, using fallback plans');
              setPlans(fallbackPlans);
              return;
            }
            
            data = membershipData;
            console.log('Data from membership_plans table:', data);
          } else {
            data = plansData;
            console.log('Data from plans table:', data);
          }
        } else {
          data = tableData;
          console.log('Data from subscription_plans table:', data);
        }
      } else {
        console.log('Data from RPC function:', data);
      }
      
      if (error) {
        console.error('Error loading plans from Supabase:', error);
        console.log('Using fallback plans due to Supabase error');
        setPlans(fallbackPlans);
        return;
      }
      
      console.log('Raw data from Supabase:', data);
      
      if (data?.length > 0) {
        // Filtrar planes anuales específicos como "Trader Plan Pro Anual"
        const filteredPlans = data.filter(plan => {
          const planName = plan.name?.toLowerCase() || '';
          const isAnnual = planName.includes('anual') || planName.includes('(anual)');
          if (isAnnual) {
            console.log('Filtering out annual plan:', plan.name);
          }
          return !isAnnual;
        });
        
        console.log('Filtered plans (no annual):', filteredPlans);
        
                // Validar y asegurar que todos los planes tienen los campos necesarios
        const validatedPlans = filteredPlans.map(plan => {
          const validatedPlan = {
            ...plan,
            id: plan.id || plan.plan_id || `plan_${Math.random()}`,
            name: plan.name || plan.plan_name || plan.title || 'Plan sin nombre',
            price_monthly: plan.price_monthly ?? plan.monthly_price ?? plan.price ?? 0,
            currency: plan.currency || 'EUR',
            features: plan.features || 
                     (plan.description?.split(',')) || 
                     (plan.benefits?.split(',')) ||
                     ['Características no disponibles'],
            description: plan.description || plan.plan_description || plan.subtitle || 'Plan disponible',
            highlight: plan.highlight ?? plan.is_popular ?? plan.featured ?? false,
            stripe_price_monthly: plan.stripe_price_monthly || plan.stripe_price_id || plan.price_id
          };
          console.log('Validated plan:', validatedPlan.name, 'Monthly:', validatedPlan.price_monthly, 'Features:', validatedPlan.features);
          return validatedPlan;
        });
        
        if (validatedPlans.length > 0) {
          console.log('Setting Supabase plans:', validatedPlans);
          setPlans(validatedPlans);
        } else {
          console.log('No valid plans found, using fallback');
          setPlans(fallbackPlans);
        }
      } else {
        console.log('No data returned from Supabase, using fallback plans');
        setPlans(fallbackPlans);
      }
    } catch (error) {
      console.error('Error in loadPlans:', error);
      console.log('Using fallback plans due to exception');
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (loadingPlan === plan.id) return;
    setLoadingPlan(plan.id);

    navigate('/checkout', { 
      state: {
        ...plan,
        price: plan.price_monthly,
        duration_months: 1,
        stripe_price_id: plan.stripe_price_monthly,
        billing_cycle: 'monthly'
      }
    });
  };

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

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const currentPrice = plan.price_monthly ?? 0;
            const isLoading = loadingPlan === plan.id;
            
            console.log(`Rendering plan ${plan.name}:`, {
              price_monthly: plan.price_monthly,
              currentPrice,
              currency: plan.currency
            });
            
            return (
              <Card key={plan.id} className={`${plan.highlight ? 'border-primary border-2' : ''} h-full flex flex-col`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-4xl font-bold mb-4">
                    {currentPrice === 0 ? 'Gratis' : `${currentPrice}€`}
                    {currentPrice > 0 && <span className="text-lg">/mes</span>}
                  </div>
                  <ul className="space-y-2">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentPrice === 0 ? 'Gratis' : 'Seleccionar'}
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
                  { name: 'Acceso limitado al contenido', free: true, trader: true, premium: true, wealth: true },
                  { name: 'Formación completa', free: false, trader: true, premium: true, wealth: true },
                  { name: 'Comunidad privada', free: false, trader: true, premium: true, wealth: true },
                  { name: 'Señales de trading', free: false, trader: true, premium: true, wealth: true },
                  { name: 'Análisis de mercado diarios', free: false, trader: false, premium: true, wealth: true },
                  { name: 'Webinars exclusivos', free: false, trader: false, premium: true, wealth: true },
                  { name: 'Consultoría personalizada', free: false, trader: false, premium: false, wealth: true },
                  { name: 'Acceso VIP a eventos', free: false, trader: false, premium: false, wealth: true },
                  { name: 'Soporte 24/7', free: false, trader: false, premium: true, wealth: true }
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
