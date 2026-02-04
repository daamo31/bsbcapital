import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Check, ArrowRight, Loader2, Briefcase, BookOpen, Bot, Users } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

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
      'Estructura de cartera recomendada',
    ],
    highlight: false,
    description: 'Paquete anual - Introducción al ecosistema cripto',
    objective:
      'Introducción al ecosistema cripto, optimización de primeras inversiones y base estratégica de gestión.',
    stripe_price_id: null,
    stripe_price_id_annual: 'price_1SSshWJmSk3VG9oiU1cBNWgf', // Nuevo ID de Stripe
    stripe_product_id: 'prod_TPi7iCVtydt3Cw', // Nuevo ID de producto
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
      'Soporte prioritario',
    ],
    highlight: true,
    description: 'Paquete anual popular',
    objective:
      'Acompañamiento continuo y personalizado para la gestión avanzada de inversiones en cripto y Web3.',
    stripe_price_id: null,
    stripe_price_id_annual: 'price_1SDKb2JmSk3VG9oiJr1unLZZ',
    stripe_product_id: 'prod_T9dspdTkGGM7Sy',
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
    ],
    highlight: false,
    description: 'Paquete anual para empresas',
    objective:
      'Ayudar a empresas a integrar y optimizar su tesorería en activos digitales, con análisis de riesgos, oportunidades y estrategias fiscales eficientes.',
    stripe_price_id: null,
    stripe_price_id_annual: 'price_1SSsfoJmSk3VG9oi70AskCZv', // Nuevo ID de Stripe
    stripe_product_id: 'prod_TPi5l6SK9nwBKF', // Nuevo ID de producto
  },
  {
    id: 'membresia-anual-bsb',
    name: 'Membresía Anual BSB Capital',
    price_monthly: 40,
    price_annual: 400,
    currency: 'EUR',
    features: [
      '20% descuento en BSB Consulting',
      'Acceso a BSB Academy',
      'Acceso prioritario a BSB Maker',
      'Eventos exclusivos',
    ],
    highlight: false,
    description: 'Membresía completa con acceso a comunidad y formación',
    objective: 'Formación continua y acceso a herramientas exclusivas.',
    stripe_price_id: 'price_monthly_placeholder', // Reemplazar con ID real si existe
    stripe_price_id_annual: 'price_annual_placeholder', // Reemplazar con ID real si existe
    stripe_product_id: 'prod_membership_placeholder',
  },
];

