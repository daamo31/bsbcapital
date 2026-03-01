import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/feedback/use-toast';
import TiptapEditor from '@/components/admin/TiptapEditor';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Globe,
  FileText,
  Upload,
  Loader2,
  Image as ImageIcon,
  Video,
} from 'lucide-react';

const CATEGORIES = ['Análisis', 'Formación', 'Mercado', 'Estrategia', 'Noticias'];

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  video_url: '',
  category: '',
  status: 'draft',
  author_name: '',
};

const BlogManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const fileInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  const uploadCoverImage = async (file) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filename);
      setForm((f) => ({ ...f, cover_image_url: urlData.publicUrl }));
      toast({ title: 'Imagen subida', description: 'La portada se ha cargado correctamente.' });
    } catch (err) {
      toast({ title: 'Error al subir', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const uploadVideoFile = async (file) => {
    setUploadingVideo(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filename);
      setForm((f) => ({ ...f, video_url: urlData.publicUrl }));
      toast({
        title: 'Vídeo subido',
        description: 'El archivo de vídeo se ha cargado correctamente.',
      });
    } catch (err) {
      toast({ title: 'Error al subir vídeo', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'El archivo debe ser una imagen.',
          variant: 'destructive',
        });
        return;
      }
      uploadCoverImage(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Error',
          description: 'El archivo debe ser un vídeo.',
          variant: 'destructive',
        });
        return;
      }
      uploadVideoFile(file);
    }
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(
          'id, title, slug, excerpt, category, status, created_at, author_name, cover_image_url'
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNew = () => {
    setEditingPost(null);
    setForm({ ...EMPTY_FORM, author_name: user?.email || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = async (post) => {
    setEditingPost(post.id);
    // Fetch full content for editing
    const { data } = await supabase.from('blog_posts').select('*').eq('id', post.id).single();
    setForm({
      title: data?.title || '',
      slug: data?.slug || '',
      excerpt: data?.excerpt || '',
      content: data?.content || '',
      cover_image_url: data?.cover_image_url || '',
      video_url: data?.video_url || '',
      category: data?.category || '',
      status: data?.status || 'draft',
      author_name: data?.author_name || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setForm(EMPTY_FORM);
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      slug: editingPost ? f.slug : slugify(title),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Título requerido',
        description: 'El artículo debe tener un título.',
        variant: 'destructive',
      });
      return;
    }
    if (!form.slug.trim()) {
      toast({
        title: 'Slug requerido',
        description: 'El slug no puede estar vacío.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Automatic SEO: Generate excerpt from content if missing
      let finalExcerpt = form.excerpt;
      if (!finalExcerpt && form.content) {
        // Strip HTML tags and take first 160 characters
        const plainText = form.content.replace(/<[^>]*>/g, '').trim();
        finalExcerpt = plainText.substring(0, 157) + (plainText.length > 157 ? '...' : '');
      }

      const payload = {
        ...form,
        excerpt: finalExcerpt,
        updated_at: new Date().toISOString(),
        ...(editingPost ? {} : { author_id: user?.id }),
      };

      let error;
      if (editingPost) {
        ({ error } = await supabase.from('blog_posts').update(payload).eq('id', editingPost));
      } else {
        ({ error } = await supabase.from('blog_posts').insert([payload]));
      }

      if (error) throw error;

      toast({
        title: editingPost ? '✅ Artículo actualizado' : '✅ Artículo creado',
        description:
          form.status === 'published' ? 'El artículo ya es público.' : 'Guardado como borrador.',
      });
      closeForm();
      fetchPosts();
    } catch (err) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', post.id);
      if (error) throw error;
      toast({
        title: newStatus === 'published' ? '🌐 Publicado' : '📄 Despublicado',
        description: `"${post.title}" está ahora ${newStatus === 'published' ? 'visible para todos' : 'como borrador'}.`,
      });
      fetchPosts();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`¿Eliminar el artículo "${post.title}"? Esta acción no se puede deshacer.`))
      return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
      if (error) throw error;
      toast({ title: '🗑️ Artículo eliminado' });
      fetchPosts();
    } catch (err) {
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.author_name?.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-foreground">{posts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total artículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Borradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {editingPost ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingPost ? 'Editar artículo' : 'Nuevo artículo'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Título *</label>
                <Input
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="Título del artículo"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  URL del artículo
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (se genera automáticamente)
                  </span>
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="url-del-articulo"
                  className="font-mono text-sm text-muted-foreground"
                />
              </div>
            </div>

            {/* Category, Status, Author */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="draft">🗒️ Borrador (solo tú lo ves)</option>
                  <option value="published">🌐 Publicado (visible para todos)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Autor</label>
                <Input
                  value={form.author_name}
                  onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  placeholder="Nombre del autor"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Resumen corto
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (aparece en el listado del blog)
                </span>
              </label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Escribe un breve resumen de 1-2 frases..."
                rows={2}
              />
            </div>

            {/* WYSIWYG Markdown Editor */}
            <div className="space-y-1.5" data-color-mode="light">
              <label className="text-sm font-medium text-foreground">
                Contenido del artículo
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  — usa la barra de herramientas para dar formato (negrita, listas, imágenes...)
                </span>
              </label>
              <div className="rounded-md border border-input overflow-hidden">
                <TiptapEditor
                  value={form.content}
                  onChange={(val) => setForm((f) => ({ ...f, content: val || '' }))}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Arrastra imágenes al editor, pégalas con Ctrl+V, o usa el botón 🖼️ de la barra.
              </p>
            </div>

            {/* Images & Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Imagen de portada *</label>

                <div
                  className={`relative group border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-4 min-h-[160px] text-center
                                        ${
                                          form.cover_image_url
                                            ? 'border-primary/50 bg-primary/5'
                                            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                        }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) uploadCoverImage(file);
                  }}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Subiendo imagen...
                      </p>
                    </div>
                  ) : form.cover_image_url ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border group">
                      <img
                        src={form.cover_image_url}
                        alt="Portada"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Cambiar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 gap-2"
                          onClick={() => setForm((f) => ({ ...f, cover_image_url: '' }))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center gap-3 cursor-pointer py-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Haz clic o arrastra para subir</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WEBP hasta 5MB
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Vídeo
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (YouTube/Vimeo embed URL o sube un archivo)
                  </span>
                </label>
                <div className="space-y-4">
                  <Input
                    value={form.video_url}
                    onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/embed/..."
                    className="h-10"
                  />

                  <div
                    className={`relative group border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-4 min-h-[160px] text-center
                                            ${
                                              form.video_url &&
                                              !form.video_url.includes('youtube') &&
                                              !form.video_url.includes('vimeo')
                                                ? 'border-primary/50 bg-primary/5'
                                                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('video/')) uploadVideoFile(file);
                    }}
                  >
                    {uploadingVideo ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Subiendo vídeo...
                        </p>
                      </div>
                    ) : form.video_url &&
                      !form.video_url.includes('youtube') &&
                      !form.video_url.includes('vimeo') ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border group bg-muted">
                        <video
                          src={form.video_url}
                          className="w-full h-full object-contain"
                          controls
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => videoInputRef.current?.click()}
                            title="Cambiar vídeo"
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => setForm((f) => ({ ...f, video_url: '' }))}
                            title="Quitar vídeo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex flex-col items-center gap-3 cursor-pointer py-4"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                          <Video className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            Haz clic o arrastra para subir vídeo
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            MP4, WebM, OGG hasta 50MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={videoInputRef}
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                    />
                  </div>

                  {form.video_url &&
                    (form.video_url.includes('youtube') || form.video_url.includes('vimeo')) && (
                      <div className="rounded-lg overflow-hidden aspect-video border border-border bg-muted">
                        <iframe src={form.video_url} className="w-full h-full" allowFullScreen />
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : editingPost ? 'Guardar cambios' : 'Crear artículo'}
              </Button>
              <Button variant="outline" onClick={closeForm} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Artículos del Blog
              </CardTitle>
              <CardDescription>Gestiona los artículos publicados y borradores</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={openNew} size="sm" className="gap-2 self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                Nuevo artículo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, categoría o autor..."
              className="pl-9"
            />
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>
                {search
                  ? 'No se encontraron artículos.'
                  : 'Aún no hay artículos. ¡Crea el primero!'}
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                        <Badge
                          className={`text-xs flex-shrink-0 ${post.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}
                          variant="outline"
                        >
                          {post.status === 'published' ? (
                            <>
                              <Globe className="h-2.5 w-2.5 mr-1" />
                              Publicado
                            </>
                          ) : (
                            <>
                              <FileText className="h-2.5 w-2.5 mr-1" />
                              Borrador
                            </>
                          )}
                        </Badge>
                        {post.category && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {post.category}
                          </Badge>
                        )}
                      </div>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        /blog/{post.slug} · {new Date(post.created_at).toLocaleDateString('es-ES')}
                        {post.author_name && ` · ${post.author_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        {expandedPost === post.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={post.status === 'published' ? 'Despublicar' : 'Publicar'}
                      >
                        {post.status === 'published' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(post)}
                        className="p-1.5 rounded text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {expandedPost === post.id && post.cover_image_url && (
                    <div className="mt-3 rounded-lg overflow-hidden h-32">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;
