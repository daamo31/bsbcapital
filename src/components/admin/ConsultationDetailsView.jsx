import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { User, MapPin, Calendar, TrendingUp, Target, PieChart, DollarSign, FileText } from 'lucide-react';

const ConsultationDetailsView = ({ consultation }) => {
  if (!consultation) return null;

  const formatValue = (value, type = 'text') => {
    if (!value) return 'No especificado';
    
    switch (type) {
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'income':
        const incomeRanges = {
          '<1500': 'Menos de 1.500 €',
          '1500-3000': '1.500–3.000 €',
          '3000-5000': '3.000–5.000 €',
          '5000+': 'Más de 5.000 €'
        };
        return incomeRanges[value] || value;
      case 'debt':
        const debtTypes = {
          'none': 'Sin deudas relevantes',
          'consumer': 'Deudas de consumo',
          'mortgage': 'Hipoteca',
          'mixed': 'Deudas mixtas'
        };
        return debtTypes[value] || value;
      case 'horizon':
        const horizons = {
          'short': 'Corto plazo (1–3 años)',
          'medium': 'Medio plazo (3–10 años)',
          'long': 'Largo plazo (+10 años)'
        };
        return horizons[value] || value;
      case 'risk':
        return value.charAt(0).toUpperCase() + value.slice(1);
      default:
        return value;
    }
  };

  const renderPersonalInfo = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">País:</span>
            <p className="mt-1">{formatValue(consultation.country)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Edad:</span>
            <p className="mt-1">{formatValue(consultation.age_range)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <p className="mt-1">{formatValue(consultation.client_email)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Teléfono:</span>
            <p className="mt-1">{formatValue(consultation.client_phone)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFinancialSituation = () => {
    if (!consultation.monthly_income_range && !consultation.savings_percentage && !consultation.has_debts) {
      return null;
    }

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Situación Financiera
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Ingresos mensuales:</span>
              <p className="mt-1">{formatValue(consultation.monthly_income_range, 'income')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">% Ahorro/Inversión:</span>
              <p className="mt-1">{formatValue(consultation.savings_percentage)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Deudas:</span>
              <p className="mt-1">{formatValue(consultation.has_debts, 'debt')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGoalsAndObjectives = () => {
    if (!consultation.consultation_main_goal && !consultation.time_horizon && !consultation.risk_tolerance) {
      return null;
    }

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos y Preferencias
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {consultation.consultation_main_goal && (
              <div>
                <span className="text-sm font-medium text-gray-600">Objetivo principal:</span>
                <p className="mt-1">{formatValue(consultation.consultation_main_goal)}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Horizonte temporal:</span>
                <p className="mt-1">{formatValue(consultation.time_horizon, 'horizon')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Tolerancia al riesgo:</span>
                <Badge variant={consultation.risk_tolerance === 'high' ? 'destructive' : consultation.risk_tolerance === 'medium' ? 'default' : 'secondary'}>
                  {formatValue(consultation.risk_tolerance, 'risk')}
                </Badge>
              </div>
            </div>
            
            {consultation.priorities && consultation.priorities.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Prioridades:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {consultation.priorities.map((priority, index) => (
                    <Badge key={index} variant="outline">
                      {formatValue(priority)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPortfolioInfo = () => {
    if (!consultation.portfolio_value && !consultation.current_distribution && !consultation.main_broker) {
      return null;
    }

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Información de Cartera
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {consultation.portfolio_value && (
              <div>
                <span className="text-sm font-medium text-gray-600">Valor de cartera:</span>
                <p className="mt-1 font-medium">{formatValue(consultation.portfolio_value)}</p>
              </div>
            )}
            
            {consultation.current_distribution && consultation.current_distribution.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600">Distribución actual:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {consultation.current_distribution.map((asset, index) => (
                    <Badge key={index} variant="secondary">
                      {formatValue(asset)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.main_broker && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Broker principal:</span>
                  <p className="mt-1">{formatValue(consultation.main_broker)}</p>
                </div>
              )}
              
              {consultation.investment_experience && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Experiencia:</span>
                  <p className="mt-1">{formatValue(consultation.investment_experience)}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExpectationsAndComments = () => {
    if (!consultation.consultation_expectations && !consultation.pre_consultation_comments && !consultation.specific_challenges) {
      return null;
    }

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Expectativas y Comentarios
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {consultation.consultation_expectations && (
              <div>
                <span className="text-sm font-medium text-gray-600">Expectativas de la consultoría:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{consultation.consultation_expectations}</p>
              </div>
            )}
            
            {consultation.pre_consultation_comments && (
              <div>
                <span className="text-sm font-medium text-gray-600">Comentarios adicionales:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{consultation.pre_consultation_comments}</p>
              </div>
            )}
            
            {consultation.specific_challenges && (
              <div>
                <span className="text-sm font-medium text-gray-600">Retos específicos:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{consultation.specific_challenges}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPostPaymentForm = () => {
    // Extraer información del campo description que ahora contiene los datos del formulario post-pago
    const description = consultation.description || '';
    
    if (!description || consultation.status !== 'confirmed') return null;

    // Parsear la información del description
    const parseDescription = (desc) => {
      const sections = {};
      const lines = desc.split('\n');
      
      lines.forEach(line => {
        if (line.includes('Objetivos:')) sections.goals = line.replace('Objetivos:', '').trim();
        if (line.includes('Inversiones actuales:')) sections.investments = line.replace('Inversiones actuales:', '').trim();
        if (line.includes('Preguntas específicas:')) sections.questions = line.replace('Preguntas específicas:', '').trim();
        if (line.includes('Preferencia de comunicación:')) sections.communication = line.replace('Preferencia de comunicación:', '').trim();
        if (line.includes('Comentarios adicionales:')) sections.comments = line.replace('Comentarios adicionales:', '').trim();
      });
      
      return sections;
    };

    const formData = parseDescription(description);

    // Solo mostrar si hay datos del formulario
    if (!formData.goals && !formData.investments && !formData.questions) return null;

    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Formulario Post-Pago Completado
          </CardTitle>
          <CardDescription>
            Información adicional proporcionada por el cliente después del pago
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {formData.goals && (
              <div>
                <span className="text-sm font-medium text-gray-600">Objetivos de la consultoría:</span>
                <p className="mt-1 p-3 bg-green-50 rounded-md border border-green-200">{formData.goals}</p>
              </div>
            )}
            {formData.investments && (
              <div>
                <span className="text-sm font-medium text-gray-600">Inversiones actuales:</span>
                <p className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">{formData.investments}</p>
              </div>
            )}
            {formData.questions && (
              <div>
                <span className="text-sm font-medium text-gray-600">Preguntas específicas:</span>
                <p className="mt-1 p-3 bg-yellow-50 rounded-md border border-yellow-200">{formData.questions}</p>
              </div>
            )}
            {formData.communication && (
              <div>
                <span className="text-sm font-medium text-gray-600">Preferencia de comunicación:</span>
                <p className="mt-1">{formData.communication}</p>
              </div>
            )}
            {formData.comments && (
              <div>
                <span className="text-sm font-medium text-gray-600">Comentarios adicionales:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{formData.comments}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMetadata = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Información de la Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Tipo:</span>
            <p className="mt-1">{formatValue(consultation.consultation_type)}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Estado:</span>
            <Badge variant={consultation.status === 'confirmed' ? 'default' : 'secondary'}>
              {formatValue(consultation.status)}
            </Badge>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Duración:</span>
            <p className="mt-1">{consultation.duration_minutes} minutos</p>
          </div>
          {consultation.form_completed_at && (
            <div>
              <span className="text-sm font-medium text-gray-600">Formulario completado:</span>
              <p className="mt-1">{new Date(consultation.form_completed_at).toLocaleDateString('es-ES')}</p>
            </div>
          )}
          {consultation.wants_follow_up && (
            <div>
              <span className="text-sm font-medium text-gray-600">Seguimiento:</span>
              <p className="mt-1">{formatValue(consultation.follow_up_frequency)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {renderPersonalInfo()}
      {renderFinancialSituation()}
      {renderGoalsAndObjectives()}
      {renderPortfolioInfo()}
      {renderExpectationsAndComments()}
      {renderPostPaymentForm()}
      {renderMetadata()}
    </div>
  );
};

export default ConsultationDetailsView;