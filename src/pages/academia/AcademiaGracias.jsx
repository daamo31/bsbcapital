import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AcademiaGracias = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando tu compra...');

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (!sessionId || !user) {
      setStatus('error');
      setMessage('No se encontró información de la sesión o no has iniciado sesión.');
      return;
    }

    const verifyPurchase = async () => {
      // We assume the webhook has already run. We just check for access.
      // A more robust solution might involve a server-side check of the session.
      const { data, error } = await supabase
        .from('user_academy_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        // Retry after a short delay in case the webhook is slow
        setTimeout(async () => {
          const { data: retryData, error: retryError } = await supabase
            .from('user_academy_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
          
          if (retryError || !retryData) {
            setStatus('error');
            setMessage('No pudimos confirmar tu acceso. Si el pago se completó, por favor contacta a soporte.');
          } else {
            setStatus('success');
            setMessage('¡Gracias por tu compra! Ya tienes acceso a la Academia.');
          }
        }, 3000);
      } else {
        setStatus('success');
        setMessage('¡Gracias por tu compra! Ya tienes acceso a la Academia.');
      }
    };

    verifyPurchase();
  }, [location, user]);

  return (
    <>
      <Helmet>
        <title>Gracias por tu compra - Academia BSB Capital</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-24 text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
            <h1 className="text-3xl font-bold">Procesando...</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold">¡Acceso Concedido!</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
            <Button asChild className="mt-8" size="lg">
              <Link to="/academia">Ir a la Academia</Link>
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-3xl font-bold">Hubo un Problema</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
            <Button asChild className="mt-8" variant="outline">
              <Link to="/contacto">Contactar a Soporte</Link>
            </Button>
          </>
        )}
      </motion.div>
    </>
  );
};

export default AcademiaGracias;