import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ArrowLeft, Video, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AcademiaRoute = () => {
  const { slug } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('academy_routes')
        .select('*, academy_route_content(order, academy_content(*))')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching route:', error);
        setError('Ruta no encontrada o error al cargar.');
      } else {
        // Sort content by order
        data.academy_route_content.sort((a, b) => a.order - b.order);
        setRoute(data);
      }
      setLoading(false);
    };

    fetchRoute();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center py-20">{error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{route.title} - Academia BSB Capital</title>
        <meta name="description" content={route.description} />
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
          <h1 className="text-4xl font-bold mb-4">{route.title}</h1>
          <p className="text-lg text-muted-foreground mb-12">{route.description}</p>

          <div className="space-y-6">
            {route.academy_route_content.map(({ academy_content: content, order }) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: order * 0.1 }}
              >
                <Link to={`/academia/contenido/${content.slug}`}>
                  <Card className="hover:border-primary transition-colors duration-300">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className="text-3xl font-bold text-muted-foreground">{String(order).padStart(2, '0')}</div>
                      <div className="flex-shrink-0">
                        {content.content_type === 'video' ? <Video className="h-8 w-8 text-primary" /> : <FileText className="h-8 w-8 text-primary" />}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{content.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AcademiaRoute;