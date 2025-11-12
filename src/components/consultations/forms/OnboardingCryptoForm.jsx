import React from 'react';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';

const OnboardingCryptoForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

        <div>
          <Label htmlFor="telephone">Teléfono de contacto</Label>
          <Input
            id="telephone"
            type="tel"
            value={formData.telephone || ''}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="Ej: +34 600 123 456"
          />
        </div>
      </div>

      {/* 🔹 Conocimiento y experiencia actual */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Conocimiento y experiencia actual</h3>
        
        <div>
          <Label htmlFor="crypto_experience_level">¿Has invertido antes en criptomonedas? *</Label>
          <Select value={formData.crypto_experience_level || ''} onValueChange={(value) => handleChange('crypto_experience_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu experiencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No, sería mi primera vez</SelectItem>
              <SelectItem value="occasional">Sí, pero de forma muy puntual</SelectItem>
              <SelectItem value="learning">Sí, pero quiero aprender a hacerlo bien</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="crypto_knowledge_level">¿Qué nivel de conocimiento crees tener sobre el mundo cripto? *</Label>
          <Select value={formData.crypto_knowledge_level || ''} onValueChange={(value) => handleChange('crypto_knowledge_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu nivel de conocimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_low">Muy bajo (no sé por dónde empezar)</SelectItem>
              <SelectItem value="basic">Básico (entiendo lo esencial pero me faltan pasos prácticos)</SelectItem>
              <SelectItem value="medium">Medio (ya he invertido y quiero mejorar mi estrategia)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="initial_crypto_capital">Capital inicial estimado que te gustaría destinar a cripto *</Label>
          <Select value={formData.initial_crypto_capital || ''} onValueChange={(value) => handleChange('initial_crypto_capital', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el capital inicial" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under1000">"0 - 1.000 €"</SelectItem>
              <SelectItem value="1000-5000">1.000–5.000 €</SelectItem>
              <SelectItem value="5000-20000">5.000–20.000 €</SelectItem>
              <SelectItem value="20000+">20.000 € o más</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔹 Objetivos personales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Objetivos personales</h3>
        
        <div>
          <Label htmlFor="consultation_main_goal">¿Qué te gustaría conseguir con esta consultoría? *</Label>
          <Select value={formData.consultation_main_goal || ''} onValueChange={(value) => handleChange('consultation_main_goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="understand_crypto">Entender cómo funcionan las criptomonedas</SelectItem>
              <SelectItem value="learn_investment">Aprender a invertir desde cero</SelectItem>
              <SelectItem value="protection">Saber cómo proteger mis inversiones</SelectItem>
              <SelectItem value="strategy">Preparar una estrategia de entrada a medio plazo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="time_horizon">Horizonte temporal de tus objetivos *</Label>
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
              <SelectItem value="low">Baja (prefiero aprender sin asumir grandes riesgos)</SelectItem>
              <SelectItem value="medium">Media (acepto algo de volatilidad si hay potencial)</SelectItem>
              <SelectItem value="high">Alta (quiero explorar oportunidades más agresivas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔹 Expectativas y motivaciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🔹 Expectativas y motivaciones</h3>
        
        <div>
          <Label htmlFor="crypto_interest_motivation">¿Qué te ha despertado interés por el mundo cripto?</Label>
          <Textarea
            id="crypto_interest_motivation"
            value={formData.crypto_interest_motivation || ''}
            onChange={(e) => handleChange('crypto_interest_motivation', e.target.value)}
            placeholder="Ej: rentabilidad, independencia financiera, curiosidad tecnológica..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="consultation_expectations">¿Qué te gustaría poder hacer al terminar la consultoría?</Label>
          <Textarea
            id="consultation_expectations"
            value={formData.consultation_expectations || ''}
            onChange={(e) => handleChange('consultation_expectations', e.target.value)}
            placeholder="Ej: comprar mis primeros activos, tener una estrategia clara, sentirme seguro operando..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingCryptoForm;