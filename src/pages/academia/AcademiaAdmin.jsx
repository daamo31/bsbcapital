import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
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
  });

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('academy_content').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el contenido.' });
    } else {
      setContentList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: '', description: '', content_type: 'video', content_url: '',
      duration: '', level: 'Básico', is_downloadable: false, is_featured: false,
    });
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || '',
      content_type: content.content_type,
      content_url: content.content_url,
      duration: content.duration || '',
      level: content.level,
      is_downloadable: content.is_downloadable,
      is_featured: content.is_featured,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;
    const { error } = await supabase.from('academy_content').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el contenido.' });
    } else {
      toast({ title: 'Éxito', description: 'Contenido eliminado.' });
      fetchContent();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const dataToSubmit = { ...formData, slug };

    let error;
    if (editingContent) {
      ({ error } = await supabase.from('academy_content').update(dataToSubmit).eq('id', editingContent.id));
    } else {
      ({ error } = await supabase.from('academy_content').insert(dataToSubmit));
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Contenido ${editingContent ? 'actualizado' : 'creado'}.` });
      setIsFormOpen(false);
      resetForm();
      fetchContent();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const ContentForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="title">Título</Label><Input id="title" name="title" value={formData.title} onChange={handleInputChange} required /></div>
      <div><Label htmlFor="description">Descripción</Label><Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} /></div>
      <div><Label>Tipo de Contenido</Label>
        <Select name="content_type" value={formData.content_type} onValueChange={(v) => setFormData(p => ({ ...p, content_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="video">Vídeo</SelectItem><SelectItem value="document">Documento</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label htmlFor="content_url">URL del Contenido</Label><Input id="content_url" name="content_url" value={formData.content_url} onChange={handleInputChange} required /></div>
      <div><Label htmlFor="duration">Duración (ej. 1h 30m)</Label><Input id="duration" name="duration" value={formData.duration} onChange={handleInputChange} /></div>
      <div><Label>Nivel</Label>
        <Select name="level" value={formData.level} onValueChange={(v) => setFormData(p => ({ ...p, level: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="Básico">Básico</SelectItem><SelectItem value="Intermedio">Intermedio</SelectItem><SelectItem value="Avanzado">Avanzado</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2"><Switch id="is_downloadable" checked={formData.is_downloadable} onCheckedChange={(c) => setFormData(p => ({ ...p, is_downloadable: c }))} /><Label htmlFor="is_downloadable">Permitir descarga</Label></div>
      <div className="flex items-center space-x-2"><Switch id="is_featured" checked={formData.is_featured} onCheckedChange={(c) => setFormData(p => ({ ...p, is_featured: c }))} /><Label htmlFor="is_featured">Destacado</Label></div>
      <Button type="submit">{editingContent ? 'Actualizar' : 'Crear'} Contenido</Button>
    </form>
  );

  return (
    <>
      <Helmet><title>Admin Academia - BSB Capital</title></Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Academia</h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild><Button onClick={resetForm}><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Contenido</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>{editingContent ? 'Editar' : 'Nuevo'} Contenido</DialogTitle></DialogHeader>{ContentForm}</DialogContent>
          </Dialog>
        </div>
        {loading ? <Loader2 className="mx-auto h-12 w-12 animate-spin" /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Tipo</TableHead><TableHead>Nivel</TableHead><TableHead>Descarga</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {contentList.map(content => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{content.content_type}</TableCell>
                  <TableCell>{content.level}</TableCell>
                  <TableCell>{content.is_downloadable ? 'Sí' : 'No'}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(content)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(content.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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