import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailedConsultationForm from '@/components/DetailedConsultationForm.jsx';
import ConsultationDetailsView from '@/components/admin/ConsultationDetailsView.jsx';
import { Eye, FileText, Download, Clock, User, Shield, Calendar } from 'lucide-react';

const ConsultationFormDemo = () => {
  const { toast } = useToast();
  const [selectedDemo, setSelectedDemo] = useState('planificacion');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [demoStep, setDemoStep] = useState('client');

  // Datos de demostración
  const demoConsultations = {
    planificacion: {
      id: 'demo-planificacion',
      consultation_type: 'Planificación financiera',
      scheduled_at: '2025-10-20T10:00:00Z',
      duration_minutes: 60,
      client_name: 'Demo Cliente',
      client_email: 'demo@ejemplo.com',
      status: 'pending_payment',
      description: 'Consultoría de planificación financiera - DEMO'
    },
    carteras: {
      id: 'demo-carteras',
      consultation_type: 'Creación y optimización de carteras',
      scheduled_at: '2025-10-21T15:00:00Z',
      duration_minutes: 60,
      client_name: 'Demo Inversor',
      client_email: 'inversor@ejemplo.com',
      status: 'pending_payment',
      description: 'Optimización de cartera de inversión - DEMO'
    },
    crypto: {
      id: 'demo-crypto',
      consultation_type: 'Crypto/Web3',
      scheduled_at: '2025-10-22T11:00:00Z',
      duration_minutes: 60,
      client_name: 'Demo Crypto',
      client_email: 'crypto@ejemplo.com',
      status: 'pending_payment',
      description: 'Asesoramiento en criptomonedas - DEMO'
    }
  };

  const currentConsultation = demoConsultations[selectedDemo];

  const handleFormSubmit = (data) => {
    const sampleData = {
      ...currentConsultation,
      ...data,
      form_completed_at: new Date().toISOString(),
      status: 'confirmed',
      country: data.country || 'España',
      age_range: data.age_range || '26-35',
      monthly_income_range: data.monthly_income_range || '3000-5000',
      consultation_main_goal: data.consultation_main_goal || 'investment_plan',
      time_horizon: data.time_horizon || 'medium',
      risk_tolerance: data.risk_tolerance || 'medium'
    };
    
    setFormData(sampleData);
    toast({
      title: "¡Formulario demo completado!",
      description: "Ahora puedes ver cómo aparecerían estos datos en el panel de administrador."
    });
  };

  const downloadSamplePDF = () => {
    toast({
      title: "Funcionalidad demo",
      description: "En producción aquí se generaría y descargaría el PDF con las respuestas del cliente."
    });
  };

  const renderClientSelector = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Selecciona el tipo de consultoría para probar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(demoConsultations).map(([key, consultation]) => (
              <div
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedDemo === key
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                }`}
                onClick={() => setSelectedDemo(key)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-brand-text-primary">
                    {consultation.consultation_type}
                  </h3>
                  <Badge variant={selectedDemo === key ? "default" : "secondary"}>
                    {consultation.duration_minutes} min
                  </Badge>
                </div>
                <p className="text-sm text-brand-text-secondary mb-2">
                  {consultation.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(consultation.scheduled_at).toLocaleDateString('es-ES')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {consultation.client_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vista previa: {currentConsultation.consultation_type}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => setShowForm(true)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Probar formulario completo
            </Button>
            <Button variant="outline" onClick={downloadSamplePDF}>
              <Download className="h-4 w-4 mr-2" />
              Ver PDF demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderClientForm = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-text-primary">
                Probando: {currentConsultation.consultation_type}
              </h2>
              <p className="text-brand-text-secondary">
                Completa el formulario como lo haría un cliente real
              </p>
            </div>
            <Button variant="outline" onClick={() => { setShowForm(false); setFormData(null); }}>
              ← Cambiar tipo
            </Button>
          </div>
        </CardContent>
      </Card>

      <DetailedConsultationForm
        consultation={currentConsultation}
        onSubmit={handleFormSubmit}
        loading={false}
      />

      {formData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              ✅ Datos capturados correctamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Formulario completado. Ahora ve a la pestaña "Vista Administrador" para ver cómo aparecen estos datos.
            </p>
            <Button onClick={() => setDemoStep('admin')} className="bg-green-700 hover:bg-green-800">
              <Shield className="h-4 w-4 mr-2" />
              Ver como administrador
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Panel de Administración - Vista del Consultor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Así es como vería el consultor los datos del cliente para preparar la reunión.
          </p>
          
          {formData ? (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Consultoría: {formData.consultation_type}
                </span>
                <Badge variant="outline" className="ml-2">
                  {formData.status}
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                Cliente: {formData.client_name} | 
                Fecha: {new Date(formData.scheduled_at).toLocaleDateString('es-ES')} | 
                Duración: {formData.duration_minutes} min
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800">
                ⚠️ Primero completa el formulario en la pestaña "Vista Cliente" para ver los datos aquí.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {formData ? (
        <Card>
          <CardHeader>
            <CardTitle>📊 Respuestas del Cliente</CardTitle>
            <p className="text-sm text-gray-600">
              Esta información aparecería en el modal del administrador, pestaña "Formulario detallado"
            </p>
          </CardHeader>
          <CardContent>
            <ConsultationDetailsView consultation={formData} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de consultoría
              </h3>
              <p className="text-gray-600 mb-4">
                Completa el formulario en la vista de cliente para ver cómo aparecerían los datos aquí.
              </p>
              <Button onClick={() => setDemoStep('client')}>
                <User className="h-4 w-4 mr-2" />
                Ir a vista cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Demo Formulario Consultoría - BSB Capital</title>
        <meta name="description" content="Demostración del formulario detallado post-pago de consultorías BSB Capital" />
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-text-primary mb-4">
              🧪 Demo: Sistema Completo de Consultoría
            </h1>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              Prueba el flujo completo: desde el formulário del cliente hasta cómo ve los datos el consultor.
            </p>
          </div>

          <Tabs value={demoStep} onValueChange={setDemoStep} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Vista Cliente
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vista Administrador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              {!showForm ? renderClientSelector() : renderClientForm()}
            </TabsContent>

            <TabsContent value="admin">
              {renderAdminView()}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </>
  );
};

export default ConsultationFormDemo;