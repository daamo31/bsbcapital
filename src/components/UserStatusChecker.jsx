import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  User, 
  CheckCircle, 
  AlertCircle,
  Key,
  CreditCard,
  Shield,
  RefreshCw
} from 'lucide-react';

const UserStatusChecker = () => {
  const { user, signIn, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const testCredentials = {
    email: 'test@bsbcapital.com',
    password: 'TestUser123!'
  };

  const checkUserStatus = async () => {
    setChecking(true);
    try {
      if (!user) {
        setUserInfo({ error: 'No hay usuario logueado' });
        return;
      }

      // Verificar información del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Verificar suscripciones
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            id,
            name,
            price,
            features,
            duration_months
          )
        `)
        .eq('user_id', user.id);

      setUserInfo({
        auth: user,
        profile: profile,
        profileError: profileError
      });

      setSubscriptionInfo({
        subscriptions: subscriptions || [],
        error: subError
      });

    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      await signIn(testCredentials.email, testCredentials.password);
    } catch (error) {
      console.error('Error en login de prueba:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserInfo(null);
      setSubscriptionInfo(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Credenciales de prueba */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Key className="h-5 w-5 mr-2" />
            Credenciales de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Email:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                {testCredentials.email}
              </code>
            </div>
            <div>
              <p className="font-semibold">Password:</p>
              <code className="bg-blue-100 px-2 py-1 rounded text-sm">
                {testCredentials.password}
              </code>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            {!user ? (
              <Button onClick={handleTestLogin} className="bg-blue-600 hover:bg-blue-700">
                <User className="h-4 w-4 mr-2" />
                Login Automático
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="outline">
                Cerrar Sesión
              </Button>
            )}
            
            <Button 
              onClick={checkUserStatus} 
              disabled={!user || checking}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Verificar Estado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado del usuario */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Estado del Usuario
              <Badge className="ml-2" variant={user ? 'default' : 'secondary'}>
                {user ? 'Conectado' : 'Desconectado'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userInfo && (
              <div className="space-y-4">
                {/* Info de autenticación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">ID de Usuario:</p>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs block mt-1">
                      {userInfo.auth?.id}
                    </code>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p className="text-gray-600">{userInfo.auth?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Confirmado:</p>
                    <Badge variant={userInfo.auth?.email_confirmed_at ? 'default' : 'destructive'}>
                      {userInfo.auth?.email_confirmed_at ? '✅ Sí' : '❌ No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">Último acceso:</p>
                    <p className="text-gray-600 text-xs">
                      {userInfo.auth?.last_sign_in_at ? 
                        new Date(userInfo.auth.last_sign_in_at).toLocaleString() : 
                        'Nunca'
                      }
                    </p>
                  </div>
                </div>

                {/* Perfil */}
                {userInfo.profile ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Perfil encontrado: {userInfo.profile.full_name || 'Sin nombre'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ❌ No se encontró perfil en la tabla profiles
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Suscripciones */}
      {subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Suscripciones
              <Badge className="ml-2" variant={subscriptionInfo.subscriptions.length > 0 ? 'default' : 'secondary'}>
                {subscriptionInfo.subscriptions.length} activa(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionInfo.subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptionInfo.subscriptions.map((sub, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {sub.subscription_plans?.name || 'Plan Desconocido'}
                      </h4>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Precio:</p>
                        <p className="text-gray-600">
                          €{sub.subscription_plans?.price || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Inicio:</p>
                        <p className="text-gray-600">
                          {new Date(sub.starts_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Expira:</p>
                        <p className="text-gray-600">
                          {sub.expires_at ? 
                            new Date(sub.expires_at).toLocaleDateString() : 
                            'Nunca'
                          }
                        </p>
                      </div>
                    </div>

                    {sub.subscription_plans?.features && (
                      <div className="mt-3">
                        <p className="font-medium text-sm">Características:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {sub.subscription_plans.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ No se encontraron suscripciones activas
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acceso a Hotmart */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-900">
            <Shield className="h-5 w-5 mr-2" />
            Acceso a Hotmart
          </CardTitle>
        </CardHeader>
        <CardContent className="text-purple-800">
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Product ID configurado:</strong> 6308462</p>
            <p>✅ <strong>Usuario test autorizado</strong> para acceso automático</p>
            <p>✅ <strong>Fallback local</strong> habilitado si API falla</p>
            <p>⚙️ <strong>Modo de prueba:</strong> Hotmart mock y real disponibles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatusChecker;