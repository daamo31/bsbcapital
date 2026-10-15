import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Label } from '@/components/ui/forms/label';
import { Switch } from '@/components/ui/forms/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/feedback/use-toast';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';

const AcademiaAdmin = () => {
  const { toast } = useToast();
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video',
    content_url: '',
    duration: '',
    level: 'Básico',
    is_downloadable: false,
    is_featured: false,
    content_id: '',
    module_id: '',
    is_free: false,
    required_access_level: 'basic',
  });

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('course_content')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el contenido.',
      });
    } else {
      setContentList(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchContent();

    // Suscripción en tiempo real a cambios en la tabla course_content
    const channel = supabase
      .channel('course_content_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'course_content' },
        (payload) => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContent]);

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      description: '',
      content_type: 'video',
      content_url: '',
      duration: '',
      level: 'Básico',
      is_downloadable: false,
      is_featured: false,
      content_id: '',
      module_id: '',
      is_free: false,
      required_access_level: 'basic',
    });
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || '',
      content_type: content.content_type,
      content_url: content.content_url || '',
      duration: content.duration || '',
      level: content.level || 'Básico',
      is_downloadable: content.is_downloadable || false,
      is_featured: content.is_featured || false,
      content_id: content.content_id || '',
      module_id: content.module_id || '',
      is_free: content.is_free || false,
      required_access_level: content.required_access_level || 'basic',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;
    const { error } = await supabase.from('course_content').delete().eq('id', id);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el contenido.',
      });
    } else {
      toast({ title: 'Éxito', description: 'Contenido eliminado.' });
      fetchContent();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };

    let error;
    if (editingContent) {
      ({ error } = await supabase
        .from('course_content')
        .update(dataToSubmit)
        .eq('id', editingContent.id));
    } else {
      ({ error } = await supabase.from('course_content').insert(dataToSubmit));
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({
        title: 'Éxito',
        description: `Contenido ${editingContent ? 'actualizado' : 'creado'}.`,
      });
      setIsFormOpen(false);
      resetForm();
      fetchContent();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const ContentForm = (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div>
        <Label htmlFor="content_id">Content ID (único) *</Label>
        <Input
          id="content_id"
          name="content_id"
          value={formData.content_id}
          onChange={handleInputChange}
          required
          placeholder="ej: modulo_1_video"
        />
      </div>
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>Tipo de Contenido</Label>
        <Select
          name="content_type"
          value={formData.content_type}
          onValueChange={(v) => setFormData((p) => ({ ...p, content_type: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="document">Documento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="content_url">URL del Contenido (fallback)</Label>
        <Input
          id="content_url"
          name="content_url"
          value={formData.content_url}
          onChange={handleInputChange}
          placeholder="URL de YouTube, Vimeo, o documento"
        />
      </div>
      <div>
        <Label htmlFor="module_id">Module ID</Label>
        <Input
          id="module_id"
          name="module_id"
          value={formData.module_id}
          onChange={handleInputChange}
          placeholder="ej: modulo_1"
        />
      </div>
      <div>
        <Label htmlFor="duration">Duración (ej. 1h 30m)</Label>
        <Input
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label>Nivel</Label>
        <Select
          name="level"
          value={formData.level}
          onValueChange={(v) => setFormData((p) => ({ ...p, level: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Básico">Básico</SelectItem>
            <SelectItem value="Intermedio">Intermedio</SelectItem>
            <SelectItem value="Avanzado">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Nivel de Acceso Requerido</Label>
        <Select
          name="required_access_level"
          value={formData.required_access_level}
          onValueChange={(v) => setFormData((p) => ({ ...p, required_access_level: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_free"
          checked={formData.is_free}
          onCheckedChange={(c) => setFormData((p) => ({ ...p, is_free: c }))}
        />
        <Label htmlFor="is_free">Contenido Gratuito</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_downloadable"
          checked={formData.is_downloadable}
          onCheckedChange={(c) => setFormData((p) => ({ ...p, is_downloadable: c }))}
        />
        <Label htmlFor="is_downloadable">Permitir descarga</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(c) => setFormData((p) => ({ ...p, is_featured: c }))}
        />
        <Label htmlFor="is_featured">Destacado</Label>
      </div>
      <Button type="submit">{editingContent ? 'Actualizar' : 'Crear'} Contenido</Button>
    </form>
  );

  return (
    <>
      <Helmet>
        <title>Admin Academia - BSB Capital</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Academia</h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Contenido
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingContent ? 'Editar' : 'Nuevo'} Contenido</DialogTitle>
              </DialogHeader>
              {ContentForm}
            </DialogContent>
          </Dialog>
        </div>
        {loading ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Descarga</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contentList.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{content.content_type}</TableCell>
                  <TableCell>{content.level}</TableCell>
                  <TableCell>{content.is_downloadable ? 'Sí' : 'No'}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(content)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(content.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

export default AcademiaAdmin;
