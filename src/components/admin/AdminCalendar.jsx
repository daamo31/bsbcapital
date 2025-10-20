import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/data-display/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAdmin } from '@/hooks/useAdmin';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import ConsultationModal from './ConsultationModal';

// Componente para detalles del día
const DayDetailsPanel = ({ 
  date, 
  events, 
  admins, 
  onQuickBlock, 
  onDeleteConsultation, 
  onDeleteTimeBlock,
  onEditConsultation,
  onClose 
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleQuickBlock = () => {
    if (selectedAdmin && selectedTimeSlot) {
      onQuickBlock(date, selectedAdmin, selectedTimeSlot);
      setSelectedAdmin('');
      setSelectedTimeSlot('');
    }
  };

  // Combinar consultas y bloques en una lista de eventos
  const allEvents = [
    ...(events.consultations || []).map(consultation => ({
      id: consultation.user_id || consultation.id,
      type: 'consultation',
      client: consultation.client_name,
      booking_date: consultation.booking_date,
      title: consultation.title
    }))
  ];

  return (
    <div className="fixed inset-0 lg:relative lg:inset-auto bg-white lg:bg-transparent border-0 lg:border lg:border-gray-200 lg:rounded-lg lg:shadow-lg p-4 lg:p-4 z-50 lg:z-auto overflow-y-auto lg:overflow-visible">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Eventos para {format(date, 'dd/MM/yyyy', { locale: es })}
        </h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Lista de eventos */}
      <div className="space-y-2 mb-4">
        {allEvents.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No hay eventos programados</p>
        ) : (
          allEvents.map((event, idx) => (
            <div key={event.id || `${event.booking_date}-${event.client}-${idx}`} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base">{event.client}</div>
                  <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {event.booking_date ? new Date(event.booking_date).toLocaleString('es-ES') : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bloqueo rápido */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3 text-sm sm:text-base">Bloqueo rápido de tiempo</h4>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <select 
            value={selectedAdmin} 
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="flex-1 p-2 border rounded text-sm"
          >
            <option value="">Seleccionar admin</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.name || admin.full_name || admin.email}
              </option>
            ))}
          </select>
          <select 
            value={selectedTimeSlot} 
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            className="flex-1 p-2 border rounded text-sm"
          >
            <option value="">Seleccionar hora</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <Button 
          onClick={handleQuickBlock}
          disabled={!selectedAdmin || !selectedTimeSlot}
          className="w-full text-sm"
        >
          <Ban className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Bloquear tiempo
        </Button>
      </div>
    </div>
  );
};

// Datos mock para desarrollo

