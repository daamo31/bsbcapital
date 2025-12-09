import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
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
import { CheckCircle, XCircle, Clock, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';

const allServices = {
  trading: [
    { id: 'BSB Maker', name: 'BSB Maker', description: 'Tu copiloto de IA.', link: '/bsb-maker' },
    {
      id: 'Algo Fund',
      name: 'Algo Fund',
      description: 'Delegación de estrategias.',
      link: '/algo-fund',
    },
  ],
  academia: [
    {
      id: 'Academia',
      name: 'Academia',
      description: 'Formación y research premium.',
      link: '/academia',
    },
  ],
  consultoria: [
    {
      id: 'Consultoria',
      name: 'Consultoría',
      description: 'Asesoramiento personalizado.',
      link: '/consultoria',
    },
  ],
};

const ServiceStatus = ({ status }) => {
  const statusMap = {
    Activo: {
      icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />,
      text: 'Activo',
      color: 'bg-green-500/10 text-green-300',
    },
    'No contratado': {
      icon: <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />,
      text: 'No contratado',
      color: 'bg-red-500/10 text-red-300',
    },
    Demo: {
      icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />,
      text: 'Demo',
      color: 'bg-yellow-500/10 text-yellow-300',
    },
  };
  const current = statusMap[status] || statusMap['No contratado'];
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 sm:gap-2 ${current.color} border-none font-semibold text-xs sm:text-sm`}
    >
      {current.icon} <span className="hidden sm:inline">{current.text}</span>
    </Badge>
  );
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserServices = async () => {
      try {
        setLoading(true);
        // Cambiar de user_services a user_subscriptions
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('plan_id, status, metadata')
          .eq('user_id', user.id);

        if (error) throw error;

        // Mapear usando el nombre del plan desde metadata
        const userServicesMap = data.reduce((acc, subscription) => {
          const serviceName = subscription.metadata?.plan_name || 'Servicio';
          acc[serviceName] = subscription.status === 'active' ? 'Activo' : subscription.status;
          return acc;
        }, {});

        setServices(userServicesMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserServices();
    // Suscripción en tiempo real a cambios en la tabla user_subscriptions
    const channel = supabase
      .channel('user_subscriptions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_subscriptions' },
        (payload) => {
          fetchUserServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-text-primary">Error al cargar tus datos</h2>
        <p className="text-brand-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Área de Cliente - BSB Capital</title>
        <meta name="description" content="Gestiona tus servicios, consultorías y cursos." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24"
      >
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary">
            Área de Cliente
          </h1>
          <p className="mt-2 text-base sm:text-lg text-brand-text-secondary">
            Bienvenido de nuevo,{' '}
            <span className="font-semibold text-brand-primary break-words">
              {user?.user_metadata?.full_name || user?.email}
            </span>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 sm:gap-8">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-text-primary text-lg sm:text-xl">
                Mis Servicios
              </CardTitle>
              <CardDescription className="text-brand-text-secondary text-sm sm:text-base">
                Gestiona todos tus servicios contratados con BSB Capital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {Object.values(allServices)
                .flat()
                .map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 sm:p-4 bg-brand-surface/50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-brand-text-primary text-sm sm:text-base truncate">
                        {service.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-brand-text-secondary">
                        {service.description}
                      </p>
                    </div>
                    <div className="self-start sm:self-auto">
                      <ServiceStatus status={services[service.id] || 'No contratado'} />
                    </div>
                  </div>
                ))}
            </CardContent>
            <CardFooter className="pt-4">
              <Button asChild className="w-full text-sm sm:text-base">
                <Link to="/">Explorar más servicios</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-text-primary text-lg sm:text-xl">
                Consultoría
              </CardTitle>
              <CardDescription className="text-brand-text-secondary text-sm sm:text-base">
                Tus sesiones de asesoramiento personalizado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-brand-text-secondary">
                No tienes sesiones programadas. ¡Agenda una para empezar!
              </p>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-background text-sm sm:text-base"
              >
                <Link to="/consultoria">
                  <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Agendar Nueva Sesión
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default ClientDashboard;
