import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useAdmin } from '@/hooks/useAdmin';
import { Calendar, Clock, User, Save, X } from 'lucide-react';

// Función para generar UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ConsultationModal = ({ 
  isOpen, 
  onClose, 
  consultation = null, 
  admins = [], 
  defaultDate = null,
  defaultTime = null,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: consultation?.title || '',
    description: consultation?.description || '',
    date: defaultDate || consultation?.scheduled_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    start_time: defaultTime || consultation?.scheduled_at?.split('T')[1]?.substring(0, 5) || '09:00',
    duration: consultation?.duration_minutes ? consultation.duration_minutes / 60 : 1,
    admin_id: consultation?.consultant_id || '',
    client_email: consultation?.client_email || '',
    status: consultation?.status || 'scheduled',
    consultation_type: consultation?.consultation_type || 'general'
  });
  
  const [saving, setSaving] = useState(false);
  const { logAdminActivity } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Construir timestamps
      const startDateTime = new Date(`${formData.date}T${formData.start_time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (formData.duration * 60 * 60 * 1000));

      const consultationData = {
        title: formData.title,
        description: formData.description,
        consultant_id: formData.admin_id,
        scheduled_at: startDateTime.toISOString(),
        duration_minutes: formData.duration * 60,
        status: formData.status,
        consultation_type: formData.consultation_type,
        client_email: formData.client_email
      };

      let result;
      
      if (consultation) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', consultation.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        await logAdminActivity(
          `Actualizó consultoría: ${formData.title}`,
          'consultation',
          consultation.id
        );
      } else {
        // Buscar o crear cliente
        let clientId = null;
        
        if (formData.client_email) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', formData.client_email)
            .maybeSingle(); // Cambiado para evitar errores cuando no hay resultados
            
          if (existingUser) {
            clientId = existingUser.id;
          } else {
            // Crear usuario básico si no existe - con manejo robusto de errores
            let createAttempts = 0;
            const maxAttempts = 3;
            
            while (createAttempts < maxAttempts) {
              try {
                const newUserId = generateUUID(); // Generar UUID manualmente
                const userData = {
                  id: newUserId,
                  email: formData.client_email,
                  full_name: formData.client_email.split('@')[0],
                  role: 'user',
                  membership_tier: 'free',
                  subscription_status: 'free',
                  is_active: true,
                  access_level: 0
                };
                
                const { data: newUser, error: userError } = await supabase
                  .from('users')
                  .insert(userData)
                  .select('id')
                  .single();
                  
                if (userError) {
                  createAttempts++;
                  console.error(`Error creating user (attempt ${createAttempts}):`, userError);
                  
                  // Si es error de constraint, intentar sin especificar ID
                  if (userError.code === '23503' || userError.code === '23505') {
                    const { data: autoUser, error: autoError } = await supabase
                      .from('users')
                      .insert({
                        email: formData.client_email,
                        full_name: formData.client_email.split('@')[0],
                        role: 'user',
                        membership_tier: 'free',
                        subscription_status: 'free',
                        is_active: true,
                        access_level: 0
                      })
                      .select('id')
                      .single();
                      
                    if (!autoError && autoUser) {
                      clientId = autoUser.id;
                      break;
                    }
                  }
                  
                  if (createAttempts >= maxAttempts) {
                    throw new Error(`Error al crear usuario después de ${maxAttempts} intentos: ${userError.message}`);
                  }
                  continue;
                }
                
                clientId = newUser.id;
                break;
                
              } catch (error) {
                createAttempts++;
                console.error(`Exception creating user (attempt ${createAttempts}):`, error);
                
                if (createAttempts >= maxAttempts) {
                  throw error;
                }
              }
            }
          }
        }

        // Crear nueva consultoría
        const { data, error } = await supabase
          .from('consultations')
          .insert({
            ...consultationData,
            user_id: clientId
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        await logAdminActivity(
          `Creó nueva consultoría: ${formData.title}`,
          'consultation',
          result.id
        );
      }

      onSave?.(result);
      onClose();
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error al guardar la consultoría');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {consultation ? 'Editar Consultoría' : 'Nueva Consultoría'}
          </DialogTitle>
          <DialogDescription>
            {consultation ? 'Modifica los datos de la consultoría' : 'Programa una nueva consultoría o reunión'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Consultoría de inversión"
                required
              />
            </div>

            {/* Email del cliente */}
            <div>
              <Label htmlFor="client_email">Email del Cliente</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => handleChange('client_email', e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>

            {/* Administrador asignado */}
            <div>
              <Label htmlFor="admin_id">Administrador Asignado *</Label>
              <Select value={formData.admin_id} onValueChange={(value) => handleChange('admin_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar administrador" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {admin.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            {/* Hora de inicio */}
            <div>
              <Label htmlFor="start_time">Hora de Inicio *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
              />
            </div>

            {/* Duración */}
            <div>
              <Label htmlFor="duration">Duración (horas)</Label>
              <Select value={formData.duration.toString()} onValueChange={(value) => handleChange('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30 minutos</SelectItem>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="1.5">1.5 horas</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="consultation_type">Tipo de Consulta</Label>
              <Select value={formData.consultation_type} onValueChange={(value) => handleChange('consultation_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                  <SelectItem value="portfolio">Cartera</SelectItem>
                  <SelectItem value="strategy">Estrategia</SelectItem>
                  <SelectItem value="technical">Técnica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">No se presentó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detalles de la consultoría..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : consultation ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;