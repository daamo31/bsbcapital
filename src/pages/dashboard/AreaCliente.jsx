import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, User, CreditCard, Package, MessageSquare, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import ServicesOverview from '@/components/dashboard/ServicesOverview';
import SupportContact from '@/components/dashboard/SupportContact';
import { supabase } from '@/lib/customSupabaseClient';

const AreaCliente = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get('tab') || 'overview';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold">Acceso denegado</h1>
        <p className="mt-4 text-lg text-brand-text-secondary">
          Por favor, inicia sesión para ver tu área de cliente.
        </p>
        <Button asChild className="mt-8">
          <Link to="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Área Cliente - BSB Capital</title>
        <meta
          name="description"
          content="Tu portal personal para gestionar productos, servicios y perfil en BSB Capital."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
      >
        {/* Header con perfil de usuario */}
        <div className="container mx-auto px-4 mb-8">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-brand-accent text-white text-xl">
                    <AvatarFallback className="bg-brand-accent text-white">
                      {getInitials(user.user_metadata?.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {user.user_metadata?.full_name || 'Usuario'}
                    </h1>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal con tabs */}
        <div className="container mx-auto px-4">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto bg-white shadow-sm">
              <TabsTrigger value="overview" className="gap-2 py-3">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Mis Servicios</span>
                <span className="sm:hidden">Servicios</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2 py-3">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Suscripciones</span>
                <span className="sm:hidden">Pagos</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2 py-3">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Mi Perfil</span>
                <span className="sm:hidden">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-2 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Soporte</span>
                <span className="sm:hidden">Ayuda</span>
              </TabsTrigger>
            </TabsList>

            <div className="max-w-6xl mx-auto">
              <TabsContent value="overview" className="mt-0">
                <ServicesOverview />
              </TabsContent>

              <TabsContent value="subscriptions" className="mt-0">
                <SubscriptionManager />
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <ProfileSettings />
              </TabsContent>

              <TabsContent value="support" className="mt-0">
                <SupportContact />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </>
  );
};

export default AreaCliente;
