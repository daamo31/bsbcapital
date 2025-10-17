import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import HotmartContentCard from '@/components/hotmart/HotmartContentCard';
import { BookOpen, Video, Award } from 'lucide-react';

const HotmartAcademyPage = () => {
  // Datos de ejemplo - estos vendrían de tu CMS o base de datos
  const courses = [
    {
      contentId: 'module_1',
      title: 'Fundamentos de Gestión del Riesgo',
      description: 'Aprende las bases fundamentales para proteger tu capital de inversión y minimizar riesgos.',
      thumbnail: null, // URL de thumbnail si tienes
      duration: '2h 30min',
      difficulty: 'Básico',
      studentCount: '1,245',
      rating: '4.8'
    },
    {
      contentId: 'module_2',
      title: 'Fiscalidad y Cumplimiento Crypto',
      description: 'Domina las obligaciones fiscales y el cumplimiento legal en el mundo de las criptomonedas.',
      thumbnail: null,
      duration: '1h 45min',
      difficulty: 'Intermedio',
      studentCount: '892',
      rating: '4.9'
    },
    {
      contentId: 'module_3',
      title: 'Operativa con Derivados',
      description: 'Visión institucional sobre futuros, opciones y otros instrumentos derivados.',
      thumbnail: null,
      duration: '3h 15min',
      difficulty: 'Avanzado',
      studentCount: '567',
      rating: '4.7'
    },
    {
      contentId: 'video_1',
      title: 'Introducción al Risk Management',
      description: 'Video introductorio sobre los conceptos básicos de gestión de riesgo.',
      thumbnail: null,
      duration: '25min',
      difficulty: 'Básico',
      studentCount: '2,150',
      rating: '4.6'
    },
    {
      contentId: 'academia',
      title: 'Academia BSB Capital Completa',
      description: 'Acceso completo a todos los cursos, videos y materiales de la academia.',
      thumbnail: null,
      duration: '20+ horas',
      difficulty: 'Todos los niveles',
      studentCount: '3,480',
      rating: '4.9'
    }
  ];

  const features = [
    {
      icon: <Video className="h-6 w-6 text-blue-500" />,
      title: 'Videos HD',
      description: 'Contenido en alta calidad directamente desde Hotmart'
    },
    {
      icon: <BookOpen className="h-6 w-6 text-green-500" />,
      title: 'Materiales Descargables',
      description: 'PDFs, plantillas y recursos adicionales'
    },
    {
      icon: <Award className="h-6 w-6 text-purple-500" />,
      title: 'Certificados',
      description: 'Certificados oficiales al completar los cursos'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Academia BSB Capital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contenido premium de formación financiera alojado en Hotmart. 
            Accede a cursos, videos y materiales exclusivos según tu suscripción.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cursos disponibles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Cursos Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <HotmartContentCard
                key={course.contentId}
                contentId={course.contentId}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                duration={course.duration}
                difficulty={course.difficulty}
                studentCount={course.studentCount}
                rating={course.rating}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">
              ¿Cómo funciona la integración con Hotmart?
            </CardTitle>
            <CardDescription className="text-blue-700">
              Información técnica sobre el acceso al contenido
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• <strong>Verificación automática:</strong> El sistema verifica tu acceso en tiempo real con la API de Hotmart</li>
              <li>• <strong>Acceso directo:</strong> Los enlaces te llevan directamente al contenido en la plataforma de Hotmart</li>
              <li>• <strong>Sincronización:</strong> Tu progreso se sincroniza entre ambas plataformas</li>
              <li>• <strong>Fallback local:</strong> Si Hotmart no está disponible, usamos tu suscripción local como respaldo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotmartAcademyPage;