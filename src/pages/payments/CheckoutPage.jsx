import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Cargar Stripe con clave de test para desarrollo (hardcoded temporalmente)
const stripePromise = loadStripe('pk_test_51SD5YXJmSk3VG9oizOg5SRv8Vla8VEJQkKN9pMKVV2g7XZOdQG7YjnZ2fvOhHyO1HQAA0DyUWu0p7hT6qfhvVh6I00FQhV3mB0');

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || user?.email || '',
    name: searchParams.get('name') || user?.user_metadata?.full_name || '',
    phone: '',
    country: 'España'
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
      setFormData(prev => ({
        ...prev,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0]
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
          title: "Error",
          description: "No se pudo cargar la información del plan",
          variant: "destructive"
        });
        navigate('/membresias');
      }
    }
  };

  // Fallback para compatibilidad con el sistema anterior
  const productInfo = planData || {
    name: 'Academia BSB Capital - Formación Completa',
    description: 'Acceso completo a la formación práctica en inversión, fiscalidad y crypto',
    price: '99.99',
    currency: 'USD',
    features: [
      'Acceso de por vida al contenido',
      '4 módulos completos de formación',
      'Plantillas y checklists descargables',
      'Soporte prioritario por email',
      'Actualizaciones gratuitas',
      'Comunidad privada de alumnos'
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para continuar con el pago",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!planData) {
      toast({
        title: "Error", 
        description: "No se pudo cargar la información del plan",
        variant: "destructive"
      });
      return;
    }

    if (!planData.stripe_price_id) {
      toast({
        title: "Error", 
        description: "Este plan no tiene configurado un precio de Stripe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Crear sesión de checkout de Stripe usando nuestra Edge Function
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          priceId: planData.stripe_price_id,
          mode: 'subscription', // Para suscripciones
          email: formData.email,
          metadata: {
            user_id: user.id,
            plan_id: planData.id,
            plan_name: planData.name,
            customer_name: formData.name,
            phone: formData.phone,
            country: formData.country
          }
        }
      });

      if (error) {
        console.error('Error creating Stripe checkout:', error);
        throw new Error(error.message || 'Error al crear la sesión de pago');
      }

      if (!data.sessionId) {
        throw new Error('No se recibió ID de sesión de Stripe');
      }

      // Redirigir a Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        console.error('Error redirecting to Stripe:', stripeError);
        throw new Error(stripeError.message || 'Error al redirigir a Stripe');
      }

    } catch (error) {
      console.error('Error procesando pago:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "Hubo un problema procesando tu pago. Inténtalo de nuevo.",
        variant: "destructive"
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
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-brand-text-primary">
              Finalizar Compra
            </h1>
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
                        Al hacer clic en "Continuar al pago", serás redirigido a Stripe para completar tu pago de forma segura.
                      </p>
                      <div className="flex items-center text-sm text-green-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Stripe procesa todos los pagos de forma segura y cifrada
                      </div>
                    </div>

                    {/* Botón de pago */}
                    <Button
                      type="submit"
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-3 text-lg font-semibold"
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
                          Continuar al Pago - ${productInfo.price} USD
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
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
                      <p className="text-sm text-gray-600 mt-1">
                        {productInfo.description}
                      </p>
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
                        <span>${productInfo.price} USD</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Impuestos incluidos:</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between items-center text-xl font-bold text-brand-primary border-t mt-2 pt-2">
                        <span>Total:</span>
                        <span>${productInfo.price} USD</span>
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