import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import HotmartIframePlayer from '@/components/hotmart/HotmartIframePlayer';
import { Clock, Play, Users, Star } from 'lucide-react';

/**
 * Página de prueba para ver el contenido de Hotmart embebido
 * Esta página simula la experiencia real del usuario que ha comprado
 */
const AcademiaTestPage = () => {
  // Simular contenido de BSB Capital
  const cursos = [
    {
      id: 'modulo_0_bienvenida',
      title: 'Módulo 0: Bienvenida y Mentalidad Inversora',
      description: 'Introducción a la mentalidad inversora con píldora formativa sobre inflación',
      duration: '45min',
      level: 'Básico',
      students: '1,234',
      rating: '4.8'
    },
    {
      id: 'modulo_1_riesgo',
      title: 'Módulo 1: Fundamentos de Gestión del Riesgo',
      description: 'Aprende las bases fundamentales para proteger tu capital de inversión',
      duration: '1h 30min',
      level: 'Intermedio',
      students: '987',
      rating: '4.9'
    },
    {
      id: 'modulo_2_fiscalidad',
      title: 'Módulo 2: Fiscalidad y Cumplimiento Crypto',
      description: 'Domina las obligaciones fiscales en el mundo de las criptomonedas',
      duration: '2h 15min',
      level: 'Avanzado',
      students: '654',
      rating: '4.7'
    }
  ];

  const [selectedCurso, setSelectedCurso] = React.useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Academia BSB Capital
          </h1>
          <p className="text-xl text-gray-600">
            Experiencia real del usuario que ha comprado la academia
          </p>
          <Badge className="mt-4 bg-green-100 text-green-800">
            ✓ Acceso Premium Activo
          </Badge>
        </div>

        {/* Reproductor seleccionado */}
        {selectedCurso && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedCurso.title}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {selectedCurso.description}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCurso(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <HotmartIframePlayer
                  contentId={selectedCurso.id}
                  title={selectedCurso.title}
                  description={selectedCurso.description}
                  customHeight="500px"
                  allowFullscreen={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de cursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <Card 
              key={curso.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCurso(curso)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline">{curso.level}</Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm">{curso.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{curso.title}</CardTitle>
                <CardDescription>{curso.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{curso.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{curso.students}</span>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Ver Contenido
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información de testing */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🧪 Página de Testing</CardTitle>
            <CardDescription className="text-blue-700">
              Esta página muestra cómo se ve la academia para un usuario que ha comprado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-2 text-sm">
              <p>• <strong>ID Real de Hotmart:</strong> 6308462</p>
              <p>• <strong>Integración:</strong> iframe embebido (sin redirecciones)</p>
              <p>• <strong>Experiencia:</strong> Usuario nunca sale de BSB Capital</p>
              <p>• <strong>Estado:</strong> Acceso premium simulado para testing</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AcademiaTestPage;