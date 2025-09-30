import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ServiceStatusIcon = ({ status }) => {
    switch (status) {
        case 'Activo':
        case 'Comprado':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'Pendiente':
            return <Hourglass className="h-5 w-5 text-yellow-500" />;
        case 'No contratado':
        default:
            return <XCircle className="h-5 w-5 text-red-500" />;
    }
};

const AreaCliente = () => {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const allServices = [
        { name: 'BSB Maker', description: 'Acceso a nuestro asistente de IA para trading.', link: '/bsb-maker' },
        { name: 'Algo Fund', description: 'Inversión en nuestro fondo algorítmico.', link: '/algo-fund' },
        { name: 'Consultoría', description: 'Asesoramiento financiero personalizado.', link: '/consultoria' },
        { name: 'Comunidad BSB', description: 'Acceso a la comunidad de inversores.', link: '/academia' },
        { name: 'Newsletter Habits Club', description: 'Suscripción a nuestro boletín semanal.', link: '/academia' },
    ];

    useEffect(() => {
        const fetchUserServices = async () => {
            if (user) {
                setLoading(true);
                const { data, error } = await supabase
                    .from('user_services')
                    .select('service_name, status')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching user services:', error);
                } else {
                    const userServicesMap = new Map(data.map(s => [s.service_name, s.status]));
                    
                    const mergedServices = allServices.map(s => ({
                        ...s,
                        status: userServicesMap.get(s.name) || 'No contratado'
                    }));
                    setServices(mergedServices);
                }
                setLoading(false);
            }
        };

        fetchUserServices();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-brand-background">
                <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            </div>
        );
    }
    
    if (!user) {
         return (
             <div className="container mx-auto px-4 py-16 text-center">
                 <h1 className="text-4xl font-bold">Acceso denegado</h1>
                 <p className="mt-4 text-lg text-brand-text-secondary">Por favor, inicia sesión para ver tu área de cliente.</p>
                 <Button asChild className="mt-8">
                     <Link to="/login">Iniciar Sesión</Link>
                 </Button>
             </div>
         )
    }

    return (
        <>
            <Helmet>
                <title>Área Cliente - BSB Capital</title>
                <meta name="description" content="Tu portal personal para gestionar productos y servicios contratados con BSB Capital." />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-16"
            >
                <h1 className="text-4xl font-bold text-center">Tu Área Cliente</h1>
                <p className="mt-4 text-lg text-brand-text-secondary text-center max-w-2xl mx-auto">
                    Bienvenido, {user.user_metadata?.full_name || user.email}. Aquí puedes ver el estado de todos tus servicios.
                </p>

                <div className="mt-12 max-w-4xl mx-auto">
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle>Mis Servicios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {services.map(service => (
                                    <div key={service.name} className="flex items-center justify-between p-4 bg-brand-surface/50 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-lg text-brand-text-primary">{service.name}</h3>
                                            <p className="text-sm text-brand-text-secondary">{service.description}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <ServiceStatusIcon status={service.status} />
                                            <span className="font-medium text-brand-text-primary">{service.status}</span>
                                            {service.status === 'No contratado' && (
                                                <Button asChild variant="outline" size="sm">
                                                    <Link to={service.link}>Contratar</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </>
    );
};

export default AreaCliente;