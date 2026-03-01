import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowLeft, Calendar, User, Share2, BookOpen } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setPost(data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="h-10 bg-muted rounded w-3/4" />
          <div className="h-64 bg-muted rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-4 bg-muted rounded"
                style={{ width: `${85 + Math.random() * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20 max-w-2xl text-center">
        <BookOpen className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brand-text-primary">Artículo no encontrado</h1>
        <p className="text-muted-foreground mt-3">
          El artículo que buscas no existe o ha sido eliminado.
        </p>
        <Button asChild className="mt-8">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Blog
          </Link>
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Helmet>
        <title>{post.title} | BSB Capital Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
        <link rel="canonical" href={`https://bsbcapital.io/blog/${post.slug}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://bsbcapital.io/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://bsbcapital.io/blog/${post.slug}`} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={post.excerpt || post.title} />
        {post.cover_image_url && <meta property="twitter:image" content={post.cover_image_url} />}

        {/* Structured Data (JSON-LD) for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            image: post.cover_image_url,
            author: {
              '@type': 'Person',
              name: post.author_name || 'BSB Capital Team',
            },
            publisher: {
              '@type': 'Organization',
              name: 'BSB Capital',
              logo: {
                '@type': 'ImageObject',
                url: 'https://bsbcapital.io/images/black_logo-Photoroom.png',
              },
            },
            datePublished: post.created_at,
            description: post.excerpt || post.title,
          })}
        </script>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <article className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
          {/* Back */}
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-accent transition-colors mb-8"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver al Blog
          </Link>

          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <Badge className="bg-primary text-primary-foreground">{post.category}</Badge>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author_name}
              </span>
            )}
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 text-brand-accent hover:text-brand-accent/80 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Video */}
          {post.video_url && (
            <div className="mt-8 rounded-xl overflow-hidden shadow-lg aspect-video flex items-center justify-center bg-black">
              {post.video_url.includes('youtube') || post.video_url.includes('vimeo') ? (
                <iframe
                  src={post.video_url}
                  title={post.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={post.video_url} className="w-full h-full" controls>
                  Tu navegador no soporta el elemento de vídeo.
                </video>
              )}
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div
              className="mt-8 prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-p:text-brand-text-secondary prose-p:leading-relaxed
                prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-brand-text-primary
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground mb-4">
              ¿Quieres saber más? Explora todos nuestros artículos.
            </p>
            <Button asChild variant="outline">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver todos los artículos
              </Link>
            </Button>
          </div>
        </article>
      </motion.div>
    </>
  );
};

export default BlogPost;
