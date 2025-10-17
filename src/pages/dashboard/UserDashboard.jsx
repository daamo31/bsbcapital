import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Progress } from '@/components/ui/feedback/progress';
import { 
  User, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  Play, 
  CheckCircle,
  Clock,
  Trophy,
  Star,
  Settings,
  Download,
  Eye,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/feedback/use-toast';
import AdminNotification from '@/components/admin/AdminNotification';

const UserDashboard = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState(null);
  const [userContent, setUserContent] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user && user.id && !loadingData) {
      loadUserData();
    }
  }, [user?.id]); // Solo cuando cambie el ID del usuario

  const loadUserData = async () => {
    if (loadingData) return; // Evitar llamadas múltiples
    
    try {
      setLoadingData(true);
      await Promise.all([
        loadSubscription(),
        loadUserContent(),
        loadUserProgress()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

  const loadSubscription = async () => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading subscription:', error);
      return;
    }

    if (data && data.length > 0) {
      setSubscription(data[0]);
    } else {
      setSubscription(null);
    }
  };

  const loadUserContent = async () => {
    const { data, error } = await supabase.rpc('get_user_accessible_content', {
      user_uuid: user.id
    });

    if (error) {
      console.error('Error loading user content:', error);
      return;
    }

    setUserContent(data || []);
  };

  const loadUserProgress = async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        course_content(title, content_type, duration_minutes)
      `)
      .eq('user_id', user.id)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    setProgress(data || []);
  };

  const getProgressStats = () => {
    const totalContent = userContent.filter(c => c.has_access).length;
    const completedContent = progress.filter(p => p.progress_percentage === 100).length;
    const inProgressContent = progress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length;
    
    return { totalContent, completedContent, inProgressContent };
  };

  const getTotalWatchTime = () => {
    return progress.reduce((total, p) => total + (p.time_watched_minutes || 0), 0);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const stats = getProgressStats();
  const totalWatchTime = getTotalWatchTime();

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Mi Dashboard - BSB Capital</title>
        <meta name="description" content="Panel de control de tu membresía y progreso en BSB Capital" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="truncate">Bienvenido, {user.user_metadata?.full_name || user.email.split('@')[0]}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs sm:text-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrador
                  </Badge>
                )}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Gestiona tu membresía y revisa tu progreso de aprendizaje
              </p>
            </div>
            {isAdmin && (
              <Button asChild variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 self-start sm:self-auto text-sm">
                <Link to="/admin">
                  <Settings className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Panel de Administración</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Admin Notification */}
        <AdminNotification />

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Contenido Total</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.totalContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Completado</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.completedContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">En Progreso</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{stats.inProgressContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Tiempo Total</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{formatDuration(totalWatchTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Subscription Info */}
          <div className="lg:col-span-1">
            <Card className="mb-4 sm:mb-6">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Mi Membresía
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {subscription ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                        {subscription.subscription_plans.name}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <Badge variant="success">Activa</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="font-semibold">
                        ${subscription.subscription_plans.price} {subscription.subscription_plans.currency}
                      </p>
                    </div>
                    {subscription.expires_at && (
                      <div>
                        <p className="text-sm text-gray-600">Expira</p>
                        <p className="font-semibold">
                          {new Date(subscription.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/membresias')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Gestionar Plan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm sm:text-base text-gray-600 mb-4">No tienes una membresía activa</p>
                    <Button onClick={() => navigate('/membresias')} className="text-sm">
                      Ver Planes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Progreso Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {progress.slice(0, 5).map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">{item.course_content.title}</p>
                        <div className="flex items-center mt-1 gap-2">
                          <Progress value={item.progress_percentage} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {item.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <p className="text-gray-500 text-xs sm:text-sm text-center py-4">
                      Aún no has comenzado ningún contenido
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Library */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Mi Contenido
                </CardTitle>
                <CardDescription className="text-sm">
                  Contenido al que tienes acceso con tu membresía actual
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {userContent.filter(c => c.has_access).map((content) => {
                    const userProgress = progress.find(p => p.content_id === content.content_id);
                    const progressPercent = userProgress?.progress_percentage || 0;
                    
                    return (
                      <div key={content.content_id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{content.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{content.description}</p>
                            <div className="flex flex-wrap items-center mt-2 gap-2">
                              <Badge variant="outline" className="capitalize text-xs">
                                {content.content_type}
                              </Badge>
                              {content.duration_minutes && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuration(content.duration_minutes)}
                                </span>
                              )}
                            </div>
                            {progressPercent > 0 && (
                              <div className="mt-3">
                                <Progress value={progressPercent} className="w-full h-2" />
                                <span className="text-xs text-gray-500 mt-1 block">
                                  {progressPercent}% completado
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="self-start sm:ml-4">
                            <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {userContent.filter(c => c.has_access).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No tienes contenido disponible con tu plan actual
                      </p>
                    </div>
                  )}
                  
                  {userContent.filter(c => c.has_access).length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tienes acceso a contenido aún</p>
                      <Button className="mt-4" onClick={() => navigate('/membresias')}>
                        Ver Planes de Membresía
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;