const MembresiasDB = () => {
  console.log('🔥🔥🔥 MembresiasDB: Component rendering - VERSION CON FILTROS MEJORADOS 🔥🔥🔥');

  const { user, profile, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [billingCycle] = useState('annual'); // 'monthly' o 'annual' para paquetes
  const [membershipCycle] = useState('annual'); // 'monthly' o 'annual' para membresía

  // 🧪 Detección automática del modo test (como en consultorías)
  // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
  // const isTestMode =
  //   import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  const isTestMode = false; // PRODUCCIÓN: Siempre usar precios reales

  // 🧪 IDs de precios de prueba (€1) - STRIPE DASHBOARD
  // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
  // const TEST_PRICE_IDS = {
  //   package_test: 'price_1SKG4NJmSk3VG9oi6CjvmqLC', // Paquete de prueba €1 (one-time) - Mismo que consultorías
  //   membership_annual_test: 'price_1SKG4NJmSk3VG9oi6CjvmqLC', // Membresía anual €1 (one-time) - Mismo que consultorías
  //   membership_monthly_test: 'price_1ScNpIJmSk3VG9oiYMNPIRXN', // Membresía mensual €1 (recurring) - prod_TZWtvStcgMfmQH
  // };

  // IDs de productos permitidos y excluidos
  const ALLOWED_PRODUCT_IDS = useMemo(
    () => [
      'prod_TPi7iCVtydt3Cw', // Onboarding Cripto
      'prod_T9dspdTkGGM7Sy', // Inversor Premium
      'prod_TPi5l6SK9nwBKF', // Gestión Tesorería Empresas
    ],
    []
  );

  const EXCLUDED_PRODUCT_IDS = useMemo(
    () => [
      'prod_T9dymUXkbPpeir', // Academia
      'prod_TXd41kG8ddpyDP', // Membresía Exclusiva Mensual
      'prod_TXd5JJfHRg8ZTx', // Membresía Exclusiva Anual
    ],
    []
  );

  // Filtrado de planes con useMemo para evitar ciclos de renderizado
  const filteredPlans = useMemo(() => {
    console.log('🔍 Total planes antes de filtrar:', plans.length);
    console.log(
      '🔍 Nombres de todos los planes:',
      plans.map((p) => p.name)
    );

    const filtered = plans.filter((plan) => {
      const planNameLower = plan.name.toLowerCase();

      // PRIMERO: Excluir explícitamente por product ID
      if (plan.stripe_product_id && EXCLUDED_PRODUCT_IDS.includes(plan.stripe_product_id)) {
        console.log('❌ Excluyendo por product_id:', plan.name, plan.stripe_product_id);
        return false;
      }

      // SEGUNDO: Excluir por nombre
      if (planNameLower.includes('academia')) {
        console.log('❌ Excluyendo Academia por nombre:', plan.name);
        return false;
      }

      if (planNameLower.includes('exclusiva') || planNameLower.includes('exclusive')) {
        console.log('❌ Excluyendo Membresía Exclusiva por nombre:', plan.name);
        return false;
      }

      if (planNameLower.includes('membresía') || planNameLower.includes('membresia')) {
        console.log('❌ Excluyendo Membresía por nombre:', plan.name);
        return false;
      }

      // TERCERO: Incluir solo por ID de producto permitido
      if (plan.stripe_product_id && ALLOWED_PRODUCT_IDS.includes(plan.stripe_product_id)) {
        console.log('✅ Incluyendo por product_id:', plan.name, plan.stripe_product_id);
        return plan.price_annual && plan.price_annual > 0;
      }

      // CUARTO: Incluir por nombre (solo paquetes BSB)
      const isOnboarding = planNameLower.includes('onboarding');
      const isInversor = planNameLower.includes('inversor') && planNameLower.includes('premium');
      const isTesoreria =
        (planNameLower.includes('tesorería') || planNameLower.includes('tesoreria')) &&
        planNameLower.includes('empresa');

      if (isOnboarding || isInversor || isTesoreria) {
        console.log('✅ Incluyendo por nombre:', plan.name);
        return plan.price_annual && plan.price_annual > 0;
      }

      console.log('❌ Excluyendo (no coincide con criterios):', plan.name);
      return false;
    });

    console.log('📊 Paquetes filtrados finales:', filtered.length);
    console.log(
      '📊 Nombres filtrados:',
      filtered.map((p) => p.name)
    );

    return filtered;
  }, [plans, ALLOWED_PRODUCT_IDS, EXCLUDED_PRODUCT_IDS]);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading plans from Supabase...');

      // Consulta directa a subscription_plans con las columnas correctas
      const { data, error } = await supabase
        .from('subscription_plans')
        .select(
          `
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
        `
        )
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
        console.log('📋 Raw data from database:', data);

        // Agrupar planes por producto (consolidar mensuales y anuales)
        const planMap = new Map();

        data.forEach((plan) => {
          const productId = plan.stripe_product_id;
          if (!planMap.has(productId)) {
            planMap.set(productId, {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price,
              price_annual: plan.price_annual,
              currency: plan.currency || 'EUR',
              features: Array.isArray(plan.features)
                ? plan.features
                : typeof plan.features === 'string'
                  ? JSON.parse(plan.features)
                  : [],
              highlight: plan.name.includes('Premium') || plan.name.includes('Exclusiva'),
              stripe_price_id: plan.stripe_price_id,
              stripe_price_id_annual: plan.stripe_price_id_annual,
              stripe_product_id: plan.stripe_product_id,
            });
          } else {
            // Si ya existe, combinar los precios
            const existing = planMap.get(productId);
            existing.price_monthly = existing.price_monthly || plan.price;
            existing.price_annual = existing.price_annual || plan.price_annual;
            existing.stripe_price_id = existing.stripe_price_id || plan.stripe_price_id;
            existing.stripe_price_id_annual =
              existing.stripe_price_id_annual || plan.stripe_price_id_annual;
          }
        });

        const consolidatedPlans = Array.from(planMap.values());
        console.log('Consolidated plans:', consolidatedPlans);
        setPlans(consolidatedPlans);
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
      loadPlans().finally(() => {
        isFetching = false;
      });
    }
  }, [loadPlans, loadingAuth]);

  const handleSelectPlan = useCallback(
    async (plan, overrideCycle = null) => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (loadingPlan === plan.id) return;
      setLoadingPlan(plan.id);

      try {
        console.log('🏁 Selecting plan:', plan);

        // Determinar si es membresía o paquete
        const isMembership =
          plan.name.toLowerCase().includes('membresía') ||
          plan.name.toLowerCase().includes('membresia');

        // Usar el ciclo override si se proporciona, si no usar el estado
        const cycle = overrideCycle || (isMembership ? membershipCycle : billingCycle);

        console.log(
          '🔄 Billing cycle:',
          cycle,
          '(Type:',
          isMembership ? 'membership' : 'package',
          ')'
        );

        // Determinar el tipo de plan PRIMERO (antes de usarlo)
        const planNameLower = plan.name.toLowerCase();
        const isPackage =
          planNameLower.includes('onboarding') ||
          planNameLower.includes('inversor') ||
          planNameLower.includes('tesorería') ||
          planNameLower.includes('tesoreria');

        const isMembershipPlan = isMembership && !isPackage;

        // Usar el ciclo de facturación seleccionado
        let priceId = null;

        // 🧪 MODO TEST: Usar precios de prueba de €1 automáticamente en desarrollo
        // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
        // if (isTestMode) {
        //   console.log('🧪 Modo TEST activado - usando precios de €1');
        //
        //   if (isPackage) {
        //     priceId = TEST_PRICE_IDS.package_test;
        //   } else if (isMembershipPlan) {
        //     priceId =
        //       cycle === 'annual'
        //         ? TEST_PRICE_IDS.membership_annual_test
        //         : TEST_PRICE_IDS.membership_monthly_test;
        //   }
        //
        //   console.log('🧪 Price ID de TEST seleccionado:', priceId);
        // } else {
        // Producción: usar precios reales
        if (cycle === 'annual') {
          priceId = plan.stripe_price_id_annual || plan.stripe_price_id;
        } else {
          priceId = plan.stripe_price_id;
        }
        // }

        console.log('🔍 Price detection:', {
          plan_name: plan.name,
          cycle,
          isMembership,
          isPackage,
          isMembershipPlan,
          price_monthly: plan.price_monthly,
          price_annual: plan.price_annual,
          stripe_price_id: plan.stripe_price_id,
          stripe_price_id_annual: plan.stripe_price_id_annual,
          selected_priceId: priceId,
        });

        if (!priceId) {
          console.error('❌ Plan sin precio de Stripe para el ciclo seleccionado:', {
            plan,
            cycle,
          });
          throw new Error(
            `No hay precio de Stripe configurado para el plan ${plan.name} (${cycle}). Por favor, contacta al administrador.`
          );
        }

        // Determinar el mode según el tipo de plan y ciclo
        // - Paquetes (Onboarding, Inversor Premium, Gestión Tesorería): siempre payment (pago único)
        // - Membresías mensuales (Academia, Membresía Exclusiva): subscription (recurrente mensual)
        // - Membresías anuales: payment (pago único anual)

        // Si es paquete o ciclo anual, usar payment. Si es mensual de membresía, usar subscription
        const mode = isPackage || cycle === 'annual' ? 'payment' : 'subscription';

        // Determinar el tipo de acceso correcto
        let accessType = 'membership';
        let purchaseType = 'subscription';

        if (isPackage) {
          accessType = 'package';
          purchaseType = 'package';
        } else if (isMembershipPlan && cycle === 'annual') {
          accessType = 'membership';
          purchaseType = 'membership_annual';
        } else if (isMembershipPlan && cycle === 'monthly') {
          accessType = 'membership';
          purchaseType = 'membership_monthly';
        }

        console.log('💳 Payment mode:', {
          plan_name: plan.name,
          isPackage,
          isMembershipPlan,
          mode,
          cycle,
          accessType,
          purchaseType,
        });

        const checkoutData = {
          priceId: priceId,
          mode: mode,
          userId: user.id,
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
            client_email: user.email,
            client_name: profile?.full_name || user.user_metadata?.full_name || user.email,
            plan_id: plan.id,
            plan_name: plan.name,
            billing_cycle: cycle,
            access_type: accessType,
            purchase_type: purchaseType,
            package_type: isPackage ? 'crypto_package' : 'membership',
            stripe_product_id: plan.stripe_product_id,
          },
        };

        console.log('📤 Sending to create-stripe-checkout:', checkoutData);

        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
          body: checkoutData,
        });

        console.log('📥 Response from create-stripe-checkout:', { data, error });

        if (error) {
          console.error('❌ Supabase function error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            name: error.name,
            context: error.context,
            stack: error.stack,
          });
          throw new Error(`Error de Stripe: ${error.message || 'Error desconocido'}`);
        }

        if (data?.error) {
          console.error('❌ Edge function returned error:', data.error);
          console.error('❌ Full error data:', data);
          throw new Error(data.error);
        }

        // La respuesta debe tener una URL para redirigir a Stripe Checkout
        if (data && data.url) {
          console.log('✅ URL de checkout recibida, redirigiendo...');
          window.location.href = data.url;
        } else {
          console.error('❌ Respuesta sin URL:', data);
          throw new Error('No se recibió URL de checkout de Stripe');
        }
      } catch (error) {
        console.error('❌ Error in handleSelectPlan:', error);

        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoadingPlan(null);
      }
    },
    [user, navigate, loadingPlan, toast, billingCycle, membershipCycle, profile?.full_name]
  );

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
        <meta
          name="description"
          content="Soluciones especializadas en crypto y activos digitales, diseñadas según tu perfil. Encuentra el paquete que mejor se adapte a tus necesidades."
        />
      </Helmet>

      {/* Hero Header - Contenido centrado */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="text-center max-w-5xl mx-auto mb-8 md:mb-12">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-foreground leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Paquetes BSB Capital y Membresía Anual
          </motion.h1>
        </div>
      </div>

      {/* Sección 1: Introducción a Paquetes - Full Width Background */}
      <div className="w-full bg-white py-12 md:py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Paquetes BSB Capital
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Soluciones especializadas en crypto y activos digitales, diseñadas según tu
                  perfil. Encuentra el paquete que mejor se adapte a tus necesidades.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl md:rounded-2xl p-5 md:p-8 shadow-lg border border-border mb-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
                ¿Qué es un Paquete BSB Capital?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
                BSB Capital nace como la primera firma que combina asesoramiento financiero
                independiente con especialización crypto y activos digitales. Nuestros paquetes
                ofrecen un conjunto completo de consultorías, formación y herramientas, pensados
                para corregir los problemas estructurales del sector: falta de rigor, ausencia de
                metodología y poca transparencia.
              </p>

              <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-4">
                Cada paquete está diseñado para guiar a inversores y empresas hacia decisiones
                inteligentes mediante:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg md:rounded-xl border border-brand-green-300">
                  <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    Análisis avanzado y metodología profesional
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg md:rounded-xl border border-brand-gold-300">
                  <Check className="h-5 w-5 text-brand-gold-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    Tecnología especializada en activos digitales
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg md:rounded-xl border border-brand-green-300">
                  <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    Formación integral y acompañamiento continuo
                  </span>
                </div>
                <div className="flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg md:rounded-xl border border-brand-gold-300">
                  <Check className="h-5 w-5 text-brand-gold-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base font-medium text-foreground">
                    Inversores que buscan optimizar su cartera
                  </span>
                </div>
              </div>

              <div className="mt-3 md:mt-4 flex items-start gap-3 bg-background p-3 md:p-4 rounded-lg md:rounded-xl border border-brand-green-300">
                <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base font-medium text-foreground">
                  Empresas que necesitan gestión de tesorería crypto y estructuras corporativas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Paquetes - Contenido centrado */}
      <div className="container mx-auto px-4 mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {filteredPlans.map((plan) => {
            const currentPrice = plan.price_annual;
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: plans.indexOf(plan) * 0.1,
                  type: 'spring',
                  bounce: 0.4,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                  },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`h-full flex flex-col transition-all duration-300 ${
                    plan.highlight
                      ? 'border-brand-gold-600 border-2 md:border-3 shadow-2xl shadow-brand-gold-600/20 relative'
                      : 'border-border border hover:border-brand-green-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-brand-gold-600 hover:bg-brand-gold-700 text-white px-6 py-2 text-sm font-bold shadow-lg">
                        ⭐ Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4 md:pb-6 pt-6 md:pt-8 px-4 md:px-6 bg-gradient-to-br from-brand-green-50 to-white min-h-[180px] md:min-h-[220px] flex flex-col justify-center items-center">
                    <CardTitle
                      className={`font-bold mb-3 text-foreground ${
                        plan.name.length > 25
                          ? 'text-lg sm:text-xl md:text-2xl'
                          : 'text-xl sm:text-2xl md:text-3xl'
                      }`}
                    >
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
                    {/* Precio */}
                    <div className="text-center py-4 md:py-6 px-3 md:px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg md:rounded-xl border border-border shadow-sm min-h-[160px] md:min-h-[200px] flex flex-col justify-center">
                      <div className="flex flex-col items-center justify-center gap-2 mb-2">
                        <div
                          className={`text-4xl sm:text-5xl md:text-6xl font-bold ${
                            plan.highlight ? 'text-brand-gold-600' : 'text-brand-green-600'
                          }`}
                        >
                          €{isTestMode ? '1' : currentPrice || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-wide">
                          {isTestMode ? 'PRUEBA (€1)' : 'Pago anual único'}
                        </div>
                      </div>

                      {/* Mostrar precio original si existe descuento y NO está en modo test */}
                      {!isTestMode && plan.price_original && (
                        <div className="text-xs sm:text-sm text-muted-foreground mt-3">
                          <span className="line-through">€{plan.price_original}</span>
                          <span className="ml-2 text-brand-green-600 font-semibold">
                            / €{plan.id === 'onboarding-crypto' ? '590' : plan.price_original}
                          </span>
                        </div>
                      )}
                      {!isTestMode && plan.id === 'onboarding-crypto' && (
                        <div className="text-xs text-brand-green-600 font-medium mt-1">
                          (antes €500 / €690)
                        </div>
                      )}
                      {isTestMode && (
                        <div className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1 justify-center">
                          🧪 Modo Prueba - Pago real de €1
                        </div>
                      )}
                    </div>

                    {/* Incluye */}
                    <div className="space-y-3 md:space-y-4">
                      <h4 className="font-bold text-base md:text-lg text-foreground flex items-center gap-2 pb-2 border-b border-border">
                        <div
                          className={`w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center ${
                            plan.highlight ? 'bg-brand-gold-600' : 'bg-brand-green-600'
                          }`}
                        >
                          <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                        </div>
                        Incluye:
                      </h4>
                      <ul className="space-y-2 md:space-y-3">
                        {Array.isArray(plan.features)
                          ? plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 md:gap-3">
                                <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm md:text-base text-foreground leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))
                          : null}
                      </ul>
                    </div>

                    {/* Objetivo */}
                    {plan.objective && (
                      <div
                        className={`p-4 md:p-5 rounded-lg md:rounded-xl border ${
                          plan.highlight
                            ? 'bg-brand-gold-50 border-brand-gold-200'
                            : 'bg-brand-green-50 border-brand-green-200'
                        }`}
                      >
                        <h4 className="font-bold text-sm md:text-base text-foreground mb-2 md:mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4 md:h-5 md:w-5 text-brand-green-600" />
                          Objetivo:
                        </h4>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                          {plan.objective}
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="mt-auto p-4 md:p-6 pt-2 md:pt-4">
                    <Button
                      className={`w-full py-4 md:py-6 text-base md:text-lg font-bold shadow-lg transition-all duration-300 ${
                        plan.highlight
                          ? 'bg-brand-gold-600 hover:bg-brand-gold-700 text-white hover:shadow-xl hover:shadow-brand-gold-600/30'
                          : 'hover:shadow-xl'
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Elegir paquete
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sección 2: Membresía BSB Capital - Full Width Background */}
      <div id="membresias-section" className="w-full bg-brand-green-100 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-2 border-brand-gold-200 mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-green-900">
                  Membresía BSB Capital
                </h2>
                <h3 className="text-2xl md:text-3xl font-semibold text-brand-gold-700 mb-6">
                  Tu evolución financiera no termina en una consultoría. Empieza aquí.
                </h3>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-4xl mx-auto">
                  En un entorno donde las oportunidades financieras cambian cada semana, mantenerse
                  al día no es opcional: es la clave para avanzar con seguridad.
                </p>
                <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-4xl mx-auto mt-4 font-medium">
                  La Membresía es tu acceso directo a una comunidad, formación y acompañamiento
                  continuo.
                </p>
              </div>

              {/* Tarjetas de membresía - Mensual y Anual lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
                {/* Tarjeta Mensual */}
                {(() => {
                  const monthlyPlan = plans.find((p) => {
                    const nameLower = p.name.toLowerCase();
                    return (
                      (nameLower.includes('membresía') || nameLower.includes('membresia')) &&
                      nameLower.includes('mensual')
                    );
                  });

                  if (!monthlyPlan) return null;

                  const price = monthlyPlan.price_monthly || monthlyPlan.price || 40;

                  return (
                    <Card className="border-brand-green-400 border-2 shadow-xl">
                      <CardHeader className="text-center pb-4 bg-gradient-to-br from-brand-green-50 to-white">
                        <CardTitle className="text-2xl font-bold text-brand-green-900">
                          Plan Mensual
                        </CardTitle>
                        <CardDescription className="text-base text-gray-700 mt-2">
                          Flexibilidad mes a mes
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="py-6">
                        <div className="text-center mb-4">
                          <div className="text-5xl font-black text-brand-green-600 mb-2">
                            €{price}
                            <span className="text-xl text-gray-600">/mes</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Permanencia: 12 meses</div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-6 pt-0">
                        <Button
                          className="w-full py-5 text-base font-bold bg-brand-green-600 hover:bg-brand-green-700 text-white shadow-lg"
                          onClick={() => handleSelectPlan(monthlyPlan, 'monthly')}
                          disabled={loadingPlan === monthlyPlan.id}
                        >
                          {loadingPlan === monthlyPlan.id ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              Contratar Mensual
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })()}

                {/* Tarjeta Anual */}
                {(() => {
                  const annualPlan = plans.find((p) => {
                    const nameLower = p.name.toLowerCase();
                    return (
                      (nameLower.includes('membresía') || nameLower.includes('membresia')) &&
                      nameLower.includes('anual')
                    );
                  });

                  if (!annualPlan) return null;

                  const price = annualPlan.price_annual || annualPlan.price || 400;

                  return (
                    <Card className="border-brand-gold-600 border-3 shadow-2xl relative">
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-gold-600 text-white px-4 py-1">
                        Recomendado - Ahorra 80€
                      </Badge>
                      <CardHeader className="text-center pb-4 bg-gradient-to-br from-brand-gold-50 to-white pt-8">
                        <CardTitle className="text-2xl font-bold text-brand-green-900">
                          Plan Anual
                        </CardTitle>
                        <CardDescription className="text-base text-gray-700 mt-2">
                          Máximo ahorro
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="py-6">
                        <div className="text-center mb-4">
                          <div className="text-5xl font-black text-brand-gold-600 mb-2">
                            €{price}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Pago único anual</div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-6 pt-0">
                        <Button
                          className="w-full py-5 text-base font-bold bg-brand-gold-600 hover:bg-brand-gold-700 text-white shadow-lg"
                          onClick={() => handleSelectPlan(annualPlan, 'annual')}
                          disabled={loadingPlan === annualPlan.id}
                        >
                          {loadingPlan === annualPlan.id ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              Contratar Anual
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })()}
              </div>
            </div>

            {/* Qué incluye tu membresía */}
            <div className="max-w-6xl mx-auto mb-16">
              <h3 className="text-3xl font-bold text-center mb-10 text-brand-green-900">
                Qué incluye tu membresía
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Beneficio 1 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brand-green-200 hover:border-brand-green-600 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-12 w-12 text-brand-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-green-900 mb-2">
                        20% de descuento en BSB Consulting
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Ahorra en todos nuestros servicios de análisis, planificación y
                        asesoramiento financiero.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Beneficio 2 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brand-gold-200 hover:border-brand-gold-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-12 w-12 text-brand-gold-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-green-900 mb-2">
                        Acceso a la BSB Academy
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed">
                        La plataforma educativa de BSB Capital, especializada en formación crypto,
                        para que aprendas a invertir con confianza y maximices el potencial de tu
                        cartera.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Beneficio 3 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brand-green-200 hover:border-brand-green-600 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Bot className="h-12 w-12 text-brand-green-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-green-900 mb-2">
                        Acceso prioritario a BSB Maker
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Sé el primero en probar nuestro asistente de trading con IA antes de su
                        lanzamiento público.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Beneficio 4 */}
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-brand-gold-200 hover:border-brand-gold-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Users className="h-12 w-12 text-brand-gold-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-green-900 mb-2">
                        Eventos y encuentros exclusivos
                      </h4>
                      <p className="text-base text-gray-700 leading-relaxed">
                        Conecta con expertos del sector y otros inversores de la comunidad.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Sección adicional según especificaciones */}
            <div className="max-w-5xl mx-auto text-center mb-16">
              <div className="bg-white rounded-3xl p-8 md:p-10 mb-8 border-2 border-brand-green-200 shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-brand-green-900 mb-6">
                  Ideal para ti si...
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg text-gray-800 font-medium">
                      Buscas mantenerte actualizado en un sector en constante cambio.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg text-gray-800 font-medium">
                      Valoras el acceso directo a profesionales y a una comunidad activa.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg text-gray-800 font-medium">
                      Quieres formarte y actuar con estrategia, no solo reaccionar ante el mercado.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-1" />
                    <p className="text-base md:text-lg text-gray-800 font-medium">
                      Crees en la educación como la base de la libertad financiera.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 md:p-10 mb-10 border-2 border-brand-gold-200 shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-brand-green-900 mb-4">
                  Tu ventaja competitiva está en la información.
                </h3>
                <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                  La membresía te da algo más que descuentos: te conecta a una red, una guía y un
                  flujo constante de conocimiento que se traduce en mejores decisiones.
                </p>
              </div>

              <Button
                size="lg"
                className="px-10 py-6 text-lg font-bold bg-brand-gold-600 hover:bg-brand-gold-700 text-white shadow-xl"
                onClick={() => {
                  const element = document.getElementById('membresias-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Hazte miembro
              </Button>

              <p className="text-xs text-gray-500 mt-4">Acceso inmediato tras la inscripción.</p>
              <p className="text-xs text-gray-400 mt-2">
                La membresía tiene una duración anual. En caso de pago mensual, se establece una
                permanencia de 12 meses. Los beneficios estarán activos mientras la suscripción esté
                al corriente de pago.
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {/* Información adicional */}
        <div className="container mx-auto px-4">
          <div className="mt-24 bg-white rounded-3xl p-12 border-2 border-brand-green-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-brand-green-900">
                ¿Necesitas ayuda para elegir?
              </h2>
              <p className="text-lg text-brand-green-800 max-w-3xl mx-auto font-medium">
                Cada plan está diseñado para diferentes perfiles y necesidades. Si no estás seguro
                de cuál es el mejor para ti, puedes usar nuestro sistema de recomendación o
                contactarnos directamente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-brand-green-600 text-gray-700 hover:bg-brand-green-600 hover:text-white"
              >
                <a href="/guia-inversion">
                  Encuentra tu plan ideal <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" className="shadow-lg">
                <a href="/consultoria">Hablar con un experto</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MembresiasDB;
