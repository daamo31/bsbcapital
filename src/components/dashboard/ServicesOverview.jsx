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
import { Badge } from '@/components/ui/data-display/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Loader2, Package, CheckCircle, ExternalLink, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesOverview = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const allServices = [
    {
      name: 'BSB Maker',
      description: 'Tu asistente de inversión con IA: backtesting, señales y gestión de riesgo.',
      link: '/bsb-maker',
      category: 'herramienta',
      icon: '🤖',
    },
    {
      name: 'Algo Fund',
      description: 'Inversión en nuestro fondo algorítmico de alto rendimiento.',
      link: '/algo-fund',
      category: 'inversión',
      icon: '📈',
    },
    {
      name: 'Consultoría',
      description: 'Asesoramiento financiero personalizado con expertos.',
      link: '/consultoria',
      category: 'servicio',
      icon: '💼',
    },
  ];

  useEffect(() => {
    const fetchUserServices = async () => {
      if (user) {
        setLoading(true);
        // Cambiar de user_services a user_subscriptions ya que esa es la tabla correcta
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan_id, status, current_period_end, metadata')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user services:', error);
        } else {
          // Mapear las suscripciones a servicios por nombre de plan
          const userServicesMap = new Map(
            data.map((s) => [
              s.metadata?.plan_name || 'Servicio',
              {
                status:
                  s.status === 'active'
                    ? 'Activo'
                    : s.status === 'pending'
                      ? 'Pendiente'
                      : 'No contratado',
                expires_at: s.current_period_end,
              },
            ])
          );

          const mergedServices = allServices.map((s) => ({
            ...s,
            status: userServicesMap.get(s.name)?.status || 'No contratado',
            expires_at: userServicesMap.get(s.name)?.expires_at,
          }));
          setServices(mergedServices);
        }
        setLoading(false);
      }
    };

    fetchUserServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getStatusBadge = (status) => {
    const variants = {
      Activo: 'default',
      Comprado: 'default',
      Pendiente: 'secondary',
      'No contratado': 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getCategoryBadge = (category) => {
    const colors = {
      herramienta: 'bg-blue-100 text-blue-800',
      inversión: 'bg-green-100 text-green-800',
      servicio: 'bg-purple-100 text-purple-800',
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full ${colors[category] || 'bg-gray-100 text-gray-800'}`}
      >
        {category}
      </span>
    );
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

  const activeServices = services.filter((s) => s.status === 'Activo' || s.status === 'Comprado');
  const availableServices = services.filter((s) => s.status === 'No contratado');

  return (
    <div className="space-y-6">
      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servicios Activos</p>
                <p className="text-3xl font-bold text-brand-accent">{activeServices.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-3xl font-bold text-gray-400">{availableServices.length}</p>
              </div>
              <Package className="h-10 w-10 text-gray-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Servicios</p>
                <p className="text-3xl font-bold text-gray-700">{services.length}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servicios Activos */}
      {activeServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Mis Servicios Activos
            </CardTitle>
            <CardDescription>Servicios que tienes contratados y activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeServices.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-green-50/50 border-green-200"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{service.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {getStatusBadge(service.status)}
                        {getCategoryBadge(service.category)}
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      {service.expires_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expira: {new Date(service.expires_at).toLocaleDateString('es-ES')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={service.link}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Acceder
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Servicios Disponibles */}
      {availableServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Servicios Disponibles
            </CardTitle>
            <CardDescription>Explora más servicios para potenciar tus inversiones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableServices.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:border-brand-accent"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl opacity-50">{service.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        {getStatusBadge(service.status)}
                        {getCategoryBadge(service.category)}
                      </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-brand-accent hover:bg-brand-accent/90">
                    <Link to={service.link}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información adicional */}
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          <strong>¿Necesitas ayuda con algún servicio?</strong> Ve a la pestaña de Soporte para
          contactar con nuestro equipo.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ServicesOverview;
