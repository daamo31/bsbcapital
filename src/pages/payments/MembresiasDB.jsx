import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Zap, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const MembresiasDB = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase.rpc('get_available_plans_with_content');
      if (error) throw error;
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de membresía",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    try {
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
    }
  };

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingPlan(plan.id);
    
    // Redirigir al checkout con el plan seleccionado
    setTimeout(() => {
      navigate('/checkout', {
        state: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          description: plan.description,
          features: plan.features,
          duration_months: plan.duration_months,
          stripe_price_id: plan.stripe_price_id
        }
      });
      setLoadingPlan(null);
    }, 500);
  };

  const getPlanIcon = (planName) => {
    if (planName.toLowerCase().includes('básico')) return <Zap className="h-6 w-6" />;
    if (planName.toLowerCase().includes('premium')) return <Star className="h-6 w-6" />;
    if (planName.toLowerCase().includes('vip')) return <Crown className="h-6 w-6" />;
    return <Check className="h-6 w-6" />;
  };

  const getPlanBadge = (plan) => {
    if (plan.name.toLowerCase().includes('vip')) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Más Popular</Badge>;
    }
    if (plan.name.toLowerCase().includes('premium')) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Recomendado</Badge>;
    }
    return null;
  };

  const getPlanColorScheme = (index) => {
    const schemes = [
      { bg: 'bg-green-100', text: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' },
      { bg: 'bg-blue-100', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' },
      { bg: 'bg-purple-100', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' }
    ];
    return schemes[index % schemes.length];
  };

  const isCurrentPlan = (plan) => {
    return userSubscription?.subscription_plans?.name === plan.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Cargando planes de membresía...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Helmet>
        <title>Planes de Membresía - BSB Capital</title>
        <meta name="description" content="Elige el plan que mejor se adapte a tus objetivos de trading. Acceso inmediato a todo el contenido después del pago." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes de Membresía
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus objetivos de trading. 
            Acceso inmediato a todo el contenido después del pago.
          </p>
        </motion.div>

        {/* Current Subscription Alert */}
        {userSubscription && (
          <motion.div 
            className="mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Suscripción Activa: {userSubscription.subscription_plans.name}
                    </h3>
                    <p className="text-green-600">
                      {userSubscription.expires_at 
                        ? `Expira el ${new Date(userSubscription.expires_at).toLocaleDateString()}`
                        : 'Acceso de por vida'
                      }
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">Activa</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const colorScheme = getPlanColorScheme(index);
            const isHighlighted = index === 1;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className={`relative transition-all duration-300 hover:shadow-xl h-full flex flex-col ${
                    isHighlighted ? 'scale-105 border-blue-500 shadow-lg' : 'hover:scale-105'
                  } ${isCurrentPlan(plan) ? 'ring-2 ring-green-500' : ''}`}
                >
                  {/* Popular Badge */}
                  {getPlanBadge(plan) && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      {getPlanBadge(plan)}
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${colorScheme.bg} ${colorScheme.text}`}>
                        {getPlanIcon(plan.name)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl font-bold">
                      {plan.name}
                    </CardTitle>
                    
                    <div className="text-center py-4">
                      <div className="text-4xl font-bold text-gray-900">
                        ${plan.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {plan.duration_months 
                          ? `${plan.currency} / ${plan.duration_months} meses`
                          : `${plan.currency} / Lifetime`
                        }
                      </div>
                    </div>

                    <CardDescription className="text-base">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow">
                    {/* Features List */}
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Content Count */}
                    <div className="pt-4 border-t">
                      <div className="text-center text-sm text-gray-600">
                        Acceso a <strong>{plan.content_count}</strong> contenidos
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4">
                    {isCurrentPlan(plan) ? (
                      <Button disabled className="w-full" size="lg">
                        <Check className="h-4 w-4 mr-2" />
                        Plan Actual
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full ${colorScheme.button}`}
                        size="lg"
                        disabled={loadingPlan === plan.id}
                      >
                        {loadingPlan === plan.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {userSubscription ? 'Cambiar Plan' : 'Comenzar Ahora'}
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">¿Puedo cambiar de plan?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
                Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Hay garantía de devolución?</h3>
              <p className="text-gray-600 text-sm">
                Ofrecemos garantía de devolución de 30 días si no estás satisfecho 
                con el contenido.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿El contenido se actualiza?</h3>
              <p className="text-gray-600 text-sm">
                Sí, agregamos contenido nuevo regularmente. Los miembros VIP 
                tienen acceso a todo el contenido futuro sin costo adicional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-gray-600 text-sm">
                Aceptamos todas las tarjetas de crédito principales a través 
                de nuestra plataforma segura de pagos.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-gray-600">
            ¿Tienes dudas sobre qué plan elegir? 
            <a href="/contacto" className="text-blue-600 hover:underline ml-1">
              Contáctanos y te ayudamos
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MembresiasDB;