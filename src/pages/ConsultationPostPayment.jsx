import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import DetailedConsultationForm from '@/components/DetailedConsultationForm';
import { 
  CheckCircle, 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Building, 
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';
import emailService from '@/lib/emailService';

const ConsultationPostPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: user?.email || '',
    client_phone: '',
    company_name: '',
    investment_experience: '',
    portfolio_size: '',
    consultation_goals: '',
    current_investments: '',
    specific_questions: '',
    preferred_communication: 'email',
    additional_notes: ''
  });

  // Obtener datos de la consulta desde la URL
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const consultationId = searchParams.get('consultation_id');
    
    if (!sessionId && !consultationId) {
      // Redirigir si no hay parámetros válidos
      navigate('/consultoria');
      return;
    }

    const loadConsultationData = async () => {
      try {
        let consultationData = null;

        if (consultationId) {
          // Buscar por ID de consulta directamente
          const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('id', consultationId)
            .single();

          if (error) throw error;
          consultationData = data;
        } else if (sessionId) {
          // Buscar por session_id de Stripe
          const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

          if (error) throw error;
          consultationData = data;
        }

        if (consultationData) {
          setConsultation(consultationData);
          
          // Pre-rellenar formulario con datos existentes
          setFormData(prev => ({
            ...prev,
            client_name: consultationData.client_name || '',
            client_email: consultationData.client_email || user?.email || '',
            client_phone: consultationData.client_phone || '',
            company_name: consultationData.company_name || '',
            investment_experience: consultationData.investment_experience || '',
            portfolio_size: consultationData.portfolio_size || '',
            consultation_goals: consultationData.consultation_goals || '',
            additional_notes: consultationData.additional_notes || ''
          }));
        }

      } catch (error) {
        console.error('Error loading consultation:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información de la consulta."
        });
        navigate('/consultoria');
      }
    };

    loadConsultationData();
  }, [searchParams, user, navigate, toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailedFormSubmit = async (detailedData) => {
    setLoading(true);

    try {
      // Actualizar la consulta con los datos detallados
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          // Estructura alineada con admin
          ...detailedData,
          form_completed_at: new Date().toISOString(),
          status: 'confirmed'
        })
        .eq('id', consultation.id);

      if (updateError) throw updateError;

      // Intentar enviar PDF por email (no bloquear si falla)
      try {
        const consultationPDFService = await import('@/lib/consultationPDFService');
        await consultationPDFService.default.sendConsultationSummaryEmail(
          consultation,
          detailedData,
          detailedData.client_email || consultation.client_email
        );
        
        toast({
          title: "¡Formulario completado!",
          description: "Datos guardados y resumen enviado por email. Te contactaremos pronto."
        });
      } catch (emailError) {
        console.error('Error sending PDF email:', emailError);
        toast({
          title: "¡Formulario completado!",
          description: "Datos guardados correctamente. Te contactaremos pronto con los detalles."
        });
      }

      // Redirigir a área cliente
      navigate('/area-cliente?tab=consultations');

    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al guardar tus datos. Por favor, inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.client_email || !formData.consultation_goals) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos obligatorios."
      });
      return;
    }

    setLoading(true);

    try {
      // Actualizar la consulta con los datos adicionales
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          // Usar estructura alineada con admin
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_phone: formData.client_phone,
          company_name: formData.company_name,
          investment_experience: formData.investment_experience,
          portfolio_size: formData.portfolio_size,
          consultation_goals: formData.consultation_goals,
          description: `${formData.additional_notes}\n\nInversiones actuales: ${formData.current_investments}\nPreguntas específicas: ${formData.specific_questions}\nPreferencia de comunicación: ${formData.preferred_communication}`,
          status: 'confirmed', // Confirmar la consulta después del pago
          // Mantener campos originales para compatibilidad
          additional_notes: `${formData.additional_notes}\n\nInversiones actuales: ${formData.current_investments}\nPreguntas específicas: ${formData.specific_questions}\nPreferencia de comunicación: ${formData.preferred_communication}`
        })
        .eq('id', consultation.id);

      if (updateError) throw updateError;

      // Enviar email de confirmación de consulta
      try {
        await emailService.sendConsultationConfirmation({
          name: formData.client_name,
          email: formData.client_email,
          consultationType: consultation.title,
          scheduledDate: new Date(consultation.scheduled_at).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          scheduledTime: new Date(consultation.scheduled_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          duration: `${consultation.duration_minutes} minutos`,
          consultationGoals: formData.consultation_goals,
          meetingUrl: consultation.meeting_url || 'Se proporcionará antes de la consulta'
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // No bloquear el flujo si falla el email
      }

      toast({
        title: "¡Consulta confirmada!",
        description: "Hemos registrado tus datos. Te contactaremos pronto con los detalles de la reunión."
      });

      // Redirigir a página de éxito o dashboard
      navigate('/area-cliente?tab=consultations');

    } catch (error) {
      console.error('Error updating consultation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al guardar tus datos. Por favor, inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!consultation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Completar Información - Consultoría BSB Capital</title>
        <meta name="description" content="Completa tu información para personalizar tu consultoría financiera." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de éxito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Pago Procesado Exitosamente!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Para personalizar tu consultoría y asegurar que obtienes el máximo valor, 
              necesitamos algunos datos adicionales sobre tu situación financiera.
            </p>
          </motion.div>

          {/* Información de la consulta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-green-800">
                  <Calendar className="h-5 w-5 mr-2" />
                  Detalles de tu Consultoría
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo</p>
                      <p className="font-medium">{consultation.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">
                        {new Date(consultation.scheduled_at).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Hora y Duración</p>
                      <p className="font-medium">
                        {new Date(consultation.scheduled_at).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} ({consultation.duration_minutes} min)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Formulario de datos adicionales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información para Personalizar tu Consultoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Selector de tipo de formulario */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Formulario de consultoría</h4>
                      <p className="text-sm text-blue-700">
                        {showDetailedForm ? 
                          "Formulario completo y personalizado para tu tipo de consultoría" : 
                          "Formulario básico y rápido"
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDetailedForm(!showDetailedForm)}
                      className="ml-4"
                    >
                      {showDetailedForm ? "Formulario simple" : "Formulario completo"}
                    </Button>
                  </div>
                </div>

                {showDetailedForm ? (
                  <DetailedConsultationForm 
                    consultation={consultation}
                    onSubmit={handleDetailedFormSubmit}
                    loading={loading}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información personal */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_name">Nombre Completo *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        required
                        icon={<User className="h-4 w-4" />}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_email">Email *</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_phone">Teléfono</Label>
                      <Input
                        id="client_phone"
                        value={formData.client_phone}
                        onChange={handleChange}
                        icon={<Phone className="h-4 w-4" />}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company_name">Empresa/Organización</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        icon={<Building className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {/* Información financiera */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Perfil Financiero
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="investment_experience">Experiencia en Inversión</Label>
                        <Select 
                          value={formData.investment_experience} 
                          onValueChange={(value) => handleSelectChange('investment_experience', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Principiante (0-2 años)</SelectItem>
                            <SelectItem value="intermediate">Intermedio (2-5 años)</SelectItem>
                            <SelectItem value="advanced">Avanzado (5-10 años)</SelectItem>
                            <SelectItem value="expert">Experto (+10 años)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="portfolio_size">Tamaño de Cartera</Label>
                        <Select 
                          value={formData.portfolio_size} 
                          onValueChange={(value) => handleSelectChange('portfolio_size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el rango" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-10k">€0 - €10.000</SelectItem>
                            <SelectItem value="10k-50k">€10.000 - €50.000</SelectItem>
                            <SelectItem value="50k-100k">€50.000 - €100.000</SelectItem>
                            <SelectItem value="100k-500k">€100.000 - €500.000</SelectItem>
                            <SelectItem value="500k+">€500.000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current_investments">Inversiones Actuales</Label>
                        <Textarea
                          id="current_investments"
                          value={formData.current_investments}
                          onChange={handleChange}
                          placeholder="Describe brevemente tus inversiones actuales (acciones, fondos, cripto, inmuebles, etc.)"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="consultation_goals">Objetivos de la Consultoría *</Label>
                        <Textarea
                          id="consultation_goals"
                          value={formData.consultation_goals}
                          onChange={handleChange}
                          placeholder="¿Qué esperas conseguir con esta consultoría? ¿Cuáles son tus objetivos específicos?"
                          required
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="specific_questions">Preguntas Específicas</Label>
                        <Textarea
                          id="specific_questions"
                          value={formData.specific_questions}
                          onChange={handleChange}
                          placeholder="¿Hay alguna pregunta específica que te gustaría que abordemos durante la consulta?"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferencias de comunicación */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Preferencias de Comunicación
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="preferred_communication">Método Preferido</Label>
                        <Select 
                          value={formData.preferred_communication} 
                          onValueChange={(value) => handleSelectChange('preferred_communication', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="video">Videollamada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="additional_notes">Notas Adicionales</Label>
                      <Textarea
                        id="additional_notes"
                        value={formData.additional_notes}
                        onChange={handleChange}
                        placeholder="Cualquier información adicional que consideres relevante..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Información importante */}
                  <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">¿Qué sucede después?</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Recibirás un email de confirmación con todos los detalles</li>
                        <li>• Te contactaremos 24-48h antes para confirmar y enviar el enlace de reunión</li>
                        <li>• Prepararemos material personalizado basado en tu información</li>
                        <li>• Después de la consulta recibirás un resumen y recomendaciones por escrito</li>
                      </ul>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex-1"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Consultoría
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/area-cliente')}
                      className="sm:w-auto"
                    >
                      Completar Más Tarde
                    </Button>
                  </div>
                </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ConsultationPostPayment;