import React from 'react';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';
import { Checkbox } from '@/components/ui/forms/checkbox';

const FinancialPlanningForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value, isChecked) => {
    const current = formData[field] || [];
    if (isChecked) {
      handleChange(field, [...current, value]);
    } else {
      handleChange(field, current.filter(item => item !== value));
    }
  };

  return (
    <div className="space-y-8">
      {/* 🔹 Datos personales y de contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Datos personales y de contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">País de residencia *</Label>
            <Input
              id="country"
              value={formData.country || ''}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Ej: España"
            />
          </div>
          
          <div>
            <Label htmlFor="age_range">Edad o rango de edad</Label>
            <Select value={formData.age_range || ''} onValueChange={(value) => handleChange('age_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu rango de edad" />
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
      </div>

      {/* 🔹 Situación actual */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Situación actual</h3>
        
        <div>
          <Label htmlFor="monthly_income_range">Rango de ingresos mensuales netos *</Label>
          <Select value={formData.monthly_income_range || ''} onValueChange={(value) => handleChange('monthly_income_range', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu rango de ingresos" />
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
          <Label htmlFor="savings_percentage">Porcentaje que destinas actualmente a ahorro/inversión *</Label>
          <Select value={formData.savings_percentage || ''} onValueChange={(value) => handleChange('savings_percentage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el porcentaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<5">Menos del 5%</SelectItem>
              <SelectItem value="5-10">5–10%</SelectItem>
              <SelectItem value="10-20">10–20%</SelectItem>
              <SelectItem value="20+">Más de 20%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="has_debts">¿Tienes deudas relevantes? *</Label>
          <Select value={formData.has_debts || ''} onValueChange={(value) => handleChange('has_debts', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="consumer">Sí, de consumo</SelectItem>
              <SelectItem value="mortgage">Sí, hipoteca</SelectItem>
              <SelectItem value="mixed">Sí, mixtas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔹 Objetivos financieros */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Objetivos financieros</h3>
        
        <div>
          <Label htmlFor="consultation_main_goal">Principal objetivo de la consultoría *</Label>
          <Select value={formData.consultation_main_goal || ''} onValueChange={(value) => handleChange('consultation_main_goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organize_finances">Ordenar mis finanzas y mejorar mi capacidad de ahorro</SelectItem>
              <SelectItem value="investment_plan">Definir un plan de inversión</SelectItem>
              <SelectItem value="tax_optimization">Optimizar mi situación fiscal</SelectItem>
              <SelectItem value="milestone_planning">Preparar un hito (compra vivienda, boda, hijos...)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="time_horizon">Horizonte temporal de tus metas *</Label>
          <Select value={formData.time_horizon || ''} onValueChange={(value) => handleChange('time_horizon', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el horizonte temporal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Corto plazo (1–3 años)</SelectItem>
              <SelectItem value="medium">Medio plazo (3–10 años)</SelectItem>
              <SelectItem value="long">Largo plazo (+10 años)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="risk_tolerance">Tolerancia al riesgo *</Label>
          <Select value={formData.risk_tolerance || ''} onValueChange={(value) => handleChange('risk_tolerance', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu tolerancia al riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Prioridades (puedes marcar varias)</Label>
          <div className="space-y-2 mt-2">
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
                  checked={formData.priorities?.includes(priority.value) || false}
                  onCheckedChange={(checked) => handleCheckboxChange('priorities', priority.value, checked)}
                />
                <Label htmlFor={priority.value} className="text-sm font-normal">
                  {priority.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔹 Perspectiva personal */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Perspectiva personal</h3>
        
        <div>
          <Label htmlFor="pre_consultation_comments">¿Quieres comentarnos algo antes de la consultoría?</Label>
          <Textarea
            id="pre_consultation_comments"
            value={formData.pre_consultation_comments || ''}
            onChange={(e) => handleChange('pre_consultation_comments', e.target.value)}
            placeholder="Comparte cualquier información relevante para personalizar tu consulta..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="previous_advisor_experience">¿Has trabajado antes con un asesor financiero o invertido por tu cuenta?</Label>
          <Select value={formData.previous_advisor_experience || ''} onValueChange={(value) => handleChange('previous_advisor_experience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="unclear_results">Sí, pero sin resultados claros</SelectItem>
              <SelectItem value="active">Sí, de forma activa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FinancialPlanningForm;