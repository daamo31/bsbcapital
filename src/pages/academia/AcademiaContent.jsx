import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Download, Info, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AcademiaContent = () => {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_content')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching content:', error);
        setError('Contenido no encontrado o error al cargar.');
      } else {
        setContent(data);
      }
      setLoading(false);
    };

    fetchContent();
  }, [slug]);

  const renderContent = () => {
    if (content.content_type === 'video') {
      const videoUrl = new URL(content.content_url);
      let embedUrl = '';
      if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
        const videoId = videoUrl.searchParams.get('v') || videoUrl.pathname.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
      } else if (videoUrl.hostname.includes('vimeo.com')) {
        const videoId = videoUrl.pathname.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
      }
      
      return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title={content.title}
          ></iframe>
        </div>
      );
    }

    if (content.content_type === 'document') {
      const embedUrl = content.content_url.includes('?') 
        ? `${content.content_url}&embedded=true`
        : `${content.content_url}?embedded=true`;

      return (
        <div className="relative w-full h-[80vh] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
          ></iframe>
          {!content.is_downloadable && (
            <div className="absolute inset-0 bg-transparent" title="La descarga está deshabilitada para este documento."></div>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center py-20">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{content.title} - Academia BSB Capital</title>
        <meta name="description" content={content.description} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/academia"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al catálogo</Link>
          </Button>
          <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          <p className="text-lg text-muted-foreground mb-8">{content.description}</p>
          
          <div className="mb-8">
            {renderContent()}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {content.is_downloadable ? (
              <Button asChild>
                <a href={content.content_url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="mr-2 h-4 w-4" /> Descargar material
                </a>
              </Button>
            ) : (
              <Alert variant="default" className="w-full sm:w-auto">
                <Info className="h-4 w-4" />
                <AlertTitle>Descarga Deshabilitada</AlertTitle>
                <AlertDescription>
                  Este material es para uso personal dentro de la plataforma.
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="link" size="sm" className="p-1 h-auto ml-1 text-primary">
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">El bloqueo de descarga es de mejores esfuerzos. No garantizamos impedir capturas de pantalla o descargas avanzadas.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
            <p><strong>Disclaimer Financiero:</strong> La información tiene carácter informativo y educativo. No constituye garantía de resultados. Las decisiones de inversión corresponden exclusivamente al cliente. <Link to="/legal/condiciones-generales" className="underline hover:text-primary">Ver Condiciones y Disclaimer</Link>.</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AcademiaContent;