import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, BookOpen, Download, Users } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const CompraExitosa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  useEffect(() => {
    checkUserAndSetup();
    
    // Countdown para redirección automática
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          navigate('/academia/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const checkUserAndSetup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      // Aquí puedes hacer la lógica para activar el acceso del usuario
      // Por ejemplo, actualizar su estado en la base de datos
      await activateUserAccess(user);
    } else {
      // Si no está logueado, redirigir al login
      navigate('/login?redirect=/compra-exitosa&' + searchParams.toString());
    }
  };

  const activateUserAccess = async (user) => {
    try {
      // Actualizar el perfil del usuario para darle acceso a la academia
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          has_academy_access: true,
          purchase_date: new Date().toISOString(),
          // Puedes agregar más campos como plan_type, etc.
        });

      if (error) {
        console.error('Error updating user access:', error);
      }
    } catch (error) {
      console.error('Error in activateUserAccess:', error);
    }
  };

  const handleGoToAcademy = () => {
    navigate('/academia/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="shadow-xl">
          <CardContent className="p-8 text-center">
            {/* Icono de éxito */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </motion.div>

            {/* Título principal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ¡Compra realizada con éxito!
              </h1>
              <p className="text-gray-600 mb-8">
                Bienvenido a la Academia BSB Capital. Tu acceso ha sido activado y ya puedes comenzar tu formación.
              </p>
            </motion.div>

            {/* Información del usuario */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 rounded-lg p-4 mb-8"
              >
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Plan:</strong> Acceso Completo de por vida
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado:</strong> <span className="text-green-600 font-medium">Activo</span>
                </p>
              </motion.div>
            )}

            {/* Próximos pasos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="text-center p-4">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Accede al contenido</h3>
                <p className="text-sm text-gray-600">4 módulos completos listos para ti</p>
              </div>
              <div className="text-center p-4">
                <Download className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Descarga recursos</h3>
                <p className="text-sm text-gray-600">Plantillas y checklists incluidos</p>
              </div>
              <div className="text-center p-4">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Soporte incluido</h3>
                <p className="text-sm text-gray-600">Contacta con nuestro equipo</p>
              </div>
            </motion.div>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-4"
            >
              <Button 
                onClick={handleGoToAcademy}
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Acceder a mi Academia
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <p className="text-sm text-gray-500">
                Serás redirigido automáticamente en {redirectCountdown} segundos
              </p>
            </motion.div>

            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mt-8 pt-6 border-t text-sm text-gray-600"
            >
              <p className="mb-2">
                <strong>¿Necesitas ayuda?</strong> Contacta con nosotros en{' '}
                <a href="mailto:info@bsbcapital.io" className="text-primary hover:underline">
                  info@bsbcapital.io
                </a>
              </p>
              <p>
                Tu recibo de compra ha sido enviado a tu email.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CompraExitosa;