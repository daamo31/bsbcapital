import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SimpleAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
    import { Badge } from "@/components/ui/badge";
    import { CheckCircle, XCircle, Clock, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';

    const allServices = {
      trading: [
        { id: 'BSB Maker', name: 'BSB Maker', description: 'Tu copiloto de IA.', link: '/bsb-maker' },
        { id: 'Algo Fund', name: 'Algo Fund', description: 'Delegación de estrategias.', link: '/algo-fund' },
      ],
      academia: [
        { id: 'Academia', name: 'Academia', description: 'Formación y research premium.', link: '/academia' },
      ],
      consultoria: [
        { id: 'Consultoria', name: 'Consultoría', description: 'Asesoramiento personalizado.', link: '/consultoria' },
      ]
    };

    const ServiceStatus = ({ status }) => {
      const statusMap = {
        'Activo': { icon: <CheckCircle className="h-5 w-5 text-green-400" />, text: 'Activo', color: 'bg-green-500/10 text-green-300' },
        'No contratado': { icon: <XCircle className="h-5 w-5 text-red-400" />, text: 'No contratado', color: 'bg-red-500/10 text-red-300' },
        'Demo': { icon: <Clock className="h-5 w-5 text-yellow-400" />, text: 'Demo', color: 'bg-yellow-500/10 text-yellow-300' },
      };
      const current = statusMap[status] || statusMap['No contratado'];
      return <Badge variant="outline" className={`flex items-center gap-2 ${current.color} border-none font-semibold`}>{current.icon} {current.text}</Badge>;
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
            const { data, error } = await supabase
              .from('user_services')
              .select('service_name, status')
              .eq('user_id', user.id);

            if (error) throw error;

            const userServicesMap = data.reduce((acc, service) => {
              acc[service.service_name] = service.status;
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
            className="container mx-auto px-4 py-16 md:py-24"
          >
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary">Área de Cliente</h1>
              <p className="mt-2 text-lg text-brand-text-secondary">Bienvenido de nuevo, <span className="font-semibold text-brand-primary">{user?.user_metadata?.full_name || user?.email}</span>.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-brand-text-primary">Mis Servicios</CardTitle>
                  <CardDescription className="text-brand-text-secondary">Gestiona todos tus servicios contratados con BSB Capital.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.values(allServices).flat().map(service => (
                     <div key={service.id} className="flex justify-between items-center p-4 bg-brand-surface/50 rounded-lg">
                       <div>
                         <h4 className="font-semibold text-brand-text-primary">{service.name}</h4>
                         <p className="text-sm text-brand-text-secondary">{service.description}</p>
                       </div>
                       <ServiceStatus status={services[service.id] || 'No contratado'} />
                     </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to="/">Explorar más servicios</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-brand-text-primary">Consultoría</CardTitle>
                  <CardDescription className="text-brand-text-secondary">Tus sesiones de asesoramiento personalizado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-brand-text-secondary">No tienes sesiones programadas. ¡Agenda una para empezar!</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-background">
                    <Link to="/consultoria"><PlusCircle className="mr-2 h-4 w-4" /> Agendar Nueva Sesión</Link>
                  </Button>
                </CardFooter>
              </Card>

            </div>
          </motion.div>
        </>
      );
    };

    export default ClientDashboard;