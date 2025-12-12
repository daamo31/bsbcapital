import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { X, Check, CreditCard, Shield, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('plan-mensual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🧪 Detección automática del modo test
  // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
  // const isTestMode =
  //   import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
  const isTestMode = false; // PRODUCCIÓN: Siempre usar precios reales

  // 🧪 IDs de precios de prueba (€1) para Academia
  // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
  // const TEST_PRICE_IDS = {
  //   academia_monthly_test: 'price_1ScNpIJmSk3VG9oiYMNPIRXN', // Academia mensual €1 (recurring)
  //   academia_annual_test: 'price_1SKG4NJmSk3VG9oi6CjvmqLC', // Academia anual €1 (one-time)
  // };

  const plans = {
    'plan-mensual': {
      name: 'Plan Mensual',
      price: '20€/mes',
      description: 'Acceso completo a toda la plataforma',
      idealFor:
        'Ideal si quieres flexibilidad mensual y acceso continuo a contenidos actualizados.',
      features: [
        'Todos los módulos de formación crypto',
        'Plantillas y checklists descargables',
        'Soporte por email',
        'Actualizaciones continuas incluidas',
        'Acceso a foro de la Academia',
        'Garantía de devolución',
      ],
      popular: false,
    },
    'plan-anual': {
      name: 'Plan Anual',
      price: '200€/año',
      originalPrice: '240€/año',
      description: 'Ahorra 2 meses con el plan anual',
      idealFor:
        'Ideal si quieres compromiso anual, aprovechar todo el contenido y maximizar tu aprendizaje pagando menos: ¡2 meses gratis frente a la modalidad mensual!',
      features: [
        'Todos los módulos de formación crypto',
        'Plantillas y checklists descargables',
        'Soporte por email',
        'Actualizaciones continuas incluidas',
        'Acceso a foro de la Academia',
        'Garantía de devolución',
        '2 meses gratis incluidos',
      ],
      popular: true,
    },
  };

  const handlePurchase = async () => {
    console.log('🎯 handlePurchase iniciado', {
      hasUser: !!user,
      userId: user?.id,
      selectedPlan,
    });

    if (!user) {
      // Cerrar modal y redirigir al login
      console.log('⚠️ Usuario no autenticado, redirigiendo al login');
      onClose();
      navigate('/login', {
        state: {
          from: '/formacion',
          message: 'Inicia sesión para acceder a la compra de la academia',
        },
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determinar el price_id según el plan seleccionado y modo test
      // COMENTADO PARA PRODUCCIÓN - Descomentar para testing con €1
      // const stripePriceIds = isTestMode
      //   ? {
      //       'plan-mensual': TEST_PRICE_IDS.academia_monthly_test, // €1 mensual (recurring)
      //       'plan-anual': TEST_PRICE_IDS.academia_annual_test, // €1 anual (one-time)
      //     }
      //   : {
      //       'plan-mensual': 'price_1SaXVjJmSk3VG9oix0Pu2N9J', // Academia mensual producción
      //       'plan-anual': 'price_1SDKgoJmSk3VG9oiamJj88De', // Academia anual producción
      //     };

      // PRODUCCIÓN: Siempre usar precios reales
      const stripePriceIds = {
        'plan-mensual': 'price_1SaXVjJmSk3VG9oix0Pu2N9J', // Academia mensual producción
        'plan-anual': 'price_1SDKgoJmSk3VG9oiamJj88De', // Academia anual producción
      };

      const stripeProductId = 'prod_T9dymUXkbPpeir'; // Academia
      const selectedPlanData = plans[selectedPlan];

      // El plan mensual es recurrente (subscription), el anual es pago único (payment)
      const mode = selectedPlan === 'plan-mensual' ? 'subscription' : 'payment';

      console.log('🧪 MODO TEST:', isTestMode ? 'ACTIVO (€1)' : 'DESACTIVADO (precios reales)');
      console.log('🎯 Plan seleccionado:', selectedPlan);
      console.log('💳 Price ID a usar:', stripePriceIds[selectedPlan]);
      console.log('📦 Product ID:', stripeProductId);
      console.log('🔄 Mode:', mode, '(mensual=subscription, anual=payment)');

      const requestBody = {
        priceId: stripePriceIds[selectedPlan],
        mode: mode,
        userId: user.id,
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          client_email: user.email,
          client_name: user.user_metadata?.full_name || user.email,
          plan_name: `Academia BSB ${selectedPlan === 'plan-mensual' ? 'Mensual' : 'Anual'}`,
          plan_type: 'academia',
          billing_cycle: selectedPlan === 'plan-mensual' ? 'monthly' : 'annual',
          access_type: 'membership',
          stripe_product_id: stripeProductId,
        },
      };

      console.log('📤 Enviando a create-stripe-checkout:', requestBody);

      // Llamar a nuestra Edge Function para crear el checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: requestBody,
      });

      console.log('📥 Respuesta de create-stripe-checkout:', { data, error });

      if (error) {
        console.error('❌ Error de Supabase Functions:', error);
        throw error;
      }

      // La respuesta debe tener una URL para redirigir a Stripe Checkout
      if (data && data.url) {
        console.log('✅ URL de checkout recibida:', data.url);
        console.log('🔍 Tipo de URL:', typeof data.url);
        console.log(
          '🔍 URL comienza con https://checkout.stripe.com?',
          data.url.startsWith('https://checkout.stripe.com')
        );
        console.log('🔍 Objeto data completo:', JSON.stringify(data, null, 2));

        // Cerrar modal y redirigir al checkout de Stripe
        onClose();

        console.log('🚀 Redirigiendo a:', data.url);
        window.location.href = data.url;
      } else {
        console.error('❌ Respuesta sin URL:', data);
        throw new Error('No se recibió URL de checkout de Stripe');
      }
    } catch (error) {
      console.error('Error durante la compra:', error);

      // Mensaje de error más específico
      let errorMessage = error.message || 'Error al procesar la compra. Inténtalo de nuevo.';

      if (error.message && error.message.includes('recurring')) {
        errorMessage =
          'Error de configuración: El precio seleccionado no está configurado correctamente en Stripe. Por favor contacta al soporte.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Academia BSB Capital</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-muted-foreground">
            Elige tu plan de acceso
          </DialogDescription>

          {/* Indicador de modo test */}
          {isTestMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mt-2">
              <p className="text-xs text-yellow-800 font-medium">
                🧪 MODO TEST: Precios de €1 activos para pruebas
              </p>
            </div>
          )}
        </DialogHeader>

        {/* Selector de planes */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedPlan === 'plan-mensual' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedPlan('plan-mensual')}
          >
            Plan Mensual {isTestMode && '(€1)'}
          </Button>
          <Button
            variant={selectedPlan === 'plan-anual' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setSelectedPlan('plan-anual')}
          >
            Plan Anual {isTestMode && '(€1)'}
            <Badge className="ml-2 bg-brand-gold-600">Más Popular</Badge>
          </Button>
        </div>

        {/* Mostrar solo el plan seleccionado */}
        <div className="space-y-4">
          {(() => {
            const plan = plans[selectedPlan];
            return (
              <div className="border rounded-lg p-6 border-primary bg-primary/5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-2xl">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{plan.price}</div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ideal para mensaje */}
                {plan.idealFor && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900 font-medium">💡 {plan.idealFor}</p>
                  </div>
                )}

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Botón de compra */}
        {!plans[selectedPlan]?.isLink && (
          <div className="pt-4">
            <Button
              onClick={handlePurchase}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : !user ? (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Iniciar sesión para comprar
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Completar compra - {plans[selectedPlan].price}
                </>
              )}
            </Button>
            {!user && (
              <p className="text-xs text-center text-blue-600 mt-2">
                Te redirigiremos al login para continuar con la compra
              </p>
            )}
            {user && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                Serás redirigido a nuestra plataforma de pago segura
              </p>
            )}
          </div>
        )}

        {/* Mensaje para enlaces */}
        {plans[selectedPlan]?.isLink && (
          <div className="pt-4 text-center">
            <p className="text-sm text-blue-600 mb-2">
              Haz clic en "Membresía Premium" para ver todos los planes disponibles
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
