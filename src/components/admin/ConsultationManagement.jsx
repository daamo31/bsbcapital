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
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadConsultations();
    loadAdmins();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]);

  const loadConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles:user_id (
            email,
            name,
            avatar_url
          ),
          admin_profiles:consultant_id (
            name,
            email
          )
        `)
        .order('scheduled_at', { ascending: false });

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
        .select('id, name, email')
        .eq('role', 'admin');

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Programadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Confirmadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Con Formulario</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.form_completed_at).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pend. Pago</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations.filter(c => c.status === 'pending_payment').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, email, tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="scheduled">Programadas</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="pending_payment">Pendiente pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations Table */}
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
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron consultorías con los filtros aplicados.'
                  : 'Aún no hay consultorías registradas.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
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
                    <TableHead>Consultoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Formulario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultations.map((consultation) => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {consultation.profiles?.avatar_url ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={consultation.profiles.avatar_url}
                                alt=""
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {consultation.profiles?.name || consultation.client_name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consultation.client_email || consultation.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {consultation.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.consultation_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(consultation.scheduled_at).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(consultation.scheduled_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(consultation.status)}
                          {getStatusBadge(consultation.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {consultation.form_completed_at ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Completado</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Pendiente</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConsultation(consultation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConsultation(consultation.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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