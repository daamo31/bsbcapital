import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DetailedConsultationForm = ({ consultation, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    // Datos personales
    country: '',
    age_range: '',
    
    // Situación actual (Planificación)
    monthly_income_range: '',
    savings_percentage: '',
    has_debts: '',
    
    // Objetivos
    consultation_main_goal: '',
    time_horizon: '',
    risk_tolerance: '',
    priorities: [],
    
    // Cartera (Optimización)
    portfolio_value: '',
    current_distribution: [],
    main_broker: '',
    investment_experience: '',
    portfolio_satisfaction: '',
    average_returns: '',
    
    // Crypto
    crypto_experience_level: '',
    crypto_knowledge_level: '',
    initial_crypto_capital: '',
    crypto_portfolio_value: '',
    crypto_strategy: '',
    
    // Crypto avanzado
    profile_type: '',
    advisor_crypto_experience: '',
    company_type: '',
    organization_crypto_status: '',
    
    // Expectativas
    crypto_interest_motivation: '',
    consultation_expectations: '',
    specific_challenges: '',
    preferred_liquidity: '',
    investment_restrictions: '',
    wants_follow_up: false,
    follow_up_frequency: '',
    pre_consultation_comments: '',
    previous_advisor_experience: ''
  });

  const getConsultationType = () => {
    if (!consultation?.consultation_type) return 'planificacion';
    
    const type = consultation.consultation_type.toLowerCase();
    if (type.includes('planificación') || type.includes('planificacion')) return 'planificacion';
    if (type.includes('cartera') || type.includes('optimización')) return 'carteras';
    if (type.includes('crypto') || type.includes('web3')) {
      // Determinar si es básico o avanzado basado en el precio o duración
      return consultation.duration_minutes > 30 ? 'crypto_avanzado' : 'crypto_basico';
    }
    return 'planificacion';
  };

  const consultationType = getConsultationType();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderPersonalData = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔹 Datos personales y de contacto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País de residencia</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="España"
            />
          </div>
          <div>
            <Label>Edad o rango de edad (opcional)</Label>
            <Select value={formData.age_range} onValueChange={(value) => handleInputChange('age_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-25">18–25</SelectItem>
                <SelectItem value="26-35">26–35</SelectItem>
                <SelectItem value="36-45">36–45</SelectItem>
                <SelectItem value="46-60">46–60</SelectItem>
                <SelectItem value="+60">+60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPlanificacionFields = () => (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔹 Situación financiera actual</CardTitle>
          <CardDescription>Información sobre tus ingresos, ahorros y deudas (opcional pero recomendado)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Rango de ingresos mensuales netos</Label>
            <Select value={formData.monthly_income_range} onValueChange={(value) => handleInputChange('monthly_income_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona rango (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<1500">Menos de 1.500 €</SelectItem>
                <SelectItem value="1500-3000">1.500–3.000 €</SelectItem>
                <SelectItem value="3000-5000">3.000–5.000 €</SelectItem>
                <SelectItem value="5000+">Más de 5.000 €</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Porcentaje que destinas actualmente a ahorro/inversión</Label>
            <Select value={formData.savings_percentage} onValueChange={(value) => handleInputChange('savings_percentage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona porcentaje" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<5%">Menos del 5%</SelectItem>
                <SelectItem value="5-10%">5–10%</SelectItem>
                <SelectItem value="10-20%">10–20%</SelectItem>
                <SelectItem value=">20%">Más de 20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>¿Tienes deudas relevantes?</Label>
            <Select value={formData.has_debts} onValueChange={(value) => handleInputChange('has_debts', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No</SelectItem>
                <SelectItem value="consumer">Sí, de consumo</SelectItem>
                <SelectItem value="mortgage">Sí, hipoteca</SelectItem>
                <SelectItem value="mixed">Sí, mixtas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔹 Objetivos financieros</CardTitle>
          <CardDescription>¿Qué te gustaría conseguir con el asesoramiento?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>¿Cuál es tu principal objetivo con esta consultoría?</Label>
            <Select value={formData.consultation_main_goal} onValueChange={(value) => handleInputChange('consultation_main_goal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu objetivo principal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organize_finances">Ordenar mis finanzas y mejorar mi capacidad de ahorro</SelectItem>
                <SelectItem value="investment_plan">Definir un plan de inversión desde cero</SelectItem>
                <SelectItem value="optimize_portfolio">Optimizar mi cartera de inversión actual</SelectItem>
                <SelectItem value="crypto_learning">Aprender sobre criptomonedas e inversión crypto</SelectItem>
                <SelectItem value="crypto_strategy">Mejorar mi estrategia de inversión en crypto</SelectItem>
                <SelectItem value="tax_optimization">Optimizar mi situación fiscal</SelectItem>
                <SelectItem value="milestone_preparation">Preparar un hito (compra vivienda, boda, hijos...)</SelectItem>
                <SelectItem value="general_advice">Asesoramiento financiero general</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Horizonte temporal de tus metas</Label>
              <Select value={formData.time_horizon} onValueChange={(value) => handleInputChange('time_horizon', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona horizonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Corto plazo (1–3 años)</SelectItem>
                  <SelectItem value="medium">Medio plazo (3–10 años)</SelectItem>
                  <SelectItem value="long">Largo plazo (+10 años)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tolerancia al riesgo</Label>
              <Select value={formData.risk_tolerance} onValueChange={(value) => handleInputChange('risk_tolerance', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tolerancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Prioridades (puedes marcar varias)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {[
                { value: 'emergency_fund', label: 'Crear un fondo de emergencia' },
                { value: 'periodic_investment', label: 'Invertir de forma periódica' },
                { value: 'insurance', label: 'Protección / seguros' },
                { value: 'tax_optimization', label: 'Optimización fiscal' },
                { value: 'diversification', label: 'Diversificación de activos' }
              ].map((priority) => (
                <div key={priority.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={priority.value}
                    checked={formData.priorities.includes(priority.value)}
                    onCheckedChange={(checked) => handleArrayChange('priorities', priority.value, checked)}
                  />
                  <Label htmlFor={priority.value} className="text-sm">{priority.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderCarterasFields = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🔹 Cartera actual</CardTitle>
        <CardDescription>Si ya inviertes, cuéntanos sobre tu cartera actual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Valor aproximado de tu cartera de inversión</Label>
          <Select value={formData.portfolio_value} onValueChange={(value) => handleInputChange('portfolio_value', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona rango (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tengo cartera de inversión</SelectItem>
              <SelectItem value="<5000">&lt; 5.000 €</SelectItem>
              <SelectItem value="5000-20000">5.000–20.000 €</SelectItem>
              <SelectItem value="20000-100000">20.000–100.000 €</SelectItem>
              <SelectItem value="100000-500000">100.000–500.000 €</SelectItem>
              <SelectItem value="500000+">500.000+ €</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Distribución actual (puedes marcar varias)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { value: 'stocks', label: 'Acciones' },
              { value: 'etfs', label: 'ETFs / fondos indexados' },
              { value: 'bonds', label: 'Bonos / renta fija' },
              { value: 'real_estate', label: 'Inmobiliario' },
              { value: 'crypto', label: 'Criptoactivos' },
              { value: 'others', label: 'Otros' }
            ].map((asset) => (
              <div key={asset.value} className="flex items-center space-x-2">
                <Checkbox
                  id={asset.value}
                  checked={formData.current_distribution.includes(asset.value)}
                  onCheckedChange={(checked) => handleArrayChange('current_distribution', asset.value, checked)}
                />
                <Label htmlFor={asset.value} className="text-sm">{asset.label}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="main_broker">Plataforma o broker principal</Label>
          <Input
            id="main_broker"
            value={formData.main_broker}
            onChange={(e) => handleInputChange('main_broker', e.target.value)}
            placeholder="eToro, Interactive Brokers, etc. (opcional)"
          />
        </div>

        <div>
          <Label>¿Desde hace cuánto inviertes activamente?</Label>
          <Select value={formData.investment_experience} onValueChange={(value) => handleInputChange('investment_experience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona experiencia (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No invierto actualmente</SelectItem>
              <SelectItem value="<1year">Menos de 1 año</SelectItem>
              <SelectItem value="1-3years">1–3 años</SelectItem>
              <SelectItem value="3+years">Más de 3 años</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderCryptoFields = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🔹 Criptomonedas y Web3</CardTitle>
        <CardDescription>Tu conocimiento y experiencia en el mundo crypto</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>¿Has invertido antes en criptomonedas?</Label>
          <Select value={formData.crypto_experience_level} onValueChange={(value) => handleInputChange('crypto_experience_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No, sería mi primera vez</SelectItem>
              <SelectItem value="punctual">Sí, pero de forma muy puntual</SelectItem>
              <SelectItem value="learning">Sí, pero quiero aprender a hacerlo bien</SelectItem>
              <SelectItem value="active">Sí, invierto de forma activa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>¿Qué nivel de conocimiento crees tener sobre el mundo cripto?</Label>
          <Select value={formData.crypto_knowledge_level} onValueChange={(value) => handleInputChange('crypto_knowledge_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_low">Muy bajo (no sé por dónde empezar)</SelectItem>
              <SelectItem value="basic">Básico (entiendo lo esencial pero me faltan pasos prácticos)</SelectItem>
              <SelectItem value="medium">Medio (ya he invertido y quiero mejorar mi estrategia)</SelectItem>
              <SelectItem value="advanced">Avanzado (busco estrategias más sofisticadas)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Capital inicial estimado que te gustaría destinar a cripto</Label>
          <Select value={formData.initial_crypto_capital} onValueChange={(value) => handleInputChange('initial_crypto_capital', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona rango (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No estoy interesado en crypto</SelectItem>
              <SelectItem value="<1000">&lt; 1.000 €</SelectItem>
              <SelectItem value="1000-5000">1.000–5.000 €</SelectItem>
              <SelectItem value="5000-20000">5.000–20.000 €</SelectItem>
              <SelectItem value="20000+">20.000+ €</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="crypto_interest_motivation">¿Qué te ha despertado interés por el mundo cripto?</Label>
          <Textarea
            id="crypto_interest_motivation"
            value={formData.crypto_interest_motivation}
            onChange={(e) => handleInputChange('crypto_interest_motivation', e.target.value)}
            placeholder="Ej: rentabilidad, independencia financiera, curiosidad tecnológica... (opcional)"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderFinalComments = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🔹 Información adicional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="consultation_expectations">¿Qué resultado concreto esperas obtener de esta consultoría?</Label>
          <Textarea
            id="consultation_expectations"
            value={formData.consultation_expectations}
            onChange={(e) => handleInputChange('consultation_expectations', e.target.value)}
            placeholder="Describe qué te gustaría conseguir con esta sesión..."
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="pre_consultation_comments">¿Quieres comentarnos algo antes de la consultoría?</Label>
          <Textarea
            id="pre_consultation_comments"
            value={formData.pre_consultation_comments}
            onChange={(e) => handleInputChange('pre_consultation_comments', e.target.value)}
            placeholder="Cualquier información adicional que consideres relevante..."
            rows={3}
          />
        </div>
        
        <div>
          <Label>¿Has trabajado antes con un asesor financiero o invertido por tu cuenta?</Label>
          <Select value={formData.previous_advisor_experience} onValueChange={(value) => handleInputChange('previous_advisor_experience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No</SelectItem>
              <SelectItem value="unclear_results">Sí, pero sin resultados claros</SelectItem>
              <SelectItem value="active">Sí, de forma activa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="wants_follow_up"
            checked={formData.wants_follow_up}
            onCheckedChange={(checked) => handleInputChange('wants_follow_up', checked)}
          />
          <Label htmlFor="wants_follow_up">¿Te gustaría recibir seguimiento después de la consultoría?</Label>
        </div>
        
        {formData.wants_follow_up && (
          <div>
            <Label>Frecuencia preferida de seguimiento</Label>
            <Select value={formData.follow_up_frequency} onValueChange={(value) => handleInputChange('follow_up_frequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona frecuencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensualmente</SelectItem>
                <SelectItem value="quarterly">Trimestralmente</SelectItem>
                <SelectItem value="none">Solo esta sesión</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full min-h-screen overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text-primary mb-2">
            Formulario Completo de Consultoría
          </h2>
          <p className="text-sm sm:text-base text-brand-text-secondary">
            Comparte tu situación financiera actual para recibir el mejor asesoramiento personalizado. 
            Completa solo las secciones que sean relevantes para ti.
          </p>
        </div>

        {renderPersonalData()}
        {renderPlanificacionFields()}
        {renderCarterasFields()}
        {renderCryptoFields()}
        {renderFinalComments()}

        {/* Botón de envío con espacio extra en móvil */}
        <div className="flex justify-end pt-6 pb-20 sm:pb-6">
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-8 py-3 text-base"
            size="lg"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Completar formulario
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DetailedConsultationForm;