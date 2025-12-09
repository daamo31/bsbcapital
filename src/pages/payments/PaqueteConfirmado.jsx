import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';

const PaqueteConfirmado = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simular verificación de pago
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-brand-green-600" />
          <p className="text-lg text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Paquete Confirmado - BSB Capital</title>
        <meta name="description" content="Tu paquete ha sido confirmado exitosamente" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-brand-green-600 border-2 shadow-2xl">
            <CardHeader className="text-center pb-6 bg-gradient-to-br from-brand-green-50 to-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 bg-brand-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-brand-green-900 mb-4">
                ¡Pago Confirmado!
              </CardTitle>
              <p className="text-lg text-gray-700">Tu paquete ha sido activado exitosamente</p>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="bg-brand-green-50 border-l-4 border-brand-green-600 p-6 rounded-r-lg">
                <h3 className="text-xl font-bold text-brand-green-900 mb-3">¿Qué sigue ahora?</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Accede a BSB Academy:</strong> Todos los contenidos de formación ya
                      están disponibles para ti.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Consultas incluidas:</strong> Si tu paquete incluye consultorías
                      personalizadas, te contactaremos pronto para agendarlas.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-green-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Email de confirmación:</strong> Recibirás un correo con todos los
                      detalles de tu paquete en breve.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Información del pago</h4>
                <p className="text-sm text-gray-600">
                  ID de sesión:{' '}
                  <code className="bg-white px-2 py-1 rounded text-xs">{sessionId || 'N/A'}</code>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/academia')}
                  className="flex-1 py-6 text-lg font-bold bg-brand-green-600 hover:bg-brand-green-700"
                >
                  Ir a BSB Academy
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-bold border-brand-green-600 text-brand-green-600 hover:bg-brand-green-50"
                >
                  Ver mi Dashboard
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  ¿Necesitas ayuda?{' '}
                  <a
                    href="mailto:info@bsbcapital.io"
                    className="text-brand-green-600 hover:underline font-semibold"
                  >
                    Contáctanos
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PaqueteConfirmado;
