import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Video, FileText, Layers, Lock, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { loadStripe } from '@stripe/stripe-js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Price IDs para la academia con fallbacks
const ACADEMIA_MEMBERSHIP_PRICE_ID =
  import.meta.env.VITE_STRIPE_ACADEMY_MEMBERSHIP_PRICE_ID || 'price_default_membership';
const ACADEMIA_ONETIME_PRICE_ID =
  import.meta.env.VITE_STRIPE_ACADEMY_ONETIME_PRICE_ID || 'price_default_onetime';

if (import.meta.env.DEV) {
  console.log('🏫 Academia Price IDs configurados:', {
    membership: ACADEMIA_MEMBERSHIP_PRICE_ID,
    onetime: ACADEMIA_ONETIME_PRICE_ID,
  });
}

const AcademiaCatalog = () => {
  const { user, session, profile } = useAuth();
  const [content, setContent] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: allContent, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        // .eq('status', 'published') // column does not exist
        .order('created_at', { ascending: false });

      // academy_routes table not used; set empty routes
      setRoutes([]);

      if (contentError) {
        console.error('Error fetching content:', contentError);
      } else {
        setContent(allContent);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const { isAdmin } = useAdmin();

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        return;
      }
      const { data } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or('expired_at.is.null,expired_at.gt.now()')
        .limit(1)
        .maybeSingle();

      // Admins should always have access
      setHasAccess(!!data || isAdmin);
    };

    checkAccess();
  }, [user, isAdmin]);

  const handleGetAccess = () => {
    if (!user) {
      setShowAccessModal(true);
    } else {
      // If user is logged in but has no access, show modal
      setShowAccessModal(true);
    }
  };

  const handleCheckout = async (priceId) => {
    if (!user) {
      // This should be handled by the modal, but as a fallback
      alert('Please log in or sign up to continue.');
      return;
    }

    setCheckoutLoading(priceId);

    try {
      console.log('📤 Iniciando checkout de academia con priceId:', priceId);

      // Usar la misma Edge Function que consultoría pero para academia
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: JSON.stringify({
          priceId,
          mode: 'subscription', // O 'payment' según el tipo
          email: user.email,
          metadata: {
            user_id: user.id,
            product_type: 'academia',
            client_name: profile?.name || user.email,
            client_email: user.email,
          },
        }),
      });

      console.log('📥 Respuesta del checkout de academia:', { data, error });

      if (error) throw error;

      if (data && data.url) {
        // Redirigir directamente a Stripe usando window.location
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de checkout válida');
      }
    } catch (error) {
      console.error('❌ Error en checkout de academia:', error);
      alert('No se pudo iniciar el pago. Por favor intenta de nuevo.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const allContent = useMemo(() => {
    const contentWithRoutes = [
      ...content.map((c) => ({ ...c, item_type: 'content' })),
      ...routes.map((r) => ({ ...r, item_type: 'route' })),
    ];
    return contentWithRoutes.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [content, routes]);

  const videos = content.filter((c) => c.content_type === 'video');
  const documents = content.filter((c) => c.content_type === 'document');

  const renderContentCard = (item) => {
    const isRoute = item.item_type === 'route';
    const icon = isRoute ? (
      <Layers className="h-6 w-6 text-primary" />
    ) : item.content_type === 'video' ? (
      <Video className="h-6 w-6 text-primary" />
    ) : (
      <FileText className="h-6 w-6 text-primary" />
    );
    const link = isRoute
      ? `/academia/ruta/${item.content_id}`
      : `/academia/contenido/${item.content_id}`;

    return (
      <motion.div variants={itemVariants} key={item.id}>
        <Card className="h-full flex flex-col glass-card hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold leading-tight">{item.title}</CardTitle>
              {icon}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {!isRoute && item.level && <Badge variant="secondary">{item.level}</Badge>}
              {isRoute && <Badge variant="outline">Ruta</Badge>}
              {!isRoute && item.duration && <Badge variant="outline">{item.duration}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
          </CardContent>
          <CardFooter>
            {hasAccess ? (
              <Button asChild className="w-full">
                <Link to={link}>Ver contenido</Link>
              </Button>
            ) : (
              <Button onClick={handleGetAccess} className="w-full" variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Obtener acceso
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Academia BSB Capital | Formación en inversión, fiscalidad y crypto</title>
        <meta
          name="description"
          content="Acceso exclusivo a vídeos y documentos. Membresía o pago único. Contenidos sin descarga por defecto."
        />
      </Helmet>
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              Academia BSB Capital
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto"
            >
              Formación práctica en inversión, fiscalidad y crypto. Acceso exclusivo para miembros o
              por compra individual.
            </motion.p>
          </motion.div>

          {!hasAccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 max-w-2xl mx-auto bg-card border rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left"
            >
              <p className="font-semibold text-lg flex-grow">Desbloquea todo el conocimiento.</p>
              <Button onClick={handleGetAccess} size="lg">
                Obtener Acceso Ahora
              </Button>
            </motion.div>
          )}

          <div className="mt-16">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="videos">Vídeos</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="routes">Rutas</TabsTrigger>
              </TabsList>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <TabsContent value="all">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {allContent.map(renderContentCard)}
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="videos">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {videos.map(renderContentCard)}
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="documents">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {documents.map(renderContentCard)}
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="routes">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {routes.map((item) => renderContentCard({ ...item, item_type: 'route' }))}
                    </motion.div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold">¿Problemas con el acceso?</h2>
            <p className="mt-2 text-muted-foreground">
              Escríbenos a{' '}
              <a
                href="mailto:info@bsbcapital.io"
                className="text-primary font-semibold hover:underline"
              >
                info@bsbcapital.io
              </a>{' '}
              y te ayudaremos.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Obtener Acceso a la Academia</DialogTitle>
            <DialogDescription>
              Para ver este contenido necesitas una membresía activa o comprar el acceso a la
              Academia.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {!user ? (
              <div className="text-center">
                <p className="mb-4">Primero, necesitas una cuenta.</p>
                <Button asChild className="w-full mb-2">
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/signup">Crear Cuenta</Link>
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => handleCheckout(ACADEMIA_MEMBERSHIP_PRICE_ID)}
                  className="w-full"
                  size="lg"
                  disabled={!!checkoutLoading}
                >
                  {checkoutLoading === ACADEMIA_MEMBERSHIP_PRICE_ID ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Acceder con Membresía
                </Button>
                <Button
                  onClick={() => handleCheckout(ACADEMIA_ONETIME_PRICE_ID)}
                  className="w-full"
                  variant="secondary"
                  size="lg"
                  disabled={!!checkoutLoading}
                >
                  {checkoutLoading === ACADEMIA_ONETIME_PRICE_ID ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Comprar Acceso a la Academia
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademiaCatalog;
