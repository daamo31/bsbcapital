import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { MailCheck, Loader2 } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Button } from '@/components/ui/button';

    const VerifyEmail = () => {
      const { state } = useLocation();
      const { resendVerificationEmail } = useAuth();
      const [loading, setLoading] = useState(false);
      const email = state?.email;

      const handleResend = async () => {
        if (!email) return;
        setLoading(true);
        await resendVerificationEmail(email);
        setLoading(false);
      };

      return (
        <>
          <Helmet>
            <title>Verifica tu Email - BSB Capital</title>
            <meta name="description" content="Revisa tu bandeja de entrada para verificar tu dirección de correo electrónico." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12"
          >
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                  <MailCheck className="h-10 w-10" />
                </div>
                <CardTitle className="mt-4">¡Casi listo!</CardTitle>
                <CardDescription>Revisa tu bandeja de entrada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Te hemos enviado un correo con un enlace para verificar tu cuenta. Haz clic en ese enlace para completar el registro.
                </p>
                <p className="text-sm text-muted-foreground">
                  (Si no lo encuentras, revisa tu carpeta de spam. El enlace es válido por 15 minutos)
                </p>
                {email && (
                  <Button onClick={handleResend} disabled={loading} variant="outline">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reenviar enlace de verificación
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      );
    };

    export default VerifyEmail;