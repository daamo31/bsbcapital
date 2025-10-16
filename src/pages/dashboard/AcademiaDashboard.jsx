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
  FileText,
  Lock
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useUserAccess } from '@/hooks/useUserAccess';
import ModuleCard from '@/components/ModuleCard';

const AcademiaDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const { hasAccess, isLoading, userSubscription } = useUserAccess('academia');

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
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Academia</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Bienvenido de vuelta, {user.email.split('@')[0]}</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 self-start sm:self-auto text-xs sm:text-sm">
              Acceso Completo
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{Math.round(progress)}%</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Progreso Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">{completedModules.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Módulos Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-orange-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">9h 30m</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Contenido Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">4</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Certificados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Módulos del Curso */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Módulos del Curso</CardTitle>
                <CardDescription className="text-sm">
                  Continúa tu formación donde lo dejaste
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {modules.map((module, index) => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    index={index} 
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recursos Descargables */}
          <div>
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Recursos Descargables</CardTitle>
                <CardDescription className="text-sm">
                  Plantillas y materiales de apoyo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="flex-shrink-0 p-2">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Soporte */}
            <Card className="mt-4 sm:mt-6">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Nuestro equipo está aquí para ayudarte en tu proceso de aprendizaje.
                </p>
                <Button variant="outline" className="w-full text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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