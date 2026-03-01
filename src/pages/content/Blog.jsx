import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { supabase } from '@/lib/customSupabaseClient';
import { useAdmin } from '@/hooks/useAdmin';
import { ArrowRight, BookOpen, Plus, Calendar, User } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 15 } },
};

const CATEGORIES = ['Todos', 'Análisis', 'Formación', 'Mercado', 'Estrategia', 'Noticias'];

const BlogCard = ({ post }) => {
  const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.article
      variants={itemVariants}
      className="bg-card rounded-xl shadow-lg border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col group overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-brand-green-600/10">
            <BookOpen className="h-16 w-16 text-primary/30" />
          </div>
        )}
        {post.category && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground text-xs font-medium">
              {post.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl font-bold text-brand-text-primary leading-tight line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-3 text-brand-text-secondary text-sm leading-relaxed line-clamp-3 flex-grow">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          {post.author_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author_name}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center text-sm font-medium text-brand-accent hover:text-brand-accent/80 transition-colors group/link"
        >
          Leer artículo
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
};

const Blog = () => {
  const { isAdmin } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, cover_image_url, category, created_at, author_name')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (activeCategory !== 'Todos') {
          query = query.eq('category', activeCategory);
        }

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('No se pudieron cargar los artículos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeCategory]);

  return (
    <>
      <Helmet>
        <title>Blog y Recursos - BSB Capital</title>
        <meta
          name="description"
          content="Análisis de mercado, guías de inversión y las últimas noticias del sector crypto. Blog especializado de BSB Capital."
        />
        <link rel="canonical" href="https://bsbcapital.io/blog" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <section className="bg-background py-12 sm:py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <motion.div variants={itemVariants} className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-8 w-8 text-brand-accent" />
                </div>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground"
              >
                Blog y Recursos
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Análisis de mercado, guías de inversión y las últimas noticias del ecosistema
                crypto.
              </motion.p>
              {isAdmin && (
                <motion.div variants={itemVariants} className="mt-6">
                  <Button asChild size="sm" className="gap-2">
                    <Link to="/admin">
                      <Plus className="h-4 w-4" />
                      Gestionar Blog
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="bg-brand-green-100 border-b border-border sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-brand-text-secondary hover:bg-primary/10 border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl border border-border overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-muted" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">{error}</p>
                <Button
                  onClick={() => setActiveCategory(activeCategory)}
                  className="mt-4"
                  variant="outline"
                >
                  Reintentar
                </Button>
              </div>
            )}

            {!loading && !error && posts.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-brand-text-primary">
                  {activeCategory === 'Todos'
                    ? 'Aún no hay artículos publicados'
                    : `No hay artículos en la categoría "${activeCategory}"`}
                </h2>
                <p className="text-muted-foreground mt-2">
                  Vuelve pronto, ¡estamos creando contenido!
                </p>
              </div>
            )}

            {!loading && !error && posts.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Blog;