const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  const { isAdmin, logAdminActivity } = useAdmin();

  useEffect(() => {
    if (isAdmin) {
      loadCalendarData();
    }
  }, [currentDate, selectedAdmin, isAdmin]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

      // Cargar solo cliente, fecha y hora desde la vista
      const { data, error } = await supabase
        .from('consultations_dashboard')
        .select('client_name, booking_date, title, user_id')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate);

      if (error) throw error;

      setCalendarData({
        consultations: data || [],
        time_blocks: [], // Si tienes otra vista para bloques, agrégala aquí
        admins: [] // Si necesitas admins, agrégalo aquí
      });
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date) => {
    if (!calendarData) return { consultations: [], blocks: [] };
    const consultations = (calendarData.consultations || []).filter(consultation => {
      if (!consultation.booking_date) return false;
      // booking_date puede ser string o Date
      const bookingDate = new Date(consultation.booking_date);
      return isSameDay(bookingDate, date);
    });
    const blocks = (calendarData.time_blocks || []).filter(block => {
      if (!block.start_time) return false;
      return isSameDay(new Date(block.start_time), date);
    });
    return { consultations, blocks };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleQuickBlock = async (date, hour) => {
    if (!selectedAdmin) {
      alert('Selecciona un administrador primero');
      return;
    }

    try {
      // Asegurar que hour es un número entero
      const hourInt = parseInt(hour);
      if (isNaN(hourInt) || hourInt < 0 || hourInt > 23) {
        alert('Hora inválida');
        return;
      }

      const { data, error } = await supabase.rpc('quick_time_block', {
        admin_id_param: selectedAdmin,
        block_date: format(date, 'yyyy-MM-dd'),
        start_hour: hourInt,
        duration_hours: 1,
        reason_param: 'Bloqueado desde calendario'
      });

      if (error) throw error;

      await logAdminActivity(
        `Bloqueó horario ${format(date, 'dd/MM/yyyy')} ${hourInt}:00`,
        'time_block',
        data?.id || 'unknown'
      );

      loadCalendarData();
    } catch (error) {
      console.error('Error creating time block:', error);
      alert('Error al bloquear horario: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!confirm('¿Estás seguro de eliminar esta consultoría?')) return;

    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultationId);

      if (error) throw error;

      await logAdminActivity(
        'Eliminó consultoría',
        'consultation',
        consultationId
      );

      loadCalendarData();
    } catch (error) {
      console.error('Error deleting consultation:', error);
      alert('Error al eliminar consultoría');
    }
  };

  const handleDeleteTimeBlock = async (blockId) => {
    if (!confirm('¿Eliminar este bloqueo de tiempo?')) return;

    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      await logAdminActivity(
        'Eliminó bloqueo de tiempo',
        'time_block',
        blockId
      );

      loadCalendarData();
    } catch (error) {
      console.error('Error deleting time block:', error);
      alert('Error al eliminar bloqueo');
    }
  };

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Obtener el primer día de la semana (domingo) y último día de la semana
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = domingo
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    // Todos los días a mostrar en el calendario (incluyendo días del mes anterior/siguiente)
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-px sm:gap-1 mt-4 bg-gray-200 sm:bg-transparent">
        {/* Headers de días */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
          <div key={day} className="p-1 sm:p-2 text-center font-semibold text-gray-600 bg-gray-50 text-xs sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{['D', 'L', 'M', 'X', 'J', 'V', 'S'][index]}</span>
          </div>
        ))}
        
        {/* Días del calendario */}
        {days.map(day => {
          const { consultations, blocks } = getEventsForDate(day);
          const hasEvents = consultations.length > 0 || blocks.length > 0;
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] sm:min-h-[120px] p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                isToday ? 'bg-blue-50' : 'bg-white'
              } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs sm:text-sm font-medium ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="space-y-0.5 sm:space-y-1">
                {consultations.slice(0, window.innerWidth < 640 ? 1 : 2).map((consultation, idx) => (
                  <div
                    key={consultation.id || `${consultation.booking_date}-${consultation.client_name || consultation.client}-${idx}`}
                    className="text-xs p-0.5 sm:p-1 rounded border bg-blue-100 text-blue-800 border-blue-200"
                  >
                    <div className="font-medium truncate text-xs">{consultation.client_name || consultation.client}</div>
                    <div className="text-xs opacity-75 hidden sm:block">
                      {consultation.booking_date ? new Date(consultation.booking_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                ))}
                
                {blocks.slice(0, window.innerWidth < 640 ? 0 : 1).map(block => (
                  <div
                    key={block.id}
                    className="text-xs p-0.5 sm:p-1 rounded bg-red-100 text-red-800 border border-red-200 hidden sm:block"
                  >
                    <Ban className="w-2 h-2 sm:w-3 sm:h-3 inline mr-1" />
                    <span className="hidden sm:inline">Bloqueado</span>
                  </div>
                ))}
                
                {(consultations.length + blocks.length) > (window.innerWidth < 640 ? 1 : 3) && (
                  <div className="text-xs text-gray-500 text-center">
                    +{(consultations.length + blocks.length) - (window.innerWidth < 640 ? 1 : 3)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isAdmin) {
    return <div>Acceso denegado</div>;
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando calendario...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header del calendario */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CalendarIcon className="h-5 w-5" />
                Gestión de Calendario
              </CardTitle>
              <CardDescription>
                Administra consultorias, reservas y disponibilidad
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Filtro por administrador */}
              <select
                value={selectedAdmin || ''}
                onChange={(e) => setSelectedAdmin(e.target.value || null)}
                className="px-3 py-2 border rounded-md text-sm min-w-[180px] sm:min-w-[200px]"
              >
                <option value="">Todos los administradores</option>
                {(calendarData?.admins || []).map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
              
              {/* Navegación del mes */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h3 className="font-semibold min-w-[120px] sm:min-w-[150px] text-center text-sm sm:text-base">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={() => setShowConsultationModal(true)}
                className="text-sm px-3 py-2"
              >
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nueva Reserva</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          <CalendarGrid />
        </CardContent>
      </Card>

      {/* Panel de detalles del día seleccionado */}
      {selectedDate && (
        <DayDetailsPanel
          date={selectedDate}
          events={getEventsForDate(selectedDate)}
          admins={calendarData?.admins || []}
          onQuickBlock={handleQuickBlock}
          onDeleteConsultation={handleDeleteConsultation}
          onDeleteTimeBlock={handleDeleteTimeBlock}
          onEditConsultation={(consultation) => {
            setEditingConsultation(consultation);
            setShowConsultationModal(true);
          }}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Modal de consultoría */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => {
          setShowConsultationModal(false);
          setEditingConsultation(null);
        }}
        consultation={editingConsultation}
        admins={calendarData?.admins || []}
        defaultDate={selectedDate}
        onSave={() => {
          loadCalendarData();
          setShowConsultationModal(false);
          setEditingConsultation(null);
        }}
      />
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default AdminCalendar;