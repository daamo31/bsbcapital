import React, { useState, useEffect } from 'react';
import emailService from '@/lib/emailService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/components/ui/feedback/use-toast';

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Anti-bot measures (honeypot + timing + interaction)
  const [honeypot, setHoneypot] = useState('');
  const [formStartTime] = useState(Date.now());
  const [interactionCount, setInteractionCount] = useState(0);

  // Registrar interacciones del usuario (los bots no hacen esto)
  useEffect(() => {
    const handleInteraction = () => {
      setInteractionCount((prev) => prev + 1);
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  // Función para validar fortaleza de contraseña
  const validatePasswordStrength = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    const score = Object.values(checks).filter(Boolean).length;

    return {
      ...checks,
      score,
      isValid: checks.length && checks.uppercase && checks.lowercase && checks.number,
      strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong',
    };
  };

  const passwordStrength = validatePasswordStrength(password);

  // Validación anti-bot
  const validateAntiBot = () => {
    // 1. Honeypot: campo oculto que solo los bots llenarían
    if (honeypot !== '') {
      console.warn('Bot detected: honeypot filled');
      return false;
    }

    // 2. Validación de tiempo: muy rápido = bot
    const timeSpent = (Date.now() - formStartTime) / 1000; // segundos
    if (timeSpent < 3) {
      toast({
        title: 'Demasiado rápido',
        description: 'Por favor, tómate tu tiempo para completar el formulario.',
        variant: 'destructive',
      });
      return false;
    }

    // 3. Validación de interacciones: sin interacciones = bot
    if (interactionCount < 5) {
      toast({
        title: 'Verificación necesaria',
        description: 'Por favor, interactúa con el formulario antes de enviar.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const validateForm = () => {
    // Validar username
    if (!username.trim() || username.length < 3) {
      toast({
        title: 'Nombre de usuario inválido',
        description: 'El nombre de usuario debe tener al menos 3 caracteres.',
        variant: 'destructive',
      });
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast({
        title: 'Nombre de usuario inválido',
        description: 'Solo se permiten letras, números y guiones bajos.',
        variant: 'destructive',
      });
      return false;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, ingresa un email válido.',
        variant: 'destructive',
      });
      return false;
    }

    // Validar contraseña
    if (!passwordStrength.isValid) {
      toast({
        title: 'Contraseña débil',
        description:
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
        variant: 'destructive',
      });
      return false;
    }

    // Validar coincidencia de contraseñas
    if (password !== confirmPassword) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Por favor, verifica que ambas contraseñas sean iguales.',
        variant: 'destructive',
      });
      return false;
    }

    // Validar términos y condiciones
    if (!acceptTerms) {
      toast({
        title: 'Términos y condiciones',
        description: 'Debes aceptar los términos y condiciones para continuar.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validación anti-bot
    if (!validateAntiBot()) {
      return;
    }

    // Validación de formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, {
        data: {
          username: username,
          registration_timestamp: Date.now(),
          form_completion_time: (Date.now() - formStartTime) / 1000,
        },
      });

      if (!error) {
        // Enviar email de bienvenida personalizado
        try {
          await emailService.sendWelcomeEmail({
            name: username,
            email,
          });
        } catch (e) {
          // No bloquear el flujo si falla el email
          console.error('Error enviando email de bienvenida:', e);
        }
        toast({
          title: '¡Registro exitoso!',
          description:
            'Hemos enviado un correo de confirmación. Por favor, verifica tu email para activar tu cuenta.',
        });
        navigate('/login');
      } else {
        // Manejar error de username duplicado
        if (error.message && error.message.toLowerCase().includes('username')) {
          toast({
            title: 'Nombre de usuario en uso',
            description: 'El nombre de usuario elegido ya está registrado. Por favor, elige otro.',
            variant: 'destructive',
          });
        } else if (error.message && error.message.toLowerCase().includes('duplicate')) {
          toast({
            title: 'Datos duplicados',
            description: 'El email o nombre de usuario ya están registrados.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error en el registro',
            description: error.message || 'No se pudo crear la cuenta. Intenta de nuevo.',
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('Error en registro:', err);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!password) return '';
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return '';
    }
  };

  const getPasswordStrengthText = () => {
    if (!password) return '';
    switch (passwordStrength.strength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      default:
        return '';
    }
  };

  return (
    <>
      <Helmet>
        <title>Crear Cuenta - BSB Capital</title>
        <meta
          name="description"
          content="Crea una cuenta para gestionar tus accesos en BSB Capital."
        />
      </Helmet>
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Regístrate para acceder a todos los servicios de BSB Capital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Campo Honeypot - OCULTO para usuarios, visible para bots */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>

              {/* Nombre de usuario */}
              <div>
                <Label htmlFor="username">Nombre de usuario *</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  required
                  placeholder="usuario_ejemplo"
                  minLength="3"
                  pattern="^[a-z0-9_]+$"
                  className={
                    username && username.length >= 3 && /^[a-z0-9_]+$/.test(username)
                      ? 'border-green-300'
                      : ''
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo letras minúsculas, números y guiones bajos (sin espacios)
                </p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  placeholder="tu@email.com"
                  className={
                    email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-green-300' : ''
                  }
                />
              </div>

              {/* Contraseña */}
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {passwordStrength.length ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Mínimo 8 caracteres
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {passwordStrength.uppercase ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Una letra mayúscula
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {passwordStrength.lowercase ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Una letra minúscula
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {passwordStrength.number ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Un número
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {passwordStrength.special ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Un carácter especial (recomendado)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <Label htmlFor="confirm-password">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repite tu contraseña"
                    minLength="8"
                    className={
                      confirmPassword && password === confirmPassword
                        ? 'border-green-300'
                        : confirmPassword
                          ? 'border-red-300'
                          : ''
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Las contraseñas no coinciden
                  </p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Términos y condiciones */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <Label htmlFor="terms" className="text-xs text-gray-600 font-normal cursor-pointer">
                  Acepto los{' '}
                  <Link
                    to="/terminos"
                    className="text-brand-accent hover:underline"
                    target="_blank"
                  >
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link
                    to="/privacidad"
                    className="text-brand-accent hover:underline"
                    target="_blank"
                  >
                    política de privacidad
                  </Link>
                  . *
                </Label>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Todos los campos marcados con * son obligatorios. Este formulario está protegido
                  contra bots mediante técnicas de validación avanzadas.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Cuenta
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="underline text-brand-accent hover:text-brand-accent-dark"
              >
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
