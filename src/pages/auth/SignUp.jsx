import React, { useState } from 'react';
import emailService from '@/lib/emailService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/feedback/use-toast';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, {
      data: {
        full_name: fullName,
        username: username,
      },
    });
    if (!error) {
      // Enviar email de bienvenida personalizado
      try {
        await emailService.sendWelcomeEmail({
          name: fullName,
          email
        });
      } catch (e) {
        // No bloquear el flujo si falla el email
        console.error('Error enviando email de bienvenida:', e);
      }
      toast({
        title: "¡Registro exitoso!",
        description: "Hemos enviado un correo de confirmación. Por favor, verifica tu email para activar tu cuenta.",
      });
      navigate('/login');
    } else {
      // Manejar error de username duplicado
      if (error.message && error.message.toLowerCase().includes('username')) {
        toast({
          title: "Nombre de usuario en uso",
          description: "El nombre de usuario elegido ya está registrado. Por favor, elige otro.",
          variant: "destructive",
        });
      } else if (error.message && error.message.toLowerCase().includes('duplicate')) {
        toast({
          title: "Datos duplicados",
          description: "El email o nombre de usuario ya están registrados.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error en el registro",
          description: error.message || "No se pudo crear la cuenta. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Crear Cuenta - BSB Capital</title>
        <meta name="description" content="Crea una cuenta para gestionar tus accesos en BSB Capital." />
      </Helmet>
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Regístrate para gestionar tus accesos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Tu nombre y apellidos"
                />
              </div>
              <div>
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Elige un nombre único (sin espacios)"
                  minLength="3"
                  pattern="^[a-zA-Z0-9_]+$"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Cuenta
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignUp;