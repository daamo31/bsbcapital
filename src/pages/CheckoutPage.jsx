import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    name: searchParams.get('name') || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const productId = searchParams.get('product') || '6308462';
  const returnUrl = searchParams.get('return_url') || '/compra-exitosa';

  // Información del producto
  const productInfo = {
    name: 'Academia BSB Capital - Formación Completa',
    description: 'Acceso completo a la formación práctica en inversión, fiscalidad y crypto',
    price: '297',
    currency: 'EUR',
    features: [
      'Acceso de por vida al contenido',
      '4 módulos completos de formación',
      'Plantillas y checklists descargables',
      'Soporte prioritario por email',
      'Actualizaciones gratuitas',
      'Comunidad privada de alumnos'
    ]
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0]
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí integrarías con Stripe
      // Por ahora simulamos el procesamiento
      console.log('Procesando pago con Stripe...', formData);
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular respuesta exitosa de Stripe
      const paymentResult = {
        id: `pi_${Date.now()}`,
        status: 'succeeded',
        amount: parseInt(productInfo.price) * 100,
        currency: productInfo.currency.toLowerCase()
      };

      // Registrar la compra en Supabase
      const { error: dbError } = await supabase
        .from('hotmart_checkouts')
        .insert({
          user_id: user?.id || 'guest',
          email: formData.email,
          name: formData.name,
          product_id: productId,
          checkout_url: window.location.href,
          status: 'completed',
          payment_method: 'stripe',
          amount: productInfo.price,
          currency: productInfo.currency,
          stripe_data: paymentResult,
          billing_info: {
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country
          },
          hotmart_data: {
            simulated_purchase: true,
            timestamp: new Date().toISOString(),
            product_name: productInfo.name
          }
        });

      if (dbError) {
        console.error('Error guardando en DB:', dbError);
        throw new Error('Error procesando la compra');
      }

      // Simular notificación a Hotmart (webhook simulado)
      try {
        await supabase.functions.invoke('webhook-handler', {
          body: {
            event: 'PURCHASE_COMPLETE',
            data: {
              subscriber: {
                email: formData.email,
                name: formData.name
              },
              product: {
                id: productId,
                name: productInfo.name
              },
              purchase: {
                transaction: paymentResult.id,
                status: 'APPROVED',
                price: {
                  value: productInfo.price,
                  currency_value: productInfo.currency
                }
              }
            }
          }
        });
      } catch (webhookError) {
        console.log('Warning: Webhook simulation failed:', webhookError);
      }

      toast({
        title: "¡Pago procesado exitosamente!",
        description: "Tu compra ha sido completada. Redirigiendo...",
      });

      // Redirigir a página de éxito
      setTimeout(() => {
        navigate(returnUrl);
      }, 1500);

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
                    <div className="space-y-4">
                      <h3 className="font-semibold text-brand-text-primary flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Información Personal
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
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
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
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

                    {/* Información de tarjeta */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-brand-text-primary flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Datos de la Tarjeta
                      </h3>
                      
                      <div>
                        <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="mt-1"
                          placeholder="Como aparece en tu tarjeta"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Número de tarjeta</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          required
                          className="mt-1"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleExpiryChange}
                            required
                            className="mt-1"
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                            className="mt-1"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
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
                          Procesando pago...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Pagar {productInfo.price}€ de forma segura
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2" />
                      Pago 100% seguro y cifrado
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
                        <span>{productInfo.price}€</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>IVA incluido:</span>
                        <span>0€</span>
                      </div>
                      <div className="flex justify-between items-center text-xl font-bold text-brand-primary border-t mt-2 pt-2">
                        <span>Total:</span>
                        <span>{productInfo.price}€</span>
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