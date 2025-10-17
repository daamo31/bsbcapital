import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { useUserAccess } from '@/hooks/useUserAccess';
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
  Headphones
} from 'lucide-react';

const HotmartVideoPlayer = ({ contentId, title, description }) => {
  const { hasAccess, isLoading, contentData, videoStreamURL, error } = useUserAccess(contentId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (contentData?.videos && contentData.videos.length > 0) {
      setSelectedVideo(0);
    }
  }, [contentData]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Cargando contenido...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <Play className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <p className="text-red-600 mb-4">
            {error ? 'Error verificando acceso' : 'Requiere suscripción activa'}
          </p>
          <Button onClick={() => window.location.href = '/membresias'}>
            Ver Planes de Suscripción
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reproductor de Video Principal */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {videoStreamURL ? (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoStreamURL}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Controles personalizados */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Barra de progreso */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full mb-4 cursor-pointer"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                
                {/* Controles */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    
                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Placeholder si no hay video disponible
            <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Contenido no disponible</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Videos del Módulo */}
      {contentData?.videos && contentData.videos.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Videos del Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contentData.videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedVideo 
                      ? 'bg-blue-100 border-blue-300 border' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedVideo(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-gray-600">{video.duration}</p>
                    </div>
                    {index === selectedVideo && (
                      <Badge variant="default">Reproduciendo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos Adicionales */}
      {(contentData?.documents || contentData?.audios) && (
        <Card>
          <CardHeader>
            <CardTitle>Recursos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Documentos */}
              {contentData.documents?.map((doc, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-600">{doc.type}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Audios */}
              {contentData.audios?.map((audio, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Headphones className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">{audio.title}</p>
                    <p className="text-sm text-gray-600">{audio.duration}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotmartVideoPlayer;