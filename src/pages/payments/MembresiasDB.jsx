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
      description: 'Paquete anual - Introducción al ecosistema cripto',
      objective: 'Introducción al ecosistema cripto, optimización de primeras inversiones y base estratégica de gestión.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_1SSshWJmSk3VG9oiU1cBNWgf', // Nuevo ID de Stripe
      stripe_product_id: 'prod_TPi7iCVtydt3Cw' // Nuevo ID de producto
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
      description: 'Paquete anual popular',
      objective: 'Acompañamiento continuo y personalizado para la gestión avanzada de inversiones en cripto y Web3.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_1SDKb2JmSk3VG9oiJr1unLZZ', // Mismo ID que Wealth Membership
      stripe_product_id: 'prod_T9dspdTkGGM7Sy' // Mismo producto que Wealth Membership
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
      description: 'Paquete anual para empresas',
      objective: 'Ayudar a empresas a integrar y optimizar su tesorería en activos digitales, con análisis de riesgos, oportunidades y estrategias fiscales eficientes.',
      stripe_price_id: null,
      stripe_price_id_annual: 'price_1SSsfoJmSk3VG9oi70AskCZv', // Nuevo ID de Stripe
      stripe_product_id: 'prod_TPi5l6SK9nwBKF' // Nuevo ID de producto
    }
];

const MembresiasDB = () => {
  console.log('MembresiasDB: Component rendering');
  
  const { user, profile, loading: loadingAuth } = useAuth();
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
      
      // Solo usar el precio anual ya que todos los paquetes son de pago único anual
      const priceId = plan.stripe_price_id_annual;
      const billingType = 'annual';

      if (!priceId) {
        throw new Error(`No hay precio disponible para este plan`);
      }
      
      // Usar el mismo patrón exacto que en consultas
      const checkoutData = {
        price_id: priceId, // Usar la variable priceId que contiene stripe_price_id_annual
        mode: 'payment', // Membresías son pagos únicos, no suscripciones
        success_url: `${window.location.origin}/subscription-success`,
        cancel_url: `${window.location.origin}/membresias`,
        email: user.email,
        userId: user.id,
        metadata: {
          plan_id: plan.id,
          user_id: user.id,
          plan_name: plan.name,
          billing_cycle: 'yearly',
          access_type: 'premium',
          package_type: 'individual',
          client_name: profile?.full_name || user.user_metadata?.full_name || user.email
        }
      };

      // Debug log para verificar los valores
      console.log('🔍 Debug client_name values:', {
        'profile.full_name': profile?.full_name,
        'user.user_metadata.full_name': user.user_metadata?.full_name,
        'user.email': user.email,
        'final_client_name': profile?.full_name || user.user_metadata?.full_name || user.email
      });

      console.log('📤 Sending to create-stripe-checkout:', checkoutData);
      console.log('🔍 Detailed checkout data:', {
        price_id: priceId,
        plan_id: plan.id,
        plan_name: plan.name,
        user_email: user.email,
        user_id: user.id
      });

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: JSON.stringify(checkoutData),
      });

      console.log('📥 Response from create-stripe-checkout:', { data, error });
      
      if (error) {
        console.log('🔍 Detailed error analysis:', {
          error_message: error.message,
          error_details: error.details,
          error_hint: error.hint,
          error_code: error.code,
          error_status: error.status,
          full_error: error
        });
      }

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
        <title>Paquetes BSB Capital y Membresía Anual</title>
        <meta name="description" content="Soluciones especializadas en crypto y activos digitales, diseñadas según tu perfil. Encuentra el paquete que mejor se adapte a tus necesidades." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold">
            Paquetes BSB Capital y Membresía Anual
          </h1>
          <div className="text-left max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">1️⃣ Paquetes BSB Capital</h2>
            <p className="text-lg text-gray-600 mb-6">
              Soluciones especializadas en crypto y activos digitales, diseñadas según tu perfil. Encuentra el paquete que mejor se adapte a tus necesidades.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-3">¿Qué es un Paquete BSB Capital?</h3>
              <p className="text-gray-700 mb-4">
                BSB Capital nace como la primera firma que combina asesoramiento financiero independiente con especialización profunda en criptoactivos. Nuestros paquetes ofrecen un conjunto completo de consultorías, formación y herramientas, pensados para corregir los problemas estructurales del sector: falta de rigor, ausencia de metodología y poca transparencia.
              </p>
              
              <div className="space-y-2">
                <p className="text-gray-700">Cada paquete está diseñado para guiar a inversores y empresas hacia decisiones inteligentes mediante:</p>
                <div className="ml-4 space-y-1">
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">📊</span>
                    Análisis avanzado y metodología profesional
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">🎯</span>
                    Tecnología especializada en activos digitales
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">📚</span>
                    Formación integral y acompañamiento continuo
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">📈</span>
                    Inversores que buscan optimizar su cartera
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">🏢</span>
                    Empresas que necesitan gestión de tesorería crypto y estructuras corporativas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const currentPrice = plan.price_annual || 0;
            const isLoading = loadingPlan === plan.id;
            
            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: plans.indexOf(plan) * 0.1,
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 10 
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className={`${plan.highlight ? 'border-primary border-2 relative' : ''} h-full flex flex-col`}>
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
                    <div className="flex flex-col items-center justify-center gap-2 mb-2">
                      <div className="text-4xl font-bold text-primary">€{currentPrice}</div>
                      <div className="text-sm text-gray-600 font-medium">Pago anual único</div>
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
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Seleccionar Plan
                  </Button>
                </CardFooter>
              </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Sección 2: Membresía Anual BSB Capital */}
        <div className="mt-32">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              2️⃣ Membresía Anual BSB Capital
            </h2>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Tu evolución financiera no termina en una consultoría. Empieza aquí.
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              En un entorno donde las oportunidades financieras cambian cada semana, mantenerse al día no es opcional: es la clave para avanzar con seguridad.
              <br />
              La Membresía Anual es tu acceso directo a una comunidad, formación y acompañamiento continuo.
            </p>
          </div>

          {/* Modalidades de pago */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">💳 Modalidades de pago</h3>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Modalidad</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Precio</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Compromiso</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ventajas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Pago único anual</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">400 €</td>
                      <td className="px-6 py-4 text-sm text-gray-600">12 meses</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Acceso inmediato a todos los beneficios y ahorro de 80 € frente al pago mensual.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Pago mensual</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">40 €/mes</td>
                      <td className="px-6 py-4 text-sm text-gray-600">12 meses (permanencia anual)</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Flexibilidad de pago sin perder acceso a los mismos beneficios que el plan anual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Qué incluye tu membresía */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">🎯 Qué incluye tu membresía</h3>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Beneficio</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">20% de descuento en BSB Consulting</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Ahorra en todos nuestros servicios de análisis, planificación y asesoramiento financiero.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Acceso a la BSB Academy</td>
                      <td className="px-6 py-4 text-sm text-gray-600">La plataforma educativa de BSB Capital, especializada en formación crypto, para que aprendas a invertir con confianza y maximices el potencial de tu cartera.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Acceso prioritario a BSB Maker</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Sé el primero en probar nuestro asistente de trading con IA antes de su lanzamiento público.</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Eventos y encuentros exclusivos</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Conecta con expertos del sector y otros inversores de la comunidad.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sección adicional según especificaciones */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔐 Ideal para ti si...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Buscas mantenerte actualizado en un sector en constante cambio.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Valoras el acceso directo a profesionales y a una comunidad activa.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Quieres formarte y actuar con estrategia, no solo reaccionar ante el mercado.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Crees en la educación como la base de la libertad financiera.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Tu ventaja competitiva está en la información.</h3>
              <p className="text-gray-700">
                La membresía te da algo más que descuentos: te conecta a una red, una guía y un flujo constante de conocimiento que se traduce en mejores decisiones.
              </p>
            </div>

            <Button size="lg" className="px-8 py-4 text-lg">
              🔗 Hazte miembro
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              Acceso inmediato tras la inscripción.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              La membresía tiene una duración anual. En caso de pago mensual, se establece una permanencia de 12 meses. 
              Los beneficios estarán activos mientras la suscripción esté al corriente de pago.
            </p>
          </div>
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
            <Button asChild variant="outline" size="lg" className="border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white">
              <a href="/guia-inversion">
                Encuentra tu plan ideal <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg">
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
