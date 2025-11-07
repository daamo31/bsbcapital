import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/forms/input';
import { Badge } from '@/components/ui/data-display/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/data-display/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';
import { supabase } from '@/lib/customSupabaseClient';
import ConsultationModal from './ConsultationModal';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadConsultations();
    loadAdmins();

    // Suscripción en tiempo real a cambios en la tabla consultations
    const channel = supabase.channel('consultations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, (payload) => {
        loadConsultations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter, adminFilter]);

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations_dashboard')
        .select('*')
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const filterConsultations = () => {
    let filtered = consultations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(consultation =>
        consultation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.consultation_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === statusFilter);
    }

    // Filter by admin assignment
    if (adminFilter === 'unassigned') {
      filtered = filtered.filter(consultation => !consultation.admin_id);
    } else if (adminFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.admin_id === adminFilter);
    }

    setFilteredConsultations(filtered);
  };

  const handleEditConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const handleNewConsultation = () => {
    setSelectedConsultation(null);
    setShowModal(true);
  };

  const handleModalSave = () => {
    loadConsultations();
    setShowModal(false);
  };

  const handleDeleteConsultation = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta consultoría?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadConsultations();
    } catch (error) {
      console.error('Error deleting consultation:', error);
      alert('Error al eliminar la consultoría');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { label: 'Programada', className: 'bg-blue-100 text-blue-800' },
      confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Completada', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
      no_show: { label: 'No se presentó', className: 'bg-yellow-100 text-yellow-800' },
      pending_payment: { label: 'Pendiente pago', className: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_payment':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando consultorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Gestión de Consultorías
          </h2>
          <p className="text-gray-600 mt-1">
            Administra todas las consultorías y ve las respuestas de los formularios
          </p>
        </div>
        <Button onClick={handleNewConsultation}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Consultoría
        </Button>
      </div>

      {/* Filtros y estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Buscar</label>
          <Input
            placeholder="Buscar por cliente, email, servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="scheduled">Programada</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
              <SelectItem value="no_show">No se presentó</SelectItem>
              <SelectItem value="pending_payment">Pendiente pago</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Administrador</label>
          <Select value={adminFilter} onValueChange={setAdminFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              <SelectItem value="admin-daniel">Daniel García</SelectItem>
              <SelectItem value="admin-maria">María López</SelectItem>
              <SelectItem value="admin-carlos">Carlos Rodríguez</SelectItem>
              <SelectItem value="admin-ana">Ana Martínez</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Sin asignar</label>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <span className="text-2xl font-bold text-orange-600">
              {consultations.filter(c => !c.admin_id).length}
            </span>
            <p className="text-sm text-orange-700">Consultorías pendientes</p>
          </div>
        </div>
      </div>

      {/* Tabla simplificada solo con los campos de la vista */}
      <Card>
        <CardHeader>
          <CardTitle>Consultorías ({filteredConsultations.length})</CardTitle>
          <CardDescription>
            Lista de todas las consultorías registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay consultorías
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No se encontraron consultorías con los filtros aplicados.' : 'Aún no hay consultorías registradas.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewConsultation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera consultoría
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Post-Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((consultation, idx) => {
                    // El formulario post-pago está completado si existe form_completed_at
                    const hasPostPaymentForm = !!consultation.form_completed_at;
                    
                    // Lista de administradores disponibles
                    const administrators = [
                      { id: 'admin-daniel', name: 'Daniel García' },
                      { id: 'admin-maria', name: 'María López' },
                      { id: 'admin-carlos', name: 'Carlos Rodríguez' },
                      { id: 'admin-ana', name: 'Ana Martínez' },
                    ];
                    
                    const getAdminName = (adminId) => {
                      if (!adminId) return 'Sin asignar';
                      const admin = administrators.find(a => a.id === adminId);
                      return admin ? admin.name : 'Desconocido';
                    };
                    
                    return (
                      <TableRow key={consultation.id || idx}>
                        <TableCell className="font-medium">{consultation.client_name || 'Sin nombre'}</TableCell>
                        <TableCell>{consultation.client_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{consultation.service || 'General'}</Badge>
                        </TableCell>
                        <TableCell>
                          {consultation.booking_date ? new Date(consultation.booking_date).toLocaleDateString('es-ES') : 'No programada'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(consultation.status)}
                            {getStatusBadge(consultation.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={consultation.admin_id ? "default" : "outline"}>
                            {getAdminName(consultation.admin_id)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasPostPaymentForm ? (
                            <Badge className="bg-green-100 text-green-800">
                              <FileText className="h-3 w-3 mr-1" />
                              Completado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowModal(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        consultation={selectedConsultation}
        admins={admins}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default ConsultationManagement;