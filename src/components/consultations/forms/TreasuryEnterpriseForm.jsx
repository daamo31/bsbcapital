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
      {/* 🏢 Datos de la empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🏢 Datos de la empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_name">Nombre de la empresa *</Label>
            <Input
              id="company_name"
              value={formData.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Ej: BSB Capital Partners S.L."
            />
          </div>
          
          <div>
            <Label htmlFor="company_country">País de residencia fiscal *</Label>
            <Input
              id="company_country"
              value={formData.company_country || ''}
              onChange={(e) => handleChange('company_country', e.target.value)}
              placeholder="Ej: España"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company_website">Sitio web de la empresa</Label>
            <Input
              id="company_website"
              type="url"
              value={formData.company_website || ''}
              onChange={(e) => handleChange('company_website', e.target.value)}
              placeholder="Ej: https://empresa.com"
            />
          </div>

          <div>
            <Label htmlFor="contact_person">Persona de contacto principal *</Label>
            <Input
              id="contact_person"
              value={formData.contact_person || ''}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              placeholder="Ej: Juan Pérez - Director Financiero"
            />
          </div>
        </div>
      </div>

      {/* 💰 Situación actual con criptomonedas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">💰 Situación actual con criptomonedas</h3>
        
        <div>
          <Label htmlFor="crypto_usage">¿Cómo utiliza actualmente la empresa las criptomonedas? *</Label>
          <Select value={formData.crypto_usage || ''} onValueChange={(value) => handleChange('crypto_usage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el uso actual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No utilizamos criptomonedas</SelectItem>
              <SelectItem value="treasury">Como reserva de tesorería</SelectItem>
              <SelectItem value="payments">Para pagos internacionales</SelectItem>
              <SelectItem value="investment">Como inversión especulativa</SelectItem>
              <SelectItem value="multiple">Múltiples usos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="monthly_crypto_volume">Volumen mensual aproximado en operaciones crypto *</Label>
          <Select value={formData.monthly_crypto_volume || ''} onValueChange={(value) => handleChange('monthly_crypto_volume', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el volumen mensual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tenemos operaciones</SelectItem>
              <SelectItem value="under10k">Menos de 10.000€</SelectItem>
              <SelectItem value="10k-50k">10.000€ - 50.000€</SelectItem>
              <SelectItem value="50k-200k">50.000€ - 200.000€</SelectItem>
              <SelectItem value="200k-1M">200.000€ - 1.000.000€</SelectItem>
              <SelectItem value="over1M">Más de 1.000.000€</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="crypto_assets_held">Tipos de activos crypto que mantiene la empresa</Label>
          <Textarea
            id="crypto_assets_held"
            value={formData.crypto_assets_held || ''}
            onChange={(e) => handleChange('crypto_assets_held', e.target.value)}
            placeholder="Ej: Bitcoin, Ethereum, USDC, Tether... (indicar aproximadamente qué % de cada uno)"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="crypto_storage_location">¿Dónde almacena actualmente los activos crypto? *</Label>
          <Select value={formData.crypto_storage_location || ''} onValueChange={(value) => handleChange('crypto_storage_location', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el método de almacenamiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_assets">No tenemos activos</SelectItem>
              <SelectItem value="exchange_only">Solo en exchanges</SelectItem>
              <SelectItem value="cold_wallet">En cold wallets</SelectItem>
              <SelectItem value="mixed">Combinación de exchanges y wallets</SelectItem>
              <SelectItem value="custody">Servicio de custodia institucional</SelectItem>
              <SelectItem value="unsure">No estamos seguros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🎯 Objetivos empresariales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">🎯 Objetivos empresariales</h3>
        
        <div>
          <Label htmlFor="main_treasury_goal">Objetivo principal para la gestión de tesorería cripto *</Label>
          <Select value={formData.main_treasury_goal || ''} onValueChange={(value) => handleChange('main_treasury_goal', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el objetivo principal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diversification">Diversificar reservas de tesorería</SelectItem>
              <SelectItem value="payment_efficiency">Mejorar eficiencia en pagos</SelectItem>
              <SelectItem value="hedge_inflation">Protección contra inflación</SelectItem>
              <SelectItem value="yield_generation">Generar rendimientos adicionales</SelectItem>
              <SelectItem value="market_expansion">Expansión a nuevos mercados</SelectItem>
              <SelectItem value="regulatory_compliance">Cumplimiento normativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="risk_profile">Perfil de riesgo de la empresa *</Label>
          <Select value={formData.risk_profile || ''} onValueChange={(value) => handleChange('risk_profile', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el perfil de riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservador (prioridad en estabilidad)</SelectItem>
              <SelectItem value="balanced">Equilibrado (balance riesgo-rendimiento)</SelectItem>
              <SelectItem value="aggressive">Agresivo (maximizar oportunidades)</SelectItem>
              <SelectItem value="exploring">En fase de exploración</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="twelve_month_vision">Visión a 12 meses para la estrategia cripto *</Label>
          <Textarea
            id="twelve_month_vision"
            value={formData.twelve_month_vision || ''}
            onChange={(e) => handleChange('twelve_month_vision', e.target.value)}
            placeholder="Describa dónde quiere que esté la empresa en términos de gestión cripto dentro de un año..."
            rows={4}
          />
        </div>
      </div>

      {/* ⚖️ Cumplimiento y controles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">⚖️ Cumplimiento y controles</h3>
        
        <div>
          <Label htmlFor="current_controls">Controles internos actuales para operaciones cripto *</Label>
          <Select value={formData.current_controls || ''} onValueChange={(value) => handleChange('current_controls', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el nivel de controles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tenemos controles específicos</SelectItem>
              <SelectItem value="basic">Controles básicos (aprobaciones, documentación)</SelectItem>
              <SelectItem value="intermediate">Controles intermedios (auditoría, segregación)</SelectItem>
              <SelectItem value="advanced">Controles avanzados (multi-firma, custodia)</SelectItem>
              <SelectItem value="institutional">Nivel institucional completo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="legal_advice">¿Tienen asesoramiento legal especializado en cripto? *</Label>
          <Select value={formData.legal_advice || ''} onValueChange={(value) => handleChange('legal_advice', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el nivel de asesoramiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tenemos asesoramiento</SelectItem>
              <SelectItem value="general">Asesor legal general</SelectItem>
              <SelectItem value="specialized">Especialista en blockchain/cripto</SelectItem>
              <SelectItem value="multijurisdiction">Múltiples jurisdicciones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="accounting_records">Sistema de registro contable para activos cripto *</Label>
          <Select value={formData.accounting_records || ''} onValueChange={(value) => handleChange('accounting_records', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el sistema de registro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No registramos activos cripto</SelectItem>
              <SelectItem value="manual">Registro manual en Excel/similar</SelectItem>
              <SelectItem value="erp_basic">ERP con módulo básico</SelectItem>
              <SelectItem value="specialized">Software especializado en crypto</SelectItem>
              <SelectItem value="full_integration">Integración completa con contabilidad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="consultation_expectations">¿Qué espera obtener de esta consultoría especializada? *</Label>
          <Textarea
            id="consultation_expectations"
            value={formData.consultation_expectations || ''}
            onChange={(e) => handleChange('consultation_expectations', e.target.value)}
            placeholder="Ej: estrategia de implementación, políticas de riesgo, procedimientos operativos, cumplimiento normativo, selección de proveedores..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default TreasuryEnterpriseForm;