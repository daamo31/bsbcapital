import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Calendar } from "@/components/ui/data-display/calendar";
import { Badge } from '@/components/ui/data-display/badge';
import { useToast } from "@/components/ui/feedback/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ConsultationCalendar = ({ 
  onSlotSelected, 
  selectedDuration = 30,
  consultationType = 'general' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLimits, setUserLimits] = useState(null);
  const [showLimitsInfo, setShowLimitsInfo] = useState(false);

  // Cargar límites del usuario
  useEffect(() => {
    const checkUserLimits = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .rpc('check_user_consultation_limits', {
            user_id_param: user.id,
            consultation_type_param: consultationType
          });

        if (error) {
          console.error('Error checking limits:', error);
          return;
        }

        if (data && data.length > 0) {
          setUserLimits(data[0]);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    checkUserLimits();
  }, [user, consultationType]);

  // Cargar slots disponibles para una fecha
  const loadAvailableSlots = async (date) => {
    if (!date) return;

    setLoading(true);
    try {
      // Obtener slots disponibles
      const { data: slotsData, error: slotsError } = await supabase
        .rpc('get_available_slots', {
          target_date: format(date, 'yyyy-MM-dd'),
          duration_minutes: selectedDuration
        });

      if (slotsError) {
        console.error('Error loading slots:', slotsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los horarios disponibles."
        });
        return;
      }

      // Obtener consultas ya reservadas para el día
      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select('scheduled_at, duration_minutes, status')
        .gte('scheduled_at', format(date, 'yyyy-MM-dd') + ' 00:00:00')
        .lt('scheduled_at', format(addDays(date, 1), 'yyyy-MM-dd') + ' 00:00:00')
        .in('status', ['scheduled', 'confirmed']);

      if (consultationsError) {
        console.error('Error loading consultations:', consultationsError);
      }

      setAvailableSlots(slotsData || []);
      setBookedSlots(consultationsData || []);

    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al cargar el calendario."
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar slots cuando cambia la fecha o hay cambios en la tabla consultations
  useEffect(() => {
    loadAvailableSlots(selectedDate);

    // Suscripción en tiempo real a cambios en la tabla consultations
    const channel = supabase.channel('calendar_consultations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, (payload) => {
        loadAvailableSlots(selectedDate);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, selectedDuration]);

  // Verificar si un slot está disponible
  const isSlotAvailable = (slotTime) => {
    const slot = availableSlots.find(s => s.slot_time === slotTime);
    return slot ? slot.is_available : false;
  };

  // Generar slots de tiempo para mostrar
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9:00 AM
    const endHour = 18; // 6:00 PM
    const intervalMinutes = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = format(selectedDate, 'yyyy-MM-dd') + ' ' + timeString + ':00';
        
        // Solo mostrar slots futuros
        const slotTime = parseISO(slotDateTime);
        if (isAfter(slotTime, new Date())) {
          slots.push({
            time: timeString,
            datetime: slotDateTime,
            fullDateTime: slotTime
          });
        }
      }
    }

    return slots;
  };

  const handleSlotClick = (slot) => {
    // Verificar límites del usuario
    if (userLimits && !userLimits.can_book) {
      toast({
        variant: "destructive",
        title: "No puedes reservar",
        description: userLimits.reason
      });
      return;
    }

    // Verificar disponibilidad
    if (!isSlotAvailable(slot.datetime)) {
      toast({
        variant: "destructive",
        title: "Horario no disponible",
        description: "Este horario ya está ocupado o no está disponible."
      });
      return;
    }

    // Confirmar selección
    if (onSlotSelected) {
      onSlotSelected({
        date: selectedDate,
        time: slot.time,
        datetime: slot.datetime,
        fullDateTime: slot.fullDateTime
      });
    }
  };

  const getSlotStatus = (slot) => {
    if (!isSlotAvailable(slot.datetime)) {
      return 'unavailable';
    }
    return 'available';
  };

  const getSlotClassName = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 cursor-pointer';
      case 'unavailable':
        return 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-500';
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-6">
      {/* Información de límites del usuario */}
      {userLimits && (
        <Card className={`${userLimits.can_book ? 'border-green-200' : 'border-yellow-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              {userLimits.can_book ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
              )}
              Estado de Membresía
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm">
              <span>Consultas este mes:</span>
              <Badge variant={userLimits.monthly_used >= userLimits.monthly_limit ? "destructive" : "secondary"}>
                {userLimits.monthly_used} / {userLimits.monthly_limit === 0 ? '∞' : userLimits.monthly_limit}
              </Badge>
            </div>
            {!userLimits.can_book && (
              <p className="text-sm text-yellow-600 mt-2">
                {userLimits.reason}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selector de fecha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Seleccionar Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => 
              isBefore(date, new Date()) || 
              date.getDay() === 0 || // Domingo
              date.getDay() === 6    // Sábado
            }
            locale={es}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Horarios disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horarios Disponibles
            </div>
            <div className="text-sm text-gray-500">
              {format(selectedDate, "EEEE, d MMMM yyyy", { locale: es })}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((slot) => {
                const status = getSlotStatus(slot);
                return (
                  <Button
                    key={slot.time}
                    variant="outline"
                    size="sm"
                    className={getSlotClassName(status)}
                    onClick={() => handleSlotClick(slot)}
                    disabled={status === 'unavailable' || !userLimits?.can_book}
                  >
                    {slot.time}
                  </Button>
                );
              })}
            </div>
          )}

          {timeSlots.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay horarios disponibles para esta fecha</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
              <span>No disponible</span>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>• Horario de atención: Lunes a Viernes, 9:00 - 18:00</p>
            <p>• Duración de consulta: {selectedDuration} minutos</p>
            <p>• Las citas deben reservarse con al menos 24 horas de antelación</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para información de límites */}
      <Dialog open={showLimitsInfo} onOpenChange={setShowLimitsInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información de Membresía</DialogTitle>
            <DialogDescription>
              Detalles sobre los límites de consultas de tu membresía actual.
            </DialogDescription>
          </DialogHeader>
          
          {userLimits && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Consultas este mes</p>
                  <p className="text-2xl font-bold">{userLimits.monthly_used}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Límite mensual</p>
                  <p className="text-2xl font-bold">
                    {userLimits.monthly_limit === 0 ? '∞' : userLimits.monthly_limit}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Estado actual:</p>
                <Badge variant={userLimits.can_book ? "default" : "destructive"}>
                  {userLimits.reason}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowLimitsInfo(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultationCalendar;