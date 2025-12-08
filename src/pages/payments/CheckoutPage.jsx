import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Badge } from '@/components/ui/data-display/badge';
import {
  CreditCard,
  Shield,
  Check,
  ArrowLeft,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Star,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import emailService from '../../lib/emailService';
import { useToast } from '@/components/ui/feedback/use-toast';

// Usar la misma clave de Stripe que consultoría (producción)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' o 'annual'
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || user?.email || '',
    name: searchParams.get('name') || user?.user_metadata?.full_name || '',
    phone: '',
    country: 'España',
  });

  useEffect(() => {
    // Cargar datos del plan desde location.state o desde la base de datos
    if (location.state) {
      setPlanData(location.state);
    } else {
      // Si no hay datos en el state, intentar cargar desde la URL
      loadPlanFromParams();
    }

    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
      }));
    }
  }, [user, location.state]);

  const loadPlanFromParams = async () => {
    const planId = searchParams.get('planId');
    if (planId) {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (error) throw error;
        setPlanData(data);
      } catch (error) {
        console.error('Error loading plan:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del plan',
          variant: 'destructive',
        });
        navigate('/membresias');
      }
    }
  };

  // Información de precios para diferentes planes
  const pricingInfo = {
    monthly: {
      price: '20.00',
      saveText: null,
      stripeId: 'price_1SaXofJmSk3VG9oigjDZtcF6', // Membresía Exclusiva mensual
      productId: 'prod_TXd41kG8ddpyDP',
    },
    annual: {
      price: '200.00',
      saveText: 'Ahorra $60 al año',
      stripeId: 'price_1SaXpNJmSk3VG9oifsW4ajZ2', // Membresía Exclusiva anual
      productId: 'prod_TXd5JJfHRg8ZTx',
    },
  };

  // Fallback para compatibilidad con el sistema anterior
  const productInfo = planData || {
    name: 'Academia BSB Capital - Formación Completa',
    description: 'Acceso completo a la formación práctica en inversión, fiscalidad y crypto',
    price: pricingInfo[billingCycle].price,
    currency: 'USD',
    billingCycle: billingCycle,
    features: [
      'Acceso completo al contenido',
      '4 módulos completos de formación',
      'Plantillas y checklists descargables',
      'Soporte prioritario por email',
      'Actualizaciones gratuitas',
      'Comunidad privada de alumnos',
    ],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para continuar con el pago',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Obtener el precio de Stripe según el ciclo de facturación seleccionado
    const selectedPrice = pricingInfo[billingCycle];
    if (!selectedPrice || !selectedPrice.stripeId) {
      toast({
        title: 'Error',
        description: 'No se pudo determinar el precio para el plan seleccionado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Enviando datos a Stripe:', {
        priceId: selectedPrice.stripeId,
        billingCycle,
        price: selectedPrice.price,
      });

      console.log('📤 Enviando datos a create-stripe-checkout:', {
        priceId: selectedPrice.stripeId,
        mode: 'subscription',
        email: formData.email,
        metadata: {
          client_name: formData.name,
          client_email: formData.email,
          plan_type: billingCycle,
          plan_name: planData?.name || 'Premium Plan',
          billing_cycle: billingCycle,
          phone: formData.phone,
          country: formData.country,
          user_id: user.id,
        },
      });

      // Usar exactamente el mismo patrón que consultoría
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          priceId: selectedPrice.stripeId,
          mode: 'subscription',
          userId: user.id,
          email: formData.email,
          metadata: {
            supabase_user_id: user.id,
            client_name: formData.name,
            client_email: formData.email,
            plan_type: billingCycle,
            plan_name: planData?.name || 'Membresía Exclusiva BSB',
            billing_cycle: billingCycle,
            phone: formData.phone,
            country: formData.country,
            access_type: 'membership',
            package_type: 'individual',
          },
        },
      });

      console.log('📥 Respuesta completa de Supabase:', { data, error });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      console.log('✅ Respuesta de create-stripe-checkout:', data);

      // ✅ VERIFICAR QUE LA SESIÓN SE CREÓ CORRECTAMENTE
      if (!data.sessionId && !data.url) {
        console.error('❌ Error: No se recibió sessionId ni URL:', data);
        throw new Error('No se recibió sessionId ni URL de la sesión de Stripe');
      }

      console.log('🔧 Cargando Stripe...');
      // ✅ REDIRIGIR A STRIPE CHECKOUT
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Error al cargar Stripe');
      }

      console.log('✅ Stripe cargado correctamente');

      // Si tenemos sessionId, usar redirectToCheckout
      if (data.sessionId) {
        console.log('🔄 Redirigiendo a Stripe con sessionId:', data.sessionId);

        try {
          const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });

          if (stripeError) {
            console.error('❌ Error de redirección de Stripe:', stripeError);
            throw new Error(`Error de Stripe: ${stripeError.message}`);
          }

          console.log('✅ Redirección iniciada correctamente');
          // Si llegamos aquí sin error, la redirección debería estar en progreso
          return; // Importante: salir de la función
        } catch (redirectError) {
          console.error('❌ Error durante redirectToCheckout:', redirectError);
          throw redirectError;
        }
      }
      // Si tenemos URL directa, redirigir a ella
      else if (data.url) {
        console.log('🔄 Redirigiendo a URL de Stripe:', data.url);
        try {
          window.location.href = data.url;
          return; // Importante: salir de la función
        } catch (urlError) {
          console.error('❌ Error durante redirección por URL:', urlError);
          throw urlError;
        }
      } else {
        console.error('❌ No se recibió ni sessionId ni URL:', data);
        throw new Error('Respuesta inválida del servidor: sin sessionId ni URL');
      }

      // ⚠️ NO enviar email de activación aquí - se enviará después del pago exitoso
      // El email se envía desde el webhook cuando el pago se confirma
    } catch (error) {
      console.error('❌ Error completo en handleCheckout:', error);
      console.error('❌ Stack trace:', error.stack);

      toast({
        variant: 'destructive',
        title: 'Error al procesar el pago',
        description: `Error: ${error.message || 'Problema desconocido al redirigir a Stripe'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green-50 to-brand-green-100">
      <Helmet>
        <title>Checkout - Academia BSB Capital</title>
        <meta name="description" content="Completa tu compra de la Academia BSB Capital" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-brand-text-primary">Finalizar Compra</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario de pago */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-brand-primary text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Información de Pago
                  </CardTitle>
                  <CardDescription className="text-brand-green-100">
                    Completa tus datos para procesar el pago de forma segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información personal */}
                    {/* Información básica del cliente */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-brand-text-primary flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Información de Contacto
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre completo</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono (opcional)</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+34 600 000 000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">País</Label>
                          <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información del pago con Stripe */}
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-brand-text-primary flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Método de Pago
                      </h3>
                      <p className="text-sm text-gray-600">
                        Al hacer clic en "Continuar al pago", serás redirigido a Stripe para
                        completar tu pago de forma segura.
                      </p>
                      <div className="flex items-center text-sm text-green-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Stripe procesa todos los pagos de forma segura y cifrada
                      </div>
                    </div>

                    {/* Botón de pago */}
                    <Button
                      type="submit"
                      className="w-full bg-green-900 hover:bg-green-800 text-white py-3 text-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Redirigiendo a Stripe...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Continuar al Pago - ${pricingInfo[billingCycle].price} USD
                          {billingCycle === 'monthly' ? '/mes' : '/año'}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center text-sm text-green-600">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      Pago 100% seguro procesado por Stripe
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resumen del pedido */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="shadow-lg border-0 sticky top-8">
                <CardHeader className="bg-gradient-to-r from-brand-gold to-brand-gold/80 text-brand-green-900 rounded-t-lg">
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-brand-text-primary">
                        {productInfo.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{productInfo.description}</p>
                    </div>

                    {/* Selector de ciclo de facturación */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-brand-text-primary">Plan de Facturación:</h4>
                      <div className="space-y-2">
                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            billingCycle === 'monthly'
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBillingCycle('monthly')}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  billingCycle === 'monthly'
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {billingCycle === 'monthly' && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${billingCycle === 'monthly' ? 'text-green-700' : ''}`}
                                >
                                  Mensual
                                </p>
                                <p className="text-sm text-gray-600">Cancela cuando quieras</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${billingCycle === 'monthly' ? 'text-green-700' : ''}`}
                              >
                                $29.99/mes
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`border rounded-lg p-3 cursor-pointer transition-all relative ${
                            billingCycle === 'annual'
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setBillingCycle('annual')}
                        >
                          <Badge className="absolute -top-2 left-4 bg-orange-500 text-white text-xs">
                            Más Popular
                          </Badge>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  billingCycle === 'annual'
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {billingCycle === 'annual' && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-medium ${billingCycle === 'annual' ? 'text-green-700' : ''}`}
                                >
                                  Anual
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                  Ahorra $60 al año
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${billingCycle === 'annual' ? 'text-green-700' : ''}`}
                              >
                                $299.00/año
                              </p>
                              <p className="text-sm text-gray-500 line-through">$359.88</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-brand-text-primary">Incluye:</h4>
                      {productInfo.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold">Subtotal:</span>
                        <span>${pricingInfo[billingCycle].price} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Impuestos incluidos:</span>
                        <span>$0.00</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span>Descuento anual:</span>
                          <span>-$60.00</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xl font-bold text-brand-primary border-t mt-2 pt-2">
                        <span>Total:</span>
                        <span>
                          ${pricingInfo[billingCycle].price} USD
                          {billingCycle === 'monthly' ? '/mes' : '/año'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-brand-green-50 p-4 rounded-lg">
                      <div className="flex items-center text-sm text-brand-text-primary">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        <span className="font-medium">Garantía de 30 días</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Si no estás satisfecho, te devolvemos el dinero
                      </p>
                    </div>

                    <Badge variant="secondary" className="w-full justify-center">
                      Acceso inmediato tras el pago
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
