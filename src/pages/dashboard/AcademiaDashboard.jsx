import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Download, 
  Play, 
  Award,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const AcademiaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);

  const modules = [
    {
      id: 1,
      title: 'Fundamentos de gestión del riesgo',
      description: 'Domina las bases para proteger tu capital',
      duration: '2h 30min',
      lessons: 8,
      completed: true,
      progress: 100
    },
    {
      id: 2,
      title: 'Fiscalidad y cumplimiento (crypto)',
      description: 'Entiende tus obligaciones fiscales con criptoactivos',
      duration: '1h 45min', 
      lessons: 6,
      completed: false,
      progress: 60
    },
    {
      id: 3,
      title: 'Operativa con derivados',
      description: 'Visión institucional de futuros y opciones',
      duration: '3h 15min',
      lessons: 12,
      completed: false,
      progress: 25
    },
    {
      id: 4,
      title: 'Estructuras y checklists',
      description: 'Sistemas paso a paso para analizar y ejecutar',
      duration: '2h 00min',
      lessons: 10,
      completed: false,
      progress: 0
    }
  ];

  const resources = [
    { name: 'Checklist de Análisis de Riesgo', type: 'PDF', size: '2.3 MB' },
    { name: 'Plantilla de Gestión de Cartera', type: 'Excel', size: '1.8 MB' },
    { name: 'Guía Fiscal Crypto 2024', type: 'PDF', size: '5.1 MB' },
    { name: 'Calculadora de Derivados', type: 'Excel', size: '3.2 MB' }
  ];

  useEffect(() => {
    checkUser();
    calculateProgress();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login?redirect=/academia/dashboard');
      return;
    }
    setUser(user);
  };

  const calculateProgress = () => {
    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
    const avgProgress = totalProgress / modules.length;
    setProgress(avgProgress);
    setCompletedModules(modules.filter(m => m.completed));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Academia</h1>
              <p className="text-gray-600">Bienvenido de vuelta, {user.email.split('@')[0]}</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Acceso Completo
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                  <p className="text-gray-600">Progreso Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{completedModules.length}</p>
                  <p className="text-gray-600">Módulos Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">9h 30m</p>
                  <p className="text-gray-600">Contenido Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-gray-600">Certificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Módulos del Curso */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Módulos del Curso</CardTitle>
                <CardDescription>
                  Continúa tu formación donde lo dejaste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{module.title}</h3>
                          {module.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>{module.lessons} lecciones</span>
                          <span>{module.duration}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progreso</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => navigate(`/academia/modulo/${module.id}`)}
                          size="sm"
                          variant={module.progress > 0 ? "default" : "outline"}
                        >
                          {module.progress > 0 ? (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Continuar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Empezar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recursos Descargables */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recursos Descargables</CardTitle>
                <CardDescription>
                  Plantillas y materiales de apoyo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Soporte */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nuestro equipo está aquí para ayudarte en tu proceso de aprendizaje.
                </p>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademiaDashboard;