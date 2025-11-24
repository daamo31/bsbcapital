import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useContentAccess } from '@/hooks/useContentAccess';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Download,
  BookOpen,
  FileText,
  Headphones,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';

const ContentPlayer = ({ contentId, showModuleContent = false, className = '' }) => {
  const { user } = useAuth();
  const { 
    hasAccess, 
    isLoading, 
    content, 
    videoStreamURL, 
    downloadURL,
    userProgress,
    accessReason,
    updateWatchTime,
    markAsCompleted,
    error 
  } = useContentAccess(contentId);

  // Estados para el reproductor de video
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef(null);

  // Cargar posición guardada al montar
  useEffect(() => {
    if (videoRef.current && userProgress?.last_position_seconds) {
      videoRef.current.currentTime = userProgress.last_position_seconds;
    }
  }, [userProgress, videoStreamURL]);

  // Actualizar tiempo cada 5 segundos
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime > 0) {
      interval = setInterval(() => {
        updateWatchTime(Math.floor(currentTime), Math.floor(currentTime));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, updateWatchTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // Auto-guardar progreso cada 30 segundos
      if (Math.floor(current) % 30 === 0 && current > 0) {
        updateWatchTime(Math.floor(current), Math.floor(current));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    markAsCompleted();
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const getAccessStatusBadge = () => {
    if (isLoading) return <Badge variant="outline">Verificando...</Badge>;
    if (!user) return <Badge variant="destructive">Inicia sesión</Badge>;
    if (hasAccess) return <Badge variant="success">Acceso permitido</Badge>;
    
    switch (accessReason) {
      case 'free_content':
        return <Badge variant="success">Contenido gratuito</Badge>;
      case 'no_subscription':
        return <Badge variant="destructive">Sin suscripción</Badge>;
      case 'insufficient_subscription_level':
        return <Badge variant="warning">Suscripción insuficiente</Badge>;
      default:
        return <Badge variant="destructive">Sin acceso</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Verificando acceso al contenido...</p>
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

  if (!hasAccess) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-red-500" />
                {content?.title || 'Contenido Restringido'}
              </CardTitle>
              {content?.description && (
                <CardDescription>{content.description}</CardDescription>
              )}
            </div>
            {getAccessStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lock className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-gray-600 mb-4">
              {accessReason === 'no_subscription' && 'Necesitas una suscripción activa para ver este contenido.'}
              {accessReason === 'insufficient_subscription_level' && 'Tu suscripción actual no incluye este contenido.'}
              {accessReason === 'content_not_found' && 'El contenido solicitado no fue encontrado.'}
              {!accessReason && 'No tienes permisos para acceder a este contenido.'}
            </p>
            <Button onClick={() => window.location.href = '/membresias'}>
              Ver Planes de Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p>Contenido no encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reproductor Principal */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                {content.content_type === 'video' && <Play className="h-5 w-5 mr-2" />}
                {content.content_type === 'pdf' && <FileText className="h-5 w-5 mr-2" />}
                {content.content_type === 'audio' && <Headphones className="h-5 w-5 mr-2" />}
                {content.title}
              </CardTitle>
              {content.description && (
                <CardDescription>{content.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {getAccessStatusBadge()}
              {content.duration_seconds && (
                <Badge variant="outline" className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(content.duration_seconds)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Video Player */}
          {content.content_type === 'video' && videoStreamURL && (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoStreamURL}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Controles personalizados */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4 text-white">
                  <Button
                    onClick={togglePlay}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1 flex items-center space-x-2 text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 bg-white/30 rounded-full h-1">
                      <div 
                        className="bg-white rounded-full h-1 transition-all duration-300"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <Button
                    onClick={toggleMute}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PDF/Document Viewer */}
          {['pdf', 'document'].includes(content.content_type) && downloadURL && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
              <p className="text-gray-600 mb-4">{content.description}</p>
              <Button asChild>
                <a href={downloadURL} download target="_blank">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar {content.content_type.toUpperCase()}
                </a>
              </Button>
            </div>
          )}

          {/* Progreso del usuario */}
          {userProgress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso</span>
                <span className="text-sm text-gray-600">
                  {Math.round(userProgress.progress_percentage || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userProgress.progress_percentage || 0}%` }}
                />
              </div>
              {userProgress.completed && (
                <div className="flex items-center mt-2 text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Completado</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPlayer;