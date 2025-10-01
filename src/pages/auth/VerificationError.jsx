import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { XCircle } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';

    const VerificationError = () => {
      return (
        <>
          <Helmet>
            <title>Error de Verificación - BSB Capital</title>
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12"
          >
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit">
                  <XCircle className="h-10 w-10" />
                </div>
                <CardTitle className="mt-4">Error de Verificación</CardTitle>
                <CardDescription>El enlace de verificación ha caducado o no es válido.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Por favor, solicita un nuevo enlace e inténtalo de nuevo.
                </p>
                <p className="text-sm text-muted-foreground">
                  Si el problema persiste, contacta con nuestro equipo de soporte.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <Link to="/signup">Solicitar nuevo enlace</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <a href="mailto:info@bsbcapital.io">Contactar Soporte</a>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      );
    };

    export default VerificationError;