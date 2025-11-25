import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import HotmartIframePlayer from '@/components/hotmart/HotmartIframePlayer';
import { 
  Loader2, 
  Play, 
  FileText, 
  Clock, 
  BookOpen, 
  Lock,
  CheckCircle,
  Star,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  X
} from 'lucide-react';

const Academia = () => {
  const { user } = useAuth();
  const { hasAccess, isLoading: accessLoading, userSubscription } = useUserAccess();
  const { isAdmin, canAccessContent, loading: adminLoading, accessLevel, userRole } = useAdmin();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalVideos: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null); // Para mostrar contenido embebido
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('🔍 Academia Debug:', {
      user: user?.email,
      isAdmin,
      accessLevel,
      userRole,
      hasAccess,
      loading: adminLoading
    });
  }, [user, isAdmin, accessLevel, userRole, hasAccess, adminLoading]);

  useEffect(() => {
    const fetchAcademyData = async () => {
      try {
        setLoading(true);

        // Obtener contenido de la tabla course_content
        const { data: coursesData, error: coursesError } = await supabase
          .from('course_content')
          .select('*')
          .order('order_index');

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          setCourses([]);
        } else {
          console.log('📚 Contenido obtenido:', coursesData);
          setCourses(coursesData || []);
          
          // Calcular estadísticas
          const videos = coursesData?.filter(c => c.content_type === 'video').length || 0;
          const totalContent = coursesData?.length || 0;
          
          setStats({
            totalCourses: totalContent,
            totalVideos: videos,
            totalHours: Math.ceil(videos * 0.5) // Estimación de 30min por video
          });
        }
      } catch (error) {
          console.error('Error fetching courses:', coursesError);
          return;
        }

        // Agrupar contenido por curso
        const groupedCourses = coursesData.reduce((acc, content) => {
          const courseId = content.course_id || 'general';
          if (!acc[courseId]) {
            acc[courseId] = {
              id: courseId,
              title: courseId === 'general' ? 'Contenido General' : `Curso ${courseId}`,
              contents: [],
              totalDuration: 0,
              requiredPlans: new Set()
            };
          }
          
          acc[courseId].contents.push(content);
          acc[courseId].totalDuration += content.duration_minutes || 0;
          
          // Agregar planes requeridos
          if (content.required_plans) {
            content.required_plans.forEach(planId => {
              acc[courseId].requiredPlans.add(planId);
            });
          }

          return acc;
        }, {});

        const coursesArray = Object.values(groupedCourses).map(course => ({
          ...course,
          requiredPlans: Array.from(course.requiredPlans)
        }));

        setCourses(coursesArray);

        // Calcular estadísticas
        const totalVideos = coursesData.filter(c => c.content_type === 'video').length;
        const totalHours = Math.round(coursesData.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / 60);
        
        setStats({
          totalCourses: coursesArray.length,
          totalVideos,
          totalHours
        });

      } catch (error) {
        console.error('Error fetching academy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyData();
  }, []);

  // Función para verificar si el usuario puede acceder a un curso específico
  const canAccessCourse = (course) => {
    console.log('🔍 Evaluando acceso:', {
      courseTitle: course.title,
      isAdmin,
      hasAccess,
      userRole,
      accessLevel,
      courseAccessLevel: course.required_access_level,
      isFree: course.is_free
    });

    // Los admins pueden acceder a todo
    if (isAdmin) {
      console.log('🔑 Admin access granted for:', course.title);
      return true;
    }

    // Si es contenido gratuito
    if (course.is_free) {
      console.log('🆓 Free content access for:', course.title);
      return true;
    }

    // Verificar acceso según nivel requerido
    const requiredLevel = course.required_access_level || 'basic';
    console.log(`🔍 Checking access for ${course.title}: required=${requiredLevel}, hasAccess=${hasAccess}`);
    
    return hasAccess || (userSubscription && userSubscription.status === 'active');
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'live': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'video': return 'Video';
      case 'document': return 'Documento';
      case 'live': return 'En Vivo';
      case 'quiz': return 'Quiz';
      default: return 'Contenido';
    }
  };

  if (loading || accessLoading || adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Academia BSB Capital - Formación Financiera Profesional</title>
        <meta name="description" content="Accede a contenido exclusivo de formación financiera y algoritmos de inversión en la Academia BSB Capital." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Academia BSB Capital
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Formación profesional en criptoactivos con metodología y rigor
              </p>

              {/* Estado del usuario y debug info */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {isAdmin && (
                  <Badge className="bg-red-500 text-white">
                    👨‍💼 ADMIN ACCESS
                  </Badge>
                )}
                {hasAccess && (
                  <Badge className="bg-green-500 text-white">
                    ✓ Premium Access
                  </Badge>
                )}
                {userSubscription && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {userSubscription.subscription_type || 'Subscription Active'}
                  </Badge>
                )}
                {!hasAccess && !isAdmin && (
                  <Badge variant="outline" className="bg-yellow-500/20 text-white border-yellow-400">
                    ⚠️ Limited Access
                  </Badge>
                )}
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-8 w-8 mr-2" />
                    <span className="text-3xl font-bold">{stats.totalCourses}</span>
                  </div>
                  <p className="text-sm opacity-90">Cursos Disponibles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Play className="h-8 w-8 mr-2" />
                    <span className="text-3xl font-bold">{stats.totalVideos}</span>
                  </div>
                  <p className="text-sm opacity-90">Videos Formativos</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-8 w-8 mr-2" />
                    <span className="text-3xl font-bold">{stats.totalHours}h</span>
                  </div>
                  <p className="text-sm opacity-90">Contenido Total</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!user ? (
            // Usuario no logueado
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-16"
            >
              <Lock className="h-24 w-24 mx-auto text-gray-400 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Acceso Exclusivo para Miembros
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Únete a nuestra comunidad de inversores y accede a formación especializada, 
                análisis de mercado y estrategias algoritmos de inversión.
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/membresias">Ver Membresías</Link>
                </Button>
              </div>
            </motion.div>
          ) : !hasAccess && !isAdmin ? (
            // Usuario logueado sin acceso (no admin)
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center py-16"
            >
              <TrendingUp className="h-24 w-24 mx-auto text-yellow-500 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Hola {user.email}! Activa tu Membresía
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Para acceder al contenido exclusivo de la Academia BSB Capital, 
                necesitas una membresía activa. Elige el plan que mejor se adapte a tus objetivos.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link to="/membresias">Activar Membresía</Link>
              </Button>
            </motion.div>
          ) : (
            // Usuario con acceso - Mostrar contenido
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Welcome Message */}
              <div className={`rounded-lg p-6 mb-8 ${
                isAdmin 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
              }`}>
                <div className="flex items-center">
                  {isAdmin ? (
                    <Shield className="h-8 w-8 mr-3" />
                  ) : (
                    <CheckCircle className="h-8 w-8 mr-3" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {isAdmin 
                        ? `¡Bienvenido Admin!`
                        : `¡Bienvenido a la Academia, ${user.email}!`
                      }
                    </h3>
                    <p className="opacity-90">
                      {isAdmin 
                        ? 'Acceso completo como administrador'
                        : `Membresía: ${userSubscription?.subscription_plans?.name || 'Activa'}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((content, index) => {
                  const canAccess = canAccessCourse(content);
                  
                  return (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                        canAccess ? 'hover:shadow-blue-100 border-green-200' : 'opacity-60'
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                            {canAccess ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {getContentTypeIcon(content.content_type)}
                            <Badge variant="outline">
                              {getContentTypeLabel(content.content_type)}
                            </Badge>
                            <Badge variant={content.is_free ? 'default' : 'secondary'}>
                              {content.is_free ? 'Gratuito' : content.required_access_level}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {content.description}
                          </p>
                          
                          {content.module_id && (
                            <Badge variant="outline" className="mb-4">
                              {content.module_id}
                            </Badge>
                          )}
                          
                          <div className="mt-6">
                            {canAccess ? (
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  if (content.content_type === 'video') {
                                    // NUEVA INTEGRACIÓN EMBEBIDA - No redirección
                                    setSelectedContent(content);
                                    setIsPlayerOpen(true);
                                  } else {
                                    console.log('Accediendo a:', content.title);
                                  }
                                }}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Ver Contenido
                              </Button>
                            ) : (
                              <Button variant="outline" className="w-full" disabled>
                                <Lock className="h-4 w-4 mr-2" />
                                Requiere {content.required_access_level}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {courses.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="h-24 w-24 mx-auto text-gray-400 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isAdmin ? 'No hay contenido configurado' : 'Contenido Próximamente'}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {isAdmin 
                      ? 'Ejecuta las migraciones para agregar contenido a la base de datos.'
                      : 'Estamos preparando contenido exclusivo para ti. ¡Mantente atento!'
                    }
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* REPRODUCTOR EMBEBIDO - NUEVA INTEGRACIÓN PROFESIONAL */}
      {isPlayerOpen && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedContent.title}</h2>
              <Button
                onClick={() => {
                  setIsPlayerOpen(false);
                  setSelectedContent(null);
                }}
                variant="ghost"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <HotmartIframePlayer
                contentId={selectedContent.content_id}
                title={selectedContent.title}
                description={selectedContent.description}
                hotmartVideoId={selectedContent.hotmart_video_id}
                customHeight="500px"
                allowFullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Academia;