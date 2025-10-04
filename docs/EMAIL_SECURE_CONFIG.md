# 🔒 Configuración de Variables de Entorno - Función Segura

## 📋 Variables Requeridas para Producción

### Variables de Entorno a Configurar en Supabase

```bash
# 1. API Key de Resend (OBLIGATORIO)
supabase secrets set RESEND_API_KEY=re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M

# 2. Email por defecto (RECOMENDADO)
supabase secrets set DEFAULT_FROM="BSB Capital <info@bsbcapital.com>"

# 3. Secret de función para seguridad extra (OPCIONAL pero RECOMENDADO)
supabase secrets set EXPECTED_FUNCTION_SECRET=bsb_secret_2024_email_protection
```

## 🛡️ Niveles de Seguridad Implementados

### Nivel 1: Función Básica (Actual `resend-emails`)
- ✅ API key desde variable de entorno
- ✅ Fallback para desarrollo
- ❌ Sin protección adicional

### Nivel 2: Función Segura (Nueva `resend-email-secure`)
- ✅ API key desde variable de entorno
- ✅ Solo métodos POST permitidos
- ✅ Validación de función secret
- ✅ Rate limiting básico con logs de IP
- ✅ Validación de campos requeridos
- ✅ Emails HTML mejorados
- ✅ Logs detallados

## 🧪 Uso de la Nueva Función Segura

### Sin Secret (Desarrollo)
```javascript
const { data, error } = await supabase.functions.invoke('resend-email-secure', {
  body: {
    type: 'welcome',
    to: 'danieldelamo31@gmail.com',
    data: {
      name: 'Daniel',
      email: 'danieldelamo31@gmail.com'
    }
  }
});
```

### Con Secret (Producción Recomendada)
```javascript
const { data, error } = await supabase.functions.invoke('resend-email-secure', {
  body: {
    type: 'welcome',
    to: 'danieldelamo31@gmail.com',
    data: {
      name: 'Daniel',
      email: 'danieldelamo31@gmail.com'
    }
  },
  headers: {
    'x-function-secret': 'bsb_secret_2024_email_protection'
  }
});
```

## 📧 Tipos de Email Disponibles

### 1. Bienvenida
```javascript
{
  type: 'welcome',
  to: 'usuario@ejemplo.com',
  data: {
    name: 'Nombre Usuario'
  }
}
```

### 2. Confirmación de Consultoría
```javascript
{
  type: 'consultation_confirmation',
  to: 'cliente@ejemplo.com',
  data: {
    name: 'Cliente',
    consultationType: 'Estrategia de Inversión',
    scheduledDate: '25 de octubre de 2024',
    scheduledTime: '15:00',
    duration: '60 minutos',
    consultationGoals: 'Optimizar cartera'
  }
}
```

### 3. Email Personalizado
```javascript
{
  type: 'custom',
  to: 'usuario@ejemplo.com',
  subject: 'Asunto personalizado',
  html: '<h1>Contenido HTML personalizado</h1>'
}
```

### 4. Test
```javascript
{
  type: 'test',
  to: 'test@ejemplo.com',
  data: {} // Cualquier data adicional
}
```

## 🔧 Comandos de Configuración

### Configurar todas las variables de una vez
```bash
# Navegar al directorio del proyecto
cd /Users/daniel/Downloads/horizons-export-817ad863-5db3-450e-8aa2-198248142884

# Configurar API key (OBLIGATORIO)
supabase secrets set RESEND_API_KEY=re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M

# Configurar email por defecto (RECOMENDADO)
supabase secrets set DEFAULT_FROM="BSB Capital <info@bsbcapital.com>"

# Configurar secret de función (SEGURIDAD EXTRA)
supabase secrets set EXPECTED_FUNCTION_SECRET=bsb_secret_2024_email_protection
```

### Verificar configuración
```bash
# Ver todas las variables configuradas
supabase secrets list

# Ver logs de la función
supabase functions logs resend-email-secure --follow
```

## 🚀 Migración Recomendada

### Paso 1: Configurar variables de entorno
```bash
supabase secrets set RESEND_API_KEY=re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M
supabase secrets set DEFAULT_FROM="BSB Capital <info@bsbcapital.com>"
```

### Paso 2: Actualizar emailService.js
```javascript
// Cambiar de:
this.functionName = 'resend-emails';

// A:
this.functionName = 'resend-email-secure';
```

### Paso 3: Testing
```javascript
// Test básico (sin secret)
const testBasic = async () => {
  const { data, error } = await supabase.functions.invoke('resend-email-secure', {
    body: {
      type: 'test',
      to: 'danieldelamo31@gmail.com',
      data: { name: 'Test Básico' }
    }
  });
  console.log({ data, error });
};

testBasic();
```

### Paso 4: Configurar secret (opcional pero recomendado)
```bash
supabase secrets set EXPECTED_FUNCTION_SECRET=bsb_secret_2024_email_protection
```

### Paso 5: Testing con secret
```javascript
// Test con secret (máxima seguridad)
const testSecure = async () => {
  const { data, error } = await supabase.functions.invoke('resend-email-secure', {
    body: {
      type: 'test',
      to: 'danieldelamo31@gmail.com',
      data: { name: 'Test Seguro' }
    },
    headers: {
      'x-function-secret': 'bsb_secret_2024_email_protection'
    }
  });
  console.log({ data, error });
};

testSecure();
```

## 📊 Comparación de Funciones

| Característica | `resend-emails` | `resend-email-secure` |
|----------------|-----------------|----------------------|
| API Key segura | ✅ | ✅ |
| Validación POST | ❌ | ✅ |
| Function Secret | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ (básico) |
| Logs detallados | ❌ | ✅ |
| Emails HTML mejorados | ❌ | ✅ |
| Validación de entrada | ❌ | ✅ |

## 🎯 Recomendación

**Usar `resend-email-secure` para producción** con todas las variables de entorno configuradas para máxima seguridad y funcionalidad.