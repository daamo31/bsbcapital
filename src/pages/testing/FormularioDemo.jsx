import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Badge } from '@/components/ui/data-display/badge';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import {
  CheckCircle,
  Calendar,
  Clock,
  Mail,
  FileText,
  Building2,
  TrendingUp,
  Coins,
} from 'lucide-react';
import FinancialPlanningForm from '@/components/consultations/forms/FinancialPlanningForm';
import OnboardingCryptoForm from '@/components/consultations/forms/OnboardingCryptoForm';
import GenericConsultationForm from '@/components/consultations/forms/GenericConsultationForm';
import TreasuryEnterpriseForm from '@/components/consultations/forms/TreasuryEnterpriseForm';
import emailService from '@/lib/emailService';
import { useToast } from '@/components/ui/feedback/use-toast';

const FormularioDemo = () => {
  const { toast } = useToast();
  const [consultationType, setConsultationType] = useState('financial_planning');
  const [formData, setFormData] = useState({
    client_name: 'Usuario de Prueba',
    client_email: 'prueba@example.com',
    telephone: '+34 600 123 456',
    country: 'España',
    age_range: '26-35',
    preferred_communication: 'email',
  });
  const [emailsSent, setEmailsSent] = useState([]);
  const [loading, setLoading] = useState(false);

  const consultationTypes = [
    {
      value: 'financial_planning',
      label: 'Optimización de cartera',
      icon: TrendingUp,
      description: 'Planificación financiera completa',
      emailMethod: 'sendConsultationPortfolioOptimization',
    },
    {
      value: 'portfolio',
      label: 'Crypto & Web3',
      icon: Coins,
      description: 'Consultoría cripto y blockchain',
      emailMethod: 'sendConsultationCryptoWeb3',
    },
    {
      value: 'onboarding_crypto',
      label: 'Onboarding cripto',
      icon: FileText,
      description: 'Primeros pasos en criptomonedas',
      emailMethod: 'sendConsultationCryptoOnboarding',
    },
    {
      value: 'crypto_advanced',
      label: 'Gestión de tesorería cripto para empresas',
      icon: Building2,
      description: 'Gestión empresarial de activos digitales',
      emailMethod: 'sendConsultationTreasuryCrypto',
    },
  ];

  const currentType = consultationTypes.find((t) => t.value === consultationType);

  const mockConsultation = {
    id: 'demo-consultation-123',
    service: consultationType,
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes:
      consultationType === 'onboarding_crypto'
        ? 30
        : consultationType === 'crypto_advanced'
          ? 90
          : 60,
    status: 'pending',
  };

  const getFormComponent = () => {
    switch (consultationType) {
      case 'financial_planning':
        return <FinancialPlanningForm formData={formData} setFormData={setFormData} />;
      case 'onboarding_crypto':
        return <OnboardingCryptoForm formData={formData} setFormData={setFormData} />;
      case 'crypto_advanced':
        return <TreasuryEnterpriseForm formData={formData} setFormData={setFormData} />;
      case 'portfolio':
        return <GenericConsultationForm formData={formData} setFormData={setFormData} />;
      default:
        return <GenericConsultationForm formData={formData} setFormData={setFormData} />;
    }
  };

  const handleSendTestEmail = async () => {
    setLoading(true);

    try {
      const emailData = {
        name: formData.client_name || 'Usuario de Prueba',
        email: formData.client_email || 'prueba@example.com',
        consultationType: currentType.label,
        scheduledDate: new Date(mockConsultation.scheduled_at).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        scheduledTime: new Date(mockConsultation.scheduled_at).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        duration: `${mockConsultation.duration_minutes} minutos`,
        consultationGoals:
          formData.consultation_main_goal || formData.consultation_goals || 'Objetivos de prueba',
        meetingUrl: 'https://meet.google.com/demo-test-123',
      };

      console.log('📧 Enviando email de prueba:', emailData);

      // Llamar al método de email correspondiente
      const emailMethod = currentType.emailMethod;
      if (emailService[emailMethod]) {
        await emailService[emailMethod](emailData);

        const newEmail = {
          type: 'Cliente',
          method: emailMethod,
          to: emailData.email,
          timestamp: new Date().toLocaleTimeString('es-ES'),
        };

        setEmailsSent((prev) => [...prev, newEmail]);

        toast({
          title: '✅ Email enviado correctamente',
          description: `Email de ${currentType.label} enviado a ${emailData.email}`,
        });
      } else {
        throw new Error(`Método ${emailMethod} no encontrado en emailService`);
      }

      // Enviar también notificación admin
      console.log('📧 Enviando notificación admin...');

      const adminData = {
        clientName: emailData.name,
        clientEmail: emailData.email,
        phone: formData.telephone || 'No especificado',
        consultationType: currentType.label,
        preferredDate: emailData.scheduledDate,
        preferredTime: emailData.scheduledTime,
        duration: emailData.duration,
        price:
          mockConsultation.duration_minutes === 30
            ? '€75'
            : mockConsultation.duration_minutes === 60
              ? '€150'
              : '€225',
        paymentId: 'DEMO-PAYMENT-123',
        consultationId: mockConsultation.id,
        consultationGoals: emailData.consultationGoals,
        investmentExperience:
          formData.investment_experience || formData.crypto_experience_level || 'No especificado',
        portfolioSize:
          formData.portfolio_value ||
          formData.initial_crypto_capital ||
          formData.crypto_volume ||
          'No especificado',
        currentInvestments:
          formData.current_investments || formData.crypto_assets_exposure || 'No especificado',
        specificQuestions:
          formData.specific_questions || formData.consultation_expectations || 'No especificado',
        preferredCommunication: formData.preferred_communication || 'email',
        additionalInfo:
          formData.additional_notes ||
          formData.pre_consultation_comments ||
          formData.additional_info ||
          'Sin información adicional',
        clientResponses: Object.entries(formData)
          .filter(([key, value]) => value && key !== 'client_name' && key !== 'client_email')
          .reduce((acc, [key, value]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            acc[label] = Array.isArray(value) ? value.join(', ') : value;
            return acc;
          }, {}),
        formDataJson: JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            consultation_id: mockConsultation.id,
            consultation_type: consultationType,
            form_data: formData,
          },
          null,
          2
        ),
        timestamp: new Date().toISOString(),
      };

      const adminResult = await emailService.sendAdminConsultationNotification(adminData);

      if (adminResult.success) {
        const adminEmail = {
          type: 'Admin',
          method: 'sendAdminConsultationNotification',
          to: 'info@bsbcapital.io',
          timestamp: new Date().toLocaleTimeString('es-ES'),
        };

        setEmailsSent((prev) => [...prev, adminEmail]);

        console.log('✅ Email de notificación admin enviado correctamente');
      } else {
        console.error('❌ Error enviando email admin:', adminResult.error);
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      toast({
        variant: 'destructive',
        title: 'Error al enviar email',
        description: error.message || 'Hubo un problema al enviar el email de prueba',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Demo de Formularios Post-Pago
          </h1>
          <p className="text-lg text-gray-600">
            Prueba visual de los formularios de consultoría y envío de emails
          </p>
        </div>

        {/* Selector de tipo de consulta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecciona el tipo de consultoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={consultationType}
              onValueChange={(value) => {
                setConsultationType(value);
                setEmailsSent([]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {consultationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Email que se enviará:</strong> {currentType.emailMethod}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Vista previa del formulario
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Info de la consulta (como en el formulario real) */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Detalles de la Consultoría
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tipo</p>
                      <Badge>{currentType.label}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha</p>
                      <p className="font-medium">
                        {new Date(mockConsultation.scheduled_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duración</p>
                      <p className="font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {mockConsultation.duration_minutes} min
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campos básicos */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b">
                  <div>
                    <label className="text-sm font-medium">Nombre completo *</label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email de contacto *</label>
                    <input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Formulario específico */}
                {getFormComponent()}

                {/* Botón de acción */}
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>⏳ Enviando...</>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email de Prueba
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de emails enviados */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Emails Enviados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emailsSent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No se han enviado emails todavía</p>
                    <p className="text-xs mt-2">Haz clic en "Enviar Email de Prueba"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailsSent.map((email, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          email.type === 'Cliente'
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-purple-50 border-purple-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge
                              variant={email.type === 'Cliente' ? 'default' : 'secondary'}
                              className="mb-1"
                            >
                              {email.type}
                            </Badge>
                            <p className="text-xs font-medium text-gray-900">{email.method}</p>
                            <p className="text-xs text-gray-600 mt-1">Para: {email.to}</p>
                            <p className="text-xs text-gray-500 mt-1">⏰ {email.timestamp}</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Alert className="mt-4">
                  <AlertDescription className="text-xs">
                    💡 Los emails se envían realmente usando el servicio de Resend. Revisa tu
                    bandeja de entrada.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Información adicional */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>ℹ️ Información de la Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📧 Emails que se envían:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✅ Email de confirmación al cliente</li>
                  <li>✅ Email de notificación al admin (info@bsbcapital.io)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔍 Qué se está probando:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>✅ Renderizado de formularios por tipo</li>
                  <li>✅ Campos específicos de cada consulta</li>
                  <li>✅ Envío real de emails de prueba</li>
                  <li>✅ Mapeo correcto de tipos de consulta</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormularioDemo;
