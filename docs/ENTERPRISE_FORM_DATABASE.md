# 📊 **Almacenamiento de Datos del Formulario Empresarial - BSB Capital**

## 🗃️ **Ubicación de los Datos en Base de Datos**

### **Tabla Principal: `consultations`**
Los datos del formulario de gestión de tesorería empresarial se guardan en la tabla `consultations` de Supabase con la siguiente estructura:

---

## 📋 **Mapeo de Campos del Formulario a Base de Datos**

### **🏢 Datos de la Empresa**
| Campo del Formulario | Columna en BD | Tipo | Descripción |
|---------------------|---------------|------|-------------|
| `company_name` | `company_name` | TEXT | Nombre de la empresa |
| `company_country` | `company_country` | TEXT | País de residencia fiscal |
| `company_website` | `company_website` | TEXT | Sitio web de la empresa |
| `contact_person` | `contact_person` | TEXT | Persona de contacto principal |

### **💰 Situación Actual con Criptomonedas**
| Campo del Formulario | Columna en BD | Tipo | Valores Permitidos |
|---------------------|---------------|------|-------------------|
| `crypto_usage` | `crypto_usage` | TEXT + CHECK | 'none', 'treasury', 'payments', 'investment', 'multiple' |
| `monthly_crypto_volume` | `monthly_crypto_volume` | TEXT + CHECK | 'none', 'under10k', '10k-50k', '50k-200k', '200k-1M', 'over1M' |
| `crypto_assets_held` | `crypto_assets_held` | TEXT | Descripción libre de activos |
| `crypto_storage_location` | `crypto_storage_location` | TEXT + CHECK | 'no_assets', 'exchange_only', 'cold_wallet', 'mixed', 'custody', 'unsure' |

### **🎯 Objetivos Empresariales**
| Campo del Formulario | Columna en BD | Tipo | Valores Permitidos |
|---------------------|---------------|------|-------------------|
| `main_treasury_goal` | `main_treasury_goal` | TEXT + CHECK | 'diversification', 'payment_efficiency', 'hedge_inflation', 'yield_generation', 'market_expansion', 'regulatory_compliance' |
| `risk_profile` | `risk_profile` | TEXT + CHECK | 'conservative', 'balanced', 'aggressive', 'exploring' |
| `twelve_month_vision` | `twelve_month_vision` | TEXT | Visión estratégica a 12 meses |

### **⚖️ Cumplimiento y Controles**
| Campo del Formulario | Columna en BD | Tipo | Valores Permitidos |
|---------------------|---------------|------|-------------------|
| `current_controls` | `current_controls` | TEXT + CHECK | 'none', 'basic', 'intermediate', 'advanced', 'institutional' |
| `legal_advice` | `legal_advice` | TEXT + CHECK | 'none', 'general', 'specialized', 'multijurisdiction' |
| `accounting_records` | `accounting_records` | TEXT + CHECK | 'none', 'manual', 'erp_basic', 'specialized', 'full_integration' |
| `consultation_expectations` | `consultation_expectations` | TEXT | Expectativas de la consultoría |

---

## 📁 **Almacenamiento Completo de Datos**

### **1. Campos Estructurados**
Los 17 campos específicos del formulario se almacenan en columnas individuales para:
- ✅ **Consultas SQL eficientes**
- ✅ **Filtrado y búsqueda**  
- ✅ **Análisis de datos**
- ✅ **Reportes empresariales**

### **2. JSON Completo** 
Todos los datos también se almacenan en formato JSON en la columna `form_data_json` (JSONB) que contiene:

```json
{
  "timestamp": "2025-11-13T10:30:00Z",
  "consultation_id": "uuid-consultation-id",
  "consultation_type": "crypto_advanced", 
  "form_data": {
    "company_name": "BSB Capital Partners S.L.",
    "company_country": "España",
    // ... todos los campos del formulario
  },
  "client_responses": {
    "Nombre de la empresa": "BSB Capital Partners S.L.",
    "País de residencia fiscal": "España",
    // ... labels amigables con valores
  }
}
```

---

## 🔧 **Funcionalidad Técnica**

### **Validación de Datos**
- ✅ **Campos obligatorios**: Se validan 12 campos requeridos antes del envío
- ✅ **Constraint checks**: Validación a nivel de BD para valores permitidos
- ✅ **Tipos de datos**: Consistencia de tipos TEXT, JSONB, TIMESTAMP

### **Índices de Performance**
```sql
CREATE INDEX idx_consultations_company_name ON consultations(company_name);
CREATE INDEX idx_consultations_crypto_usage ON consultations(crypto_usage);  
CREATE INDEX idx_consultations_main_treasury_goal ON consultations(main_treasury_goal);
CREATE INDEX idx_consultations_form_data_json ON consultations USING GIN (form_data_json);
```

### **Archivo de Migración**
📄 **Ubicación**: `/supabase/migrations/20251113_add_enterprise_treasury_form_fields.sql`

---

## 🚀 **Flujo de Guardado**

1. **Usuario completa formulario** → TreasuryEnterpriseForm.jsx
2. **Validación frontend** → 12 campos obligatorios  
3. **Envío a servidor** → handleSubmit() en ConsultationPostPayment.jsx
4. **Mapeo de datos** → Conversión a estructura BD
5. **Actualización BD** → supabase.from('consultations').update()
6. **Confirmación** → Email + estado 'confirmed'

---

## 📊 **Ejemplo de Consulta de Datos**

```sql
-- Obtener todas las consultas empresariales
SELECT 
    company_name,
    company_country,
    crypto_usage,
    main_treasury_goal,
    risk_profile,
    form_data_json
FROM consultations 
WHERE service = 'crypto_advanced'
  AND form_completed_at IS NOT NULL
ORDER BY created_at DESC;

-- Buscar empresas por volumen de operaciones
SELECT * FROM consultations 
WHERE monthly_crypto_volume IN ('200k-1M', 'over1M')
  AND service = 'crypto_advanced';

-- Análisis por objetivos de tesorería  
SELECT main_treasury_goal, COUNT(*) as total
FROM consultations 
WHERE service = 'crypto_advanced'
GROUP BY main_treasury_goal;
```

---

## ⚡ **Estados de la Consulta**

| Estado | Descripción |
|--------|-------------|
| `pending` | Consulta creada, pago realizado |
| `confirmed` | Formulario completado y enviado |
| `scheduled` | Fecha y hora confirmadas |
| `completed` | Consulta realizada |

Los datos se guardan cuando la consulta pasa de `pending` a `confirmed` al completar el formulario post-pago.