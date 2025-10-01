import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscription, setSubscription] = useState(null);
  const [userContent, setUserContent] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {user.user_metadata?.full_name || user.email.split('@')[0]}
          </h1>
          <p className="text-gray-600">
            Gestiona tu membresía y revisa tu progreso de aprendizaje
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Contenido Total</p>
                  <p className="text-2xl font-bold">{stats.totalContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completado</p>
                  <p className="text-2xl font-bold">{stats.completedContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Play className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">En Progreso</p>
                  <p className="text-2xl font-bold">{stats.inProgressContent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Tiempo Total</p>
                  <p className="text-2xl font-bold">{formatDuration(totalWatchTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Info */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Mi Membresía
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div>
                      <Badge className="bg-green-100 text-green-800">
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
                    <p className="text-gray-600 mb-4">No tienes una membresía activa</p>
                    <Button onClick={() => navigate('/membresias')}>
                      Ver Planes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Progreso Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.course_content.title}</p>
                        <div className="flex items-center mt-1">
                          <Progress value={item.progress_percentage} className="w-16 h-2" />
                          <span className="text-xs text-gray-500 ml-2">
                            {item.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {progress.length === 0 && (
                    <p className="text-gray-500 text-sm">
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
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Mi Contenido
                </CardTitle>
                <CardDescription>
                  Contenido al que tienes acceso con tu membresía actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userContent.filter(c => c.has_access).map((content) => {
                    const userProgress = progress.find(p => p.content_id === content.content_id);
                    const progressPercent = userProgress?.progress_percentage || 0;
                    
                    return (
                      <div key={content.content_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{content.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <Badge variant="outline" className="capitalize">
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
                                <span className="text-xs text-gray-500 mt-1">
                                  {progressPercent}% completado
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
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