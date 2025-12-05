import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Badge } from '@/components/ui/data-display/badge';
import { Loader2, CreditCard, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/use-toast';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      // Obtener suscripciones activas del usuario desde Supabase
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar tus suscripciones.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenCustomerPortal = async () => {
    try {
      // Verificar que el usuario tenga stripe_customer_id
      if (!user?.stripe_customer_id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se encontró información de pago. Por favor, contacta con soporte.',
        });
        return;
      }

      // Crear sesión del portal de Stripe usando la Edge Function
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          customerId: user.stripe_customer_id,
          returnUrl: `${window.location.origin}/area-cliente?tab=subscriptions`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirigir al portal de Stripe
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL del portal');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo abrir el portal de gestión. Por favor, contacta con soporte.',
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSubscriptionBadge = (status) => {
    const variants = {
      active: 'default',
      canceled: 'secondary',
      past_due: 'destructive',
      trialing: 'outline',
    };

    const labels = {
      active: 'Activa',
      canceled: 'Cancelada',
      past_due: 'Pago pendiente',
      trialing: 'Periodo de prueba',
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mis Suscripciones
          </CardTitle>
          <CardDescription>Gestiona tus suscripciones activas</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No tienes suscripciones activas en este momento.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mis Suscripciones
          </CardTitle>
          <CardDescription>Gestiona tus suscripciones recurrentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {subscription.product_name || 'Suscripción'}
                    {getSubscriptionBadge(subscription.status)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subscription.description || 'Acceso mensual a contenido exclusivo'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-accent">
                    {subscription.price ? `€${subscription.price}` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    /{subscription.interval === 'month' ? 'mes' : 'año'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Próximo cobro: <strong>{formatDate(subscription.current_period_end)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Inicio: <strong>{formatDate(subscription.created_at)}</strong>
                  </span>
                </div>
              </div>

              {subscription.cancel_at_period_end && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Esta suscripción se cancelará el {formatDate(subscription.current_period_end)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}

          <div className="pt-4 border-t">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para gestionar tus métodos de pago, actualizar información de facturación o cancelar
                suscripciones, utiliza el portal seguro de Stripe.
              </AlertDescription>
            </Alert>

            <Button onClick={handleOpenCustomerPortal} className="w-full" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Portal de Gestión de Suscripciones
            </Button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Serás redirigido al portal seguro de Stripe para gestionar tus suscripciones
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información sobre Cancelaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            • <strong>Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento
            desde el portal de gestión.
          </p>
          <p>
            • <strong>Acceso:</strong> Tras cancelar, mantendrás el acceso hasta el final del
            periodo actual pagado.
          </p>
          <p>
            • <strong>Sin reembolsos:</strong> Los pagos ya realizados no son reembolsables, pero
            puedes aprovechar el servicio hasta el final del ciclo.
          </p>
          <p>
            • <strong>Reactivación:</strong> Puedes reactivar tu suscripción en cualquier momento
            volviendo a suscribirte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
