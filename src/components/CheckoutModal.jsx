import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check, CreditCard, Shield, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('acceso-completo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const plans = {
    'acceso-completo': {
      name: 'Acceso Completo',
      price: '149,99€',
      originalPrice: '299,99€',
      description: 'Acceso de por vida a todo el contenido',
      features: [
        'Todos los módulos de formación',
        'Plantillas y checklists descargables',
        'Soporte por email',
        'Actualizaciones futuras incluidas',
        'Acceso de por vida',
        'Garantía de 30 días'
      ],
      popular: true
    },
    'membresia': {
      name: 'Membresía Premium',
      price: 'Ver planes',
      description: 'Acceso completo a toda la plataforma',
      features: [
        'Academia + Consultoría ilimitada',
        'Señales de trading en vivo',
        'Comunidad exclusiva',
        'Análisis de mercado diarios',
        'Soporte prioritario'
      ],
      popular: false,
      isLink: true,
      linkTo: '/membresias'
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      // Cerrar modal y redirigir al login
      onClose();
      navigate('/login', { 
        state: { 
          from: '/formacion',
          message: 'Inicia sesión para acceder a la compra de la academia' 
        }
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Llamar a nuestra Edge Function para crear el checkout
      const { data, error } = await supabase.functions.invoke('hotmart-checkout-production', {
        body: {
          productId: import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
          userEmail: user.email,
          userId: user.id,
          userName: user.user_metadata?.full_name || user.email.split('@')[0],
          returnUrl: `${window.location.origin}/compra-exitosa`
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && (data.checkoutUrl || data.checkout_url)) {
        // Cerrar modal y redirigir al checkout de Hotmart
        onClose();
        window.location.href = data.checkoutUrl || data.checkout_url;
      } else {
        throw new Error('No se pudo crear el checkout');
      }
    } catch (error) {
      console.error('Error durante la compra:', error);
      setError(error.message || 'Error al procesar la compra. Inténtalo de nuevo.');
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
          <DialogDescription className="text-muted-foreground">Elige tu plan de acceso</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                !plan.isLink && selectedPlan === key
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.popular ? 'relative' : ''} ${plan.isLink ? 'hover:bg-blue-50 hover:border-blue-300' : ''}`}
              onClick={() => {
                if (plan.isLink) {
                  onClose();
                  navigate(plan.linkTo);
                } else {
                  setSelectedPlan(key);
                }
              }}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-6 bg-primary">
                  Más Popular
                </Badge>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    {!plan.isLink && (
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === key
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedPlan === key && (
                          <Check className="w-3 h-3 text-white mx-auto" />
                        )}
                      </div>
                    )}
                    <h3 className={`font-bold text-lg ${plan.isLink ? 'text-blue-600' : ''}`}>
                      {plan.name}
                      {plan.isLink && <span className="ml-2 text-sm">→</span>}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{plan.price}</div>
                  {plan.originalPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Seguridad y garantías */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Pago seguro
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Acceso inmediato
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Garantía 30 días
            </div>
          </div>
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