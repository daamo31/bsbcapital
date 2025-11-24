import React from 'react';
import { Label } from '@/components/ui/forms/label';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms/select';

const TreasuryEnterpriseForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Encabezado del formulario */}
      <div className="text-center bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Formulario previo – Gestión de tesorería cripto para empresas</h2>
        <p className="text-gray-700">
          Antes de la primera consultoría, necesitamos entender mejor tu empresa y cómo utilizáis (o queréis utilizar) cripto en vuestra tesorería.
        </p>
      </div>

      {/* 🏢 Datos de la empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🏢 Datos de la empresa</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="company_name">1. Nombre de la empresa *</Label>
            <Input
              id="company_name"
              value={formData.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Nombre completo de la empresa"
            />
          </div>
          
          <div>
            <Label htmlFor="company_country">2. País de constitución *</Label>
            <Input
              id="company_country"
              value={formData.company_country || ''}
              onChange={(e) => handleChange('company_country', e.target.value)}
              placeholder="País donde está constituida la empresa"
            />
          </div>

          <div>
            <Label htmlFor="company_website">3. Web / LinkedIn de la empresa (opcional)</Label>
            <Input
              id="company_website"
              type="url"
              value={formData.company_website || ''}
              onChange={(e) => handleChange('company_website', e.target.value)}
              placeholder="https://empresa.com o LinkedIn de la empresa"
            />
          </div>

          <div>
            <Label htmlFor="contact_person">4. Persona de contacto (nombre, cargo, email o teléfono) *</Label>
            <Input
              id="contact_person"
              value={formData.contact_person || ''}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              placeholder="Nombre completo - Cargo - email@empresa.com - teléfono"
            />
          </div>
        </div>
      </div>

      {/* 💰 Situación actual con cripto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">💰 Situación actual con cripto</h3>
        
        <div>
          <Label htmlFor="crypto_usage">5. ¿Actualmente vuestra empresa utiliza cripto en su tesorería? *</Label>
          <Select value={formData.crypto_usage || ''} onValueChange={(value) => handleChange('crypto_usage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Sí, de forma activa</SelectItem>
              <SelectItem value="occasional">Sí, pero de forma puntual</SelectItem>
              <SelectItem value="starting">No, queremos empezar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="crypto_volume">6. Volumen aproximado de criptoactivos bajo gestión: *</Label>
          <Select value={formData.crypto_volume || ''} onValueChange={(value) => handleChange('crypto_volume', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under50k">&lt; 50.000 €</SelectItem>
              <SelectItem value="50k-250k">50.000 – 250.000 €</SelectItem>
              <SelectItem value="250k-1M">250.000 – 1M €</SelectItem>
              <SelectItem value="over1M">&gt; 1M €</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="crypto_assets_exposure">7. ¿En qué tipo de activos está principalmente vuestra exposición?</Label>
          <Textarea
            id="crypto_assets_exposure"
            value={formData.crypto_assets_exposure || ''}
            onChange={(e) => handleChange('crypto_assets_exposure', e.target.value)}
            placeholder="Ejemplo: stablecoins, BTC/ETH, altcoins, DeFi, etc."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="crypto_storage_location">8. ¿Dónde están actualmente esos fondos?</Label>
          <Textarea
            id="crypto_storage_location"
            value={formData.crypto_storage_location || ''}
            onChange={(e) => handleChange('crypto_storage_location', e.target.value)}
            placeholder="Ejemplo: exchanges principales, tipo de wallets, protocolos DeFi, etc."
            rows={2}
          />
        </div>
      </div>

      {/* 🎯 Objetivos y perfil de riesgo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">🎯 Objetivos y perfil de riesgo</h3>
        
        <div>
          <Label htmlFor="main_treasury_goal">9. ¿Cuál es vuestro objetivo principal con la tesorería cripto? *</Label>
          <Select value={formData.main_treasury_goal || ''} onValueChange={(value) => handleChange('main_treasury_goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preserve_capital">Preservar capital</SelectItem>
              <SelectItem value="generate_yield">Generar rentabilidad extra</SelectItem>
              <SelectItem value="diversify_inflation">Diversificar frente a fiat / inflación</SelectItem>
              <SelectItem value="optimize_payments">Optimizar pagos / cobros en cripto</SelectItem>
              <SelectItem value="other">Otro (especificar en el campo siguiente)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="risk_profile">10. ¿Cómo definirías el perfil de riesgo de la empresa respecto a cripto? *</Label>
          <Select value={formData.risk_profile || ''} onValueChange={(value) => handleChange('risk_profile', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el perfil de riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservador</SelectItem>
              <SelectItem value="moderate">Moderado</SelectItem>
              <SelectItem value="aggressive">Agresivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="twelve_month_vision">11. En una frase: ¿qué te gustaría haber conseguido con la tesorería cripto dentro de 12 meses? *</Label>
          <Textarea
            id="twelve_month_vision"
            value={formData.twelve_month_vision || ''}
            onChange={(e) => handleChange('twelve_month_vision', e.target.value)}
            placeholder="Describe brevemente tu visión a 12 meses..."
            rows={3}
          />
        </div>
      </div>

      {/* ⚖️ Procesos, control y compliance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">⚖️ Procesos, control y compliance</h3>
        
        <div>
          <Label htmlFor="internal_controls">12. ¿Tenéis algún sistema de control interno para la tesorería cripto?</Label>
          <Textarea
            id="internal_controls"
            value={formData.internal_controls || ''}
            onChange={(e) => handleChange('internal_controls', e.target.value)}
            placeholder="Respuesta breve: multisig, límites, políticas internas, etc."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="legal_advice">13. ¿Contáis actualmente con asesoramiento legal/fiscal específico en cripto? *</Label>
          <Select value={formData.legal_advice || ''} onValueChange={(value) => handleChange('legal_advice', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Sí</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="operation_records">14. ¿Lleváis un registro de las operaciones en cripto (movimientos, PnL, valoraciones)? *</Label>
          <Select value={formData.operation_records || ''} onValueChange={(value) => handleChange('operation_records', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="structured">Sí, de forma estructurada</SelectItem>
              <SelectItem value="partially">Parcialmente</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 📈 Expectativas de la consultoría */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">📈 Expectativas de la consultoría</h3>
        
        <div>
          <Label htmlFor="consultation_expectations">15. ¿Qué os gustaría obtener de estas consultorías y del seguimiento mensual? *</Label>
          <Textarea
            id="consultation_expectations"
            value={formData.consultation_expectations || ''}
            onChange={(e) => handleChange('consultation_expectations', e.target.value)}
            placeholder="Describe tus expectativas sobre las consultorías..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="additional_info">16. ¿Hay algo importante que debamos saber antes de la primera sesión?</Label>
          <Textarea
            id="additional_info"
            value={formData.additional_info || ''}
            onChange={(e) => handleChange('additional_info', e.target.value)}
            placeholder="Cualquier información adicional relevante..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default TreasuryEnterpriseForm;