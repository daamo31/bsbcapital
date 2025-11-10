import React from 'react';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';

const GenericConsultationForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Campos básicos para cualquier tipo de consulta */}
      <div>
        <Label htmlFor="consultation_main_goal">Objetivos de la Consultoría *</Label>
        <Textarea
          id="consultation_main_goal"
          value={formData.consultation_main_goal || ''}
          onChange={(e) => handleChange('consultation_main_goal', e.target.value)}
          placeholder="Describe qué esperas conseguir con esta consultoría..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div>
        <Label htmlFor="investment_experience">Experiencia en inversiones</Label>
        <Select value={formData.investment_experience || ''} onValueChange={(value) => handleChange('investment_experience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu nivel de experiencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Principiante</SelectItem>
            <SelectItem value="intermediate">Intermedio</SelectItem>
            <SelectItem value="advanced">Avanzado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="portfolio_value">Tamaño aproximado de cartera</Label>
        <Select value={formData.portfolio_value || ''} onValueChange={(value) => handleChange('portfolio_value', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tamaño de tu cartera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under5k">{"< 5.000 €"}</SelectItem>
            <SelectItem value="5k-20k">5.000 - 20.000 €</SelectItem>
            <SelectItem value="20k-50k">20.000 - 50.000 €</SelectItem>
            <SelectItem value="50k-100k">50.000 - 100.000 €</SelectItem>
            <SelectItem value="100k-500k">100.000 - 500.000 €</SelectItem>
            <SelectItem value="over500k">{"> 500.000 €"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="consultation_expectations">Preguntas específicas</Label>
        <Textarea
          id="consultation_expectations"
          value={formData.consultation_expectations || ''}
          onChange={(e) => handleChange('consultation_expectations', e.target.value)}
          placeholder="¿Hay algo específico que te gustaría abordar durante la consulta?"
          rows={3}
          className="resize-none"
        />
      </div>

      <div>
        <Label htmlFor="preferred_communication">Preferencia de comunicación</Label>
        <Select value={formData.preferred_communication || 'email'} onValueChange={(value) => handleChange('preferred_communication', value)}>
          <SelectTrigger>
            <SelectValue placeholder="¿Cómo prefieres que te contactemos?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Teléfono</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="pre_consultation_comments">Comentarios adicionales</Label>
        <Textarea
          id="pre_consultation_comments"
          value={formData.pre_consultation_comments || ''}
          onChange={(e) => handleChange('pre_consultation_comments', e.target.value)}
          placeholder="Cualquier información adicional que consideres relevante..."
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default GenericConsultationForm;