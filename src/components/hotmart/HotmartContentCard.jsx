import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useUserAccess } from '@/hooks/useUserAccess';
import { 
  ExternalLink, 
  Play, 
  Lock, 
  CheckCircle, 
  Clock,
  Users,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const HotmartContentCard = ({ 
  contentId, 
  title, 
  description, 
  thumbnail,
  duration,
  difficulty = 'Intermedio',
  studentCount,
  rating,
  index = 0 
}) => {
  const { hasAccess, isLoading, contentURL, hotmartData, error } = useUserAccess(contentId);
  const [isHovered, setIsHovered] = useState(false);

  const handleAccessContent = () => {
    if (hasAccess && contentURL) {
      window.open(contentURL, '_blank', 'noopener,noreferrer');
    } else {
      // Redirigir a compra/suscripción
      window.open('https://pay.hotmart.com/tu-producto-id', '_blank');
    }
  };

  const getDifficultyColor = (level) => {
    switch(level.toLowerCase()) {
      case 'básico': return 'bg-green-100 text-green-800';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800';
      case 'avanzado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`overflow-hidden transition-all duration-300 ${
        hasAccess 
          ? 'hover:shadow-xl hover:scale-105 cursor-pointer border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        {/* Thumbnail/Preview */}
        <div className="relative">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className={`w-full h-48 object-cover transition-all duration-300 ${
                hasAccess ? '' : 'grayscale opacity-60'
              }`}
            />
          ) : (
            <div className={`w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center ${
              hasAccess ? '' : 'grayscale opacity-60'
            }`}>
              <Play className="h-16 w-16 text-white" />
            </div>
          )}
          
          {/* Overlay de estado */}
          <div className="absolute top-4 right-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-white rounded-full animate-pulse" />
            ) : hasAccess ? (
              <div className="bg-green-500 text-white p-2 rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
            ) : (
              <div className="bg-red-500 text-white p-2 rounded-full">
                <Lock className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Badge de dificultad */}
          <div className="absolute top-4 left-4">
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
          </div>

          {/* Play button overlay */}
          {hasAccess && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <Button size="lg" className="rounded-full">
                <ExternalLink className="h-5 w-5 mr-2" />
                Ver en Hotmart
              </Button>
            </motion.div>
          )}
        </div>

        <CardHeader>
          <CardTitle className={`text-lg ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
            {title}
          </CardTitle>
          <CardDescription className={hasAccess ? 'text-gray-600' : 'text-gray-400'}>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Estadísticas del curso */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            {duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
            {studentCount && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{studentCount} estudiantes</span>
              </div>
            )}
            {rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Estado de acceso */}
          {!hasAccess && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Contenido Premium
                  </p>
                  <p className="text-xs text-yellow-700">
                    {error 
                      ? 'Error verificando acceso'
                      : 'Requiere compra en Hotmart'
                    }
                  </p>
                  {hotmartData?.status && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estado: {hotmartData.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          <Button 
            onClick={handleAccessContent}
            className="w-full"
            variant={hasAccess ? "default" : "outline"}
            disabled={isLoading}
          >
            {isLoading ? (
              'Verificando acceso...'
            ) : hasAccess ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Contenido
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Comprar Curso
              </>
            )}
          </Button>

          {/* URL de contenido para debug (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && contentURL && (
            <p className="text-xs text-gray-400 mt-2 truncate">
              URL: {contentURL}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HotmartContentCard;