import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserAccess } from '@/hooks/useUserAccess';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp
} from 'lucide-react';

const Academia = () => {
  const { user } = useAuth();
  const { hasAccess, isLoading: accessLoading, userSubscription } = useUserAccess();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalVideos: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademyData = async () => {
      try {
        setLoading(true);

        // Obtener cursos y contenido
        const { data: coursesData, error: coursesError } = await supabase
          .from('course_content')
          .select(`
            *,
            subscription_plans!inner(
              id,
              name,
              features
            )
          `)
          .eq('is_active', true)
          .order('order_index');

        if (coursesError) {
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
    if (!hasAccess || !userSubscription) return false;
    
    // Si no hay planes requeridos específicos, cualquier suscripción activa da acceso
    if (!course.requiredPlans || course.requiredPlans.length === 0) return true;
    
    // Verificar si el plan del usuario está en los planes requeridos
    return course.requiredPlans.includes(userSubscription.plan_id);
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

  if (loading || accessLoading) {
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
                Formación financiera de élite para inversores profesionales
              </p>
              
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
          ) : !hasAccess ? (
            // Usuario logueado sin acceso
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
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-6 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">
                      ¡Bienvenido a la Academia, {user.email}!
                    </h3>
                    <p className="opacity-90">
                      Membresía: {userSubscription?.subscription_plans?.name || 'Activa'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, index) => {
                  const canAccess = canAccessCourse(course);
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                      <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                        canAccess ? 'hover:shadow-blue-100' : 'opacity-60'
                      }`}>
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            {canAccess ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {Math.round(course.totalDuration / 60)}h
                            </div>
                            <div className="flex items-center">
                              <Play className="h-4 w-4 mr-1" />
                              {course.contents.length} contenidos
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-3">
                            {course.contents.slice(0, 3).map((content) => (
                              <div key={content.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                                {getContentTypeIcon(content.content_type)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {content.title}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {getContentTypeLabel(content.content_type)}
                                    </Badge>
                                    {content.duration_minutes && (
                                      <span className="text-xs text-gray-500">
                                        {content.duration_minutes}min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {course.contents.length > 3 && (
                              <p className="text-sm text-gray-500 text-center pt-2">
                                +{course.contents.length - 3} contenidos más
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-6">
                            {canAccess ? (
                              <Button asChild className="w-full">
                                <Link to={`/academia/curso/${course.id}`}>
                                  Acceder al Curso
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="outline" className="w-full" disabled>
                                <Lock className="h-4 w-4 mr-2" />
                                Requiere Membresía Premium
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
                    Contenido Próximamente
                  </h3>
                  <p className="text-lg text-gray-600">
                    Estamos preparando contenido exclusivo para ti. ¡Mantente atento!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Academia;