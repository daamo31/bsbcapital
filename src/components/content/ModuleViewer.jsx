import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useContentAccess } from '@/hooks/useContentAccess';
import ContentPlayer from '@/components/content/ContentPlayer';
import { 
  Play, 
  FileText, 
  Headphones, 
  Download,
  Clock,
  CheckCircle,
  Lock,
  BookOpen
} from 'lucide-react';

const ModuleViewer = ({ moduleId, className = '' }) => {
  const { 
    hasAccess, 
    isLoading, 
    moduleContent,
    accessReason,
    error 
  } = useContentAccess(null, moduleId);

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Play className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'audio': return <Headphones className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAccessBadge = (item) => {
    if (item.hasAccess) {
      return <Badge variant="success" className="text-xs">Disponible</Badge>;
    }
    
    switch (item.accessReason) {
      case 'free_content':
        return <Badge variant="success" className="text-xs">Gratuito</Badge>;
      case 'no_subscription':
        return <Badge variant="destructive" className="text-xs">Suscripción requerida</Badge>;
      case 'insufficient_subscription_level':
        return <Badge variant="warning" className="text-xs">Nivel superior requerido</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Bloqueado</Badge>;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Cargando módulo...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">⚠️ Error</div>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!moduleContent) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p>Módulo no encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const { module, content } = moduleContent;
  const accessibleContent = content.filter(item => item.hasAccess);
  const totalDuration = content.reduce((acc, item) => acc + (item.duration_seconds || 0), 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header del Módulo */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <BookOpen className="h-6 w-6 mr-2" />
                {module.title}
              </CardTitle>
              {module.description && (
                <CardDescription className="text-base mt-2">
                  {module.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant="outline" className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(totalDuration)}
              </Badge>
              {module.difficulty_level && (
                <Badge variant="secondary">
                  {module.difficulty_level}
                </Badge>
              )}
              {module.category && (
                <Badge variant="outline">
                  {module.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Play className="h-4 w-4 mr-2 text-blue-500" />
              <span>{content.length} elementos</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              <span>{accessibleContent.length} disponibles</span>
            </div>
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{content.length - accessibleContent.length} bloqueados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contenido */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido del Módulo</CardTitle>
          <CardDescription>
            Lista completa de videos, documentos y recursos del módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-all ${
                  item.hasAccess 
                    ? 'border-green-200 bg-green-50/50 hover:bg-green-50' 
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-1">
                        {getContentIcon(item.content_type)}
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}.
                        </span>
                      </div>
                      <h4 className="font-semibold">{item.title}</h4>
                      {item.duration_seconds && (
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(item.duration_seconds)}
                        </Badge>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAccessBadge(item)}
                        <Badge variant="outline" className="text-xs">
                          {item.content_type}
                        </Badge>
                      </div>
                      
                      {item.hasAccess && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            // Scroll a un reproductor específico o abrir en modal
                            const element = document.getElementById(`content-${item.content_id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Ver contenido
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reproductores de Contenido Accesible */}
      {accessibleContent.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Contenido Disponible</h3>
          
          {accessibleContent.map((item) => (
            <div 
              key={item.content_id} 
              id={`content-${item.content_id}`}
              className="scroll-mt-6"
            >
              <ContentPlayer 
                contentId={item.content_id}
                className="border-l-4 border-l-blue-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Mensaje si no tiene acceso a nada */}
      {accessibleContent.length === 0 && hasAccess === false && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold text-yellow-800 mb-2">
              Módulo Bloqueado
            </h3>
            <p className="text-yellow-700 mb-4">
              Necesitas una suscripción para acceder al contenido de este módulo.
            </p>
            <Button onClick={() => window.location.href = '/membresias'}>
              Ver Planes de Suscripción
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModuleViewer;