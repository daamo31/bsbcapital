import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Loader2, X, Star, Crown, Zap } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';

const MembresiasDB = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingUserSub, setLoadingUserSub] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [email, setEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Planes de fallback para cuando no se pueden cargar de la DB
  const fallbackPlans = [
    {
      id: 'fallback-1',
      name: 'Plan Básico',
      price: 99.99,
      currency: 'USD',
      duration_months: 3,
      features: [
        'Acceso a 5 cursos básicos',
        'Videos de análisis técnico',
        'Soporte por email',
        'Acceso por 3 meses',
        'Certificado de finalización'
      ],
      stripe_price_id: 'price_1SDKO8JmSk3VG9oiCLuGoE4s',
      highlight: false
    },
    {
      id: 'fallback-2',
      name: 'Plan Premium',
      price: 299.99,
      currency: 'USD',
      duration_months: 12,
      features: [
        'Acceso a TODOS los cursos',
        'Videos premium y análisis avanzado',
        'Webinars en vivo mensuales',
        'Soporte prioritario 24/7',
        'Herramientas de trading',
        'Comunidad exclusiva',
        'Acceso por 12 meses',
        'Certificación profesional'
      ],
      stripe_price_id: 'price_1SDKVXJmSk3VG9oiLEm9JOoD',
      highlight: true
    },
    {
      id: 'fallback-3',
      name: 'Plan VIP Lifetime',
      price: 999.99,
      currency: 'USD',
      duration_months: null,
      features: [
        'Acceso ILIMITADO de por vida',
        'TODO el contenido actual y futuro',
        'Mentorías personalizadas 1:1',
        'Sesiones de trading en vivo',
        'Acceso a estrategias exclusivas',
        'Soporte VIP prioritario',
        'Comunidad VIP exclusiva',
        'Revisión de portfolio personal',
        'Señales de trading premium',
        'Sin fecha de expiración'
      ],
      stripe_price_id: 'price_1SDKb2JmSk3VG9oiJr1unLZZ',
      highlight: false
    }
  ];

  // Funcionalidad de base de datos
  useEffect(() => {
    if (!loadedOnce) {
      loadPlans();
      setLoadedOnce(true);
    }
  }, [loadedOnce]);

  useEffect(() => {
    if (user && user.id) {
      loadUserSubscription();
    }
  }, [user?.id]);

  // Debug effect (solo cuando cambian los datos importantes)
  useEffect(() => {
    if (plans?.length > 0) {
      console.log('✅ Planes cargados correctamente:', {
        plansCount: plans?.length,
        loading,
        userSubscription: userSubscription?.status,
        hasUser: !!user,
        plansWithIds: plans?.every(p => p.id)
      });
    }
  }, [plans?.length]);

  const loadPlans = async () => {
    if (loadingPlans) return;
    
    try {
      setLoadingPlans(true);
      console.log('Cargando planes...');
      const { data, error } = await supabase.rpc('get_available_plans_with_content');
      
      if (error) {
        console.error('Error en RPC:', error);
        throw error;
      }
      
      // Si no hay datos de la DB, usar planes de fallback
      if (!data || data.length === 0) {
        console.log('No hay planes en DB, usando fallback');
        setPlans(fallbackPlans);
      } else {
        console.log('Planes de DB cargados:', data.map(p => ({ name: p.name, id: p.id, stripe_price_id: p.stripe_price_id })));
        setPlans(data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      console.log('Usando planes de fallback debido al error');
      setPlans(fallbackPlans);
      
      toast({
        title: "Información",
        description: "Mostrando planes de ejemplo. Los planes reales se cargarán pronto.",
        variant: "default"
      });
    } finally {
      setLoading(false);
      setLoadingPlans(false);
    }
  };

  const loadUserSubscription = async () => {
    if (loadingUserSub || !user?.id) return;
    
    try {
      setLoadingUserSub(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(name, price, currency)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (error) {
        console.error('Error loading user subscription:', error);
        return;
      }

      if (data && data.length > 0) {
        setUserSubscription(data[0]);
      } else {
        setUserSubscription(null);
      }
    } catch (error) {
      console.log('No active subscription found');
      setUserSubscription(null);
    } finally {
      setLoadingUserSub(false);
    }
  };

  const handleSelectPlan = (plan) => {
    console.log('🚀 Plan seleccionado:', plan.name);
    
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingPlan(plan.id);

    const planData = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      description: plan.description,
      features: plan.features,
      duration_months: plan.duration_months,
      stripe_price_id: plan.stripe_price_id
    };
    
    setTimeout(() => {
      console.log('➡️ Navegando a checkout para:', plan.name);
      navigate('/checkout', { state: planData });
      setLoadingPlan(null);
    }, 500);
  };

  const handleNewsletterSubscription = async (userEmail) => {
    try {
      setNewsletterLoading(true);
      // Aquí puedes agregar la lógica para suscribir al newsletter
      toast({
        title: "¡Suscripción exitosa!",
        description: "Te has suscrito a nuestra newsletter gratuita.",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la suscripción.",
        variant: "destructive"
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleNewsletterSubscription(email);
  };

  // Componentes UI del diseño original
  const MembershipCard = ({ plan }) => {
    const isLoading = loadingPlan === plan.id;
    const isSubscribed = userSubscription && userSubscription.subscription_plans?.name === plan.name;
    
    let buttonVariant = plan.highlight ? 'default' : 'outline';
    let buttonClassName = "w-full relative z-10";

    if (plan.name.toLowerCase().includes('premium')) {
      buttonVariant = 'default';
    } else if (plan.name.toLowerCase().includes('wealth')) {
      buttonClassName += " bg-black text-white hover:bg-gray-800";
      buttonVariant = 'default';
    }

    return (
      <Card className={`flex flex-col glass-card ${plan.highlight ? 'border-primary border-2 shadow-lg shadow-primary/20' : ''} ${isSubscribed ? 'bg-green-50 border-green-500' : ''}`}>
        <CardHeader>
          <CardTitle className="text-brand-text-primary">
            {plan.name}
            {isSubscribed && <Badge className="ml-2 bg-green-500">Activa</Badge>}
          </CardTitle>
          <CardDescription className="text-brand-text-secondary">
            {plan.duration_months === null ? 'Acceso de por vida' : 
             plan.duration_months === 12 ? 'Pago anual' : 
             plan.duration_months === 3 ? 'Pago trimestral' : 'Pago mensual'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <ul className="space-y-3 text-brand-text-secondary flex-grow">
            {plan.features && plan.features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <p className="text-4xl font-bold mt-6 text-brand-text-primary">
            {plan.price} {plan.currency}
            {plan.duration_months === null ? '' : 
             plan.duration_months === 1 ? '/mes' : 
             plan.duration_months === 3 ? '/trimestre' :
             plan.duration_months === 12 ? '/año' : ''}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className={buttonClassName} 
            variant={buttonVariant} 
            onMouseUp={() => {
              console.log('🔥 Button clicked:', plan.name);
              console.log('🔍 Button disabled state:', isLoading || isSubscribed);
              console.log('🔍 isLoading:', isLoading, 'isSubscribed:', isSubscribed);
              if (!isLoading && !isSubscribed) {
                handleSelectPlan(plan);
              } else {
                console.log('❌ Button is disabled, not executing');
              }
            }}
            onMouseDown={() => console.log('🖱️ Mouse down en botón:', plan.name)}
            disabled={isLoading || isSubscribed}
            style={{ pointerEvents: 'auto', zIndex: 10 }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isSubscribed ? (
              'Plan Activo'
            ) : (
              'Seleccionar Plan'
            )}
            {!isLoading && !isSubscribed && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const MembershipQuiz = ({ onResult }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});

    const handleAnswer = (question, answer) => {
      const newAnswers = { ...answers, [question]: answer };
      setAnswers(newAnswers);
      if (step < 3) {
        setStep(step + 1);
      } else {
        calculateResult(newAnswers);
      }
    };

    const calculateResult = (finalAnswers) => {
      const { objetivo, experiencia, implicacion } = finalAnswers;
      let result = plans.find(p => p.name.toLowerCase().includes('basic')) || plans[0];
      
      if (objetivo === 'trading' && experiencia === 'intermedio' && implicacion === 'alta') {
        result = plans.find(p => p.name.toLowerCase().includes('trader') || p.name.toLowerCase().includes('pro')) || plans[1];
      } else if (objetivo === 'inversion' && experiencia !== 'principiante' && implicacion !== 'baja') {
        result = plans.find(p => p.name.toLowerCase().includes('premium')) || plans[2];
      } else if (objetivo === 'patrimonio' && implicacion === 'media') {
        result = plans.find(p => p.name.toLowerCase().includes('wealth') || p.name.toLowerCase().includes('elite')) || plans[3];
      }
      
      onResult(result?.name || 'Plan Básico');
    };

    const questions = [
      {
        id: 1,
        question: '¿Cuál es tu principal objetivo financiero?',
        options: [
          { value: 'trading', label: 'Generar ingresos con trading activo' },
          { value: 'inversion', label: 'Construir una cartera a largo plazo' },
          { value: 'patrimonio', label: 'Gestionar y hacer crecer un patrimonio elevado' },
          { value: 'aprender', label: 'Aprender los fundamentos de la inversión' },
        ],
        name: 'objetivo'
      },
      {
        id: 2,
        question: '¿Cuál es tu nivel de experiencia en los mercados?',
        options: [
          { value: 'principiante', label: 'Estoy empezando' },
          { value: 'intermedio', label: 'Tengo conocimientos y algo de experiencia' },
          { value: 'avanzado', label: 'Opero o invierto de forma regular' },
        ],
        name: 'experiencia'
      },
      {
        id: 3,
        question: '¿Qué nivel de implicación buscas?',
        options: [
          { value: 'alta', label: 'Quiero herramientas y formación para gestionar yo mismo' },
          { value: 'media', label: 'Busco asesoramiento y co-gestión con expertos' },
          { value: 'baja', label: 'Prefiero mantenerme informado y aprender a mi ritmo' },
        ],
        name: 'implicacion'
      },
    ];

    const currentQuestion = questions.find(q => q.id === step);

    return (
      <div className="bg-card p-8 rounded-xl shadow-lg border">
        <h3 className="text-2xl font-bold text-center mb-6">Paso {step} de {questions.length}</h3>
        <p className="text-lg text-center mb-8">{currentQuestion.question}</p>
        <RadioGroup onValueChange={(value) => handleAnswer(currentQuestion.name, value)} className="space-y-4">
          {currentQuestion.options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${currentQuestion.name}-${option.value}`} />
              <Label htmlFor={`${currentQuestion.name}-${option.value}`} className="text-base">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  // Crear tabla de comparación basada en los planes de la DB (optimizado)
  const comparisonFeatures = useMemo(() => {
    if (plans.length === 0) return [];
    
    return [
      { feature: 'Newsletter', plans: plans.reduce((acc, plan) => ({ ...acc, [plan.name]: true }), {}) },
      { feature: 'Acceso BSB Maker', plans: plans.reduce((acc, plan) => ({ ...acc, [plan.name]: plan.name.toLowerCase().includes('trader') || plan.name.toLowerCase().includes('pro') }), {}) },
      { feature: 'Acceso Formación', plans: plans.reduce((acc, plan) => ({ ...acc, [plan.name]: !plan.name.toLowerCase().includes('free') && !plan.name.toLowerCase().includes('basic') }), {}) },
      { feature: 'Comunidad Privada', plans: plans.reduce((acc, plan) => ({ ...acc, [plan.name]: plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('wealth') }), {}) },
      { feature: 'Soporte Premium', plans: plans.reduce((acc, plan) => ({ ...acc, [plan.name]: plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('wealth') }), {}) },
    ];
  }, [plans]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p>Cargando planes de membresía...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Membresías - BSB Capital</title>
        <meta name="description" content="Elige la membresía de BSB Capital que mejor se adapte a tus necesidades de inversión y trading." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-brand-text-primary">
            Elige tu camino hacia el <span className="main-gradient-text">éxito financiero</span>
          </h1>
          <p className="mt-6 text-lg text-brand-text-secondary">
            Tenemos un plan para cada tipo de inversor. Desde el que empieza a explorar hasta el que busca una gestión patrimonial de élite.
          </p>
          {plans.length > 0 && (
            <Button size="lg" className="mt-8" onClick={() => setShowQuiz(!showQuiz)}>
              {showQuiz ? 'Ocultar Guía' : 'Descubrir mi Membresía Ideal'}
            </Button>
          )}
        </div>

        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-16 max-w-2xl mx-auto"
          >
            {!quizResult ? (
              <MembershipQuiz onResult={setQuizResult} />
            ) : (
              <div className="bg-card p-8 rounded-xl shadow-lg border text-center">
                <h3 className="text-2xl font-bold">Tu membresía ideal es...</h3>
                <p className="text-4xl font-bold main-gradient-text my-4">{quizResult}</p>
                <p className="text-brand-text-secondary mb-6">Este plan parece el más adecuado para tus objetivos y nivel de experiencia.</p>
                <Button onClick={() => { setQuizResult(null); setShowQuiz(false); }}>Ver todos los planes</Button>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <MembershipCard key={plan.id} plan={plan} />
          ))}
          {plans.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <h3 className="text-xl font-semibold text-brand-text-primary mb-4">
                No hay planes disponibles
              </h3>
              <p className="text-brand-text-secondary">
                Los planes de membresía se están configurando. Vuelve pronto.
              </p>
            </div>
          )}
        </div>
        
        {plans.length > 0 ? (
          <div className="mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-text-primary mb-12">Tabla Comparativa</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 bg-card text-lg font-semibold">Beneficio</th>
                    {plans.map(plan => (
                      <th key={plan.id} className={`p-4 bg-card text-center font-semibold ${plan.highlight ? 'text-primary' : ''}`}>
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map(({ feature, plans: planFeatures }) => (
                    <tr key={feature} className="border-b border-border">
                      <td className="p-4 font-medium">{feature}</td>
                      {plans.map(plan => (
                        <td key={plan.id} className="p-4 text-center">
                          {typeof planFeatures[plan.name] === 'boolean' ? (
                            planFeatures[plan.name] ? 
                              <Check className="h-6 w-6 text-green-500 mx-auto" /> : 
                              <X className="h-6 w-6 text-red-500 mx-auto" />
                          ) : (
                            <span className="font-semibold">{planFeatures[plan.name]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="mt-24 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text-primary mb-6">Comparativa de Planes</h2>
              <p className="text-brand-text-secondary">
                La tabla comparativa aparecerá cuando los planes estén disponibles.
              </p>
            </div>
          )
        )}

        <div className="mt-24 max-w-2xl mx-auto text-center bg-card p-8 rounded-xl shadow-lg border">
          <h2 className="text-3xl font-bold text-brand-text-primary">Empieza con Free Access</h2>
          <p className="mt-4 text-brand-text-secondary">Recibe nuestra newsletter gratuita con análisis y reflexiones financieras para empezar a conocernos.</p>
          <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              id="newsletter-input"
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={newsletterLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Suscribirme gratis'}
            </Button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default MembresiasDB;