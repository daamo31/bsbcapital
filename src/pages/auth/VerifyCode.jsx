import React, { useState } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/forms/input';
    import { Label } from '@/components/ui/forms/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
    import { Loader2 } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const VerifyCode = () => {
      const { state } = useLocation();
      const navigate = useNavigate();
      const { verifyOtp } = useAuth();
      const [code, setCode] = useState('');
      const [loading, setLoading] = useState(false);
      const email = state?.email;

      if (!email) {
        // Redirect if email is not in state (e.g., direct navigation)
        navigate('/signup');
        return null;
      }

      const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await verifyOtp(email, code);
        if (!error) {
          navigate('/academia');
        } else {
          navigate('/error-verificacion');
        }
        setLoading(false);
      };

      return (
        <>
          <Helmet>
            <title>Verificar Código - BSB Capital</title>
          </Helmet>
          <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Verifica tu Cuenta</CardTitle>
                <CardDescription>
                  Hemos enviado un código a <strong>{email}</strong>. Introdúcelo a continuación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Código de Verificación</Label>
                    <Input
                      id="code"
                      type="text"
                      name="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      placeholder="Introduce tu código"
                      maxLength="6"
                    />
                  </div>
                  <input type="hidden" name="verification_type" value="email_code" />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verificar y Entrar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      );
    };

    export default VerifyCode;