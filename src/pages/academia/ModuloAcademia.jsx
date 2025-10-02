import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  ChevronRight,
  Video
} from 'lucide-react';

const ModuloAcademia = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState(1);

  const modules = {
    1: {
      title: 'Fundamentos de gestión del riesgo',
      description: 'Domina las bases para proteger tu capital y operar con confianza',
      lessons: [
        { id: 1, title: 'Introducción a la gestión del riesgo', duration: '15 min', completed: true, type: 'video' },
        { id: 2, title: 'Tipos de riesgo en inversión', duration: '20 min', completed: true, type: 'video' },
        { id: 3, title: 'Calculando el riesgo de cartera', duration: '25 min', completed: false, type: 'video' },
        { id: 4, title: 'Herramientas de análisis', duration: '18 min', completed: false, type: 'video' },
        { id: 5, title: 'Position sizing', duration: '22 min', completed: false, type: 'video' },
        { id: 6, title: 'Stop loss y take profit', duration: '17 min', completed: false, type: 'video' },
        { id: 7, title: 'Diversificación efectiva', duration: '30 min', completed: false, type: 'video' },
        { id: 8, title: 'Caso práctico', duration: '35 min', completed: false, type: 'video' }
      ],
      resources: [
        { name: 'Checklist de Gestión de Riesgo', type: 'PDF' },
        { name: 'Calculadora de Position Size', type: 'Excel' },
        { name: 'Plantilla de Análisis', type: 'PDF' }
      ]
    },
    2: {
      title: 'Fiscalidad y cumplimiento (crypto)',
      description: 'Entiende tus obligaciones fiscales con criptoactivos en España',
      lessons: [
        { id: 1, title: 'Marco legal español crypto', duration: '20 min', completed: true, type: 'video' },
        { id: 2, title: 'Declaración de criptoactivos', duration: '25 min', completed: true, type: 'video' },
        { id: 3, title: 'Modelo 720 y cripto', duration: '18 min', completed: true, type: 'video' },
        { id: 4, title: 'Tributación de ganancias', duration: '22 min', completed: false, type: 'video' },
        { id: 5, title: 'DeFi y fiscalidad', duration: '28 min', completed: false, type: 'video' },
        { id: 6, title: 'Casos prácticos', duration: '30 min', completed: false, type: 'video' }
      ],
      resources: [
        { name: 'Guía Fiscal Crypto 2024', type: 'PDF' },
        { name: 'Plantilla Modelo 720', type: 'Excel' },
        { name: 'Formularios AEAT', type: 'PDF' }
      ]
    }
    // Más módulos...
  };

  const module = modules[moduleId];
  
  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Módulo no encontrado</h1>
          <Button onClick={() => navigate('/academia/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const completedLessons = module.lessons.filter(l => l.completed).length;
  const progress = (completedLessons / module.lessons.length) * 100;
  const currentLessonData = module.lessons.find(l => l.id === currentLesson);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/academia/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold">{module.title}</h1>
                <p className="text-sm text-gray-600">{completedLessons} de {module.lessons.length} lecciones completadas</p>
              </div>
            </div>
            <Badge variant="outline">
              {Math.round(progress)}% Completado
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lista de Lecciones */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecciones</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson.id)}
                      className={`w-full p-3 text-left transition-colors border-b last:border-b-0 ${
                        currentLesson === lesson.id
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                          )}
                          <Video className="h-4 w-4 text-gray-500" />
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="mt-2 ml-8">
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recursos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Recursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.type}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contenido de la Lección */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentLessonData?.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentLessonData?.duration}</span>
                    </CardDescription>
                  </div>
                  {!currentLessonData?.completed && (
                    <Button size="sm" variant="outline">
                      Marcar como completada
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Placeholder para el video */}
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-75" />
                    <p className="text-lg font-medium">Video: {currentLessonData?.title}</p>
                    <p className="text-sm opacity-75">Duración: {currentLessonData?.duration}</p>
                    <Button className="mt-4" size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      Reproducir
                    </Button>
                  </div>
                </div>

                {/* Descripción y notas */}
                <div className="prose max-w-none">
                  <h3>Descripción de la lección</h3>
                  <p>
                    En esta lección aprenderás los conceptos fundamentales sobre {currentLessonData?.title.toLowerCase()}. 
                    Cubriremos los aspectos más importantes que necesitas conocer para aplicar estos conocimientos 
                    en tu estrategia de inversión.
                  </p>
                  
                  <h4>Puntos clave:</h4>
                  <ul>
                    <li>Conceptos teóricos fundamentales</li>
                    <li>Aplicación práctica</li>
                    <li>Ejemplos reales del mercado</li>
                    <li>Herramientas recomendadas</li>
                  </ul>
                </div>

                {/* Navegación */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    disabled={currentLesson === 1}
                    onClick={() => setCurrentLesson(currentLesson - 1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    disabled={currentLesson === module.lessons.length}
                    onClick={() => setCurrentLesson(currentLesson + 1)}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuloAcademia;