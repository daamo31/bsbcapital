# Configuración de API Key de Resend

## 🔑 Configurar API Key

### Paso 1: Configurar en Dashboard de Supabase
1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions
2. En la sección "Environment Variables", añade:
   - **Variable Name:** `RESEND_API_KEY`
   - **Value:** `re_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M`
3. Haz click en "Add Variable"

### Paso 2: Verificar función desplegada
✅ La función `send-email` ya está desplegada exitosamente

## 🧪 Testear el Sistema de Emails

### Opción 1: Desde la Consola del Navegador
Abre tu aplicación web y ejecuta en la consola (F12):

```javascript
// Importar el servicio de emails
import { emailService } from '/src/lib/emailService.js';

// Test básico de health check
const testEmailHealth = async () => {
  try {
    const result = await emailService.healthCheck();
    console.log('🟢 Servicio de emails:', result);
    return result;
  } catch (error) {
    console.error('🔴 Error en servicio de emails:', error);
  }
};

// Ejecutar test
testEmailHealth();
```

### Opción 2: Email de Bienvenida de Test
```javascript
const testWelcomeEmail = async () => {
  try {
    const result = await emailService.sendWelcomeEmail({
      name: 'Daniel',
      email: 'danieldelamo31@gmail.com'
    });
    console.log('📧 Email de bienvenida enviado:', result);
  } catch (error) {
    console.error('🔴 Error enviando email:', error);
  }
};

testWelcomeEmail();
```

### Opción 3: Test Directo vía Supabase RPC
```javascript
const testDirectEmail = async () => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'welcome',
      to: 'danieldelamo31@gmail.com',
      data: {
        name: 'Daniel',
        email: 'danieldelamo31@gmail.com'
      }
    }
  });
  
  if (error) {
    console.error('🔴 Error:', error);
  } else {
    console.log('📧 Email enviado:', data);
  }
};

testDirectEmail();
```

## 📧 Tipos de Emails Disponibles

### 1. Email de Bienvenida
```javascript
emailService.sendWelcomeEmail({
  name: 'Nombre Usuario',
  email: 'usuario@ejemplo.com'
});
```

### 2. Confirmación de Consultoría
```javascript
emailService.sendConsultationConfirmation({
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  consultationType: 'Estrategia de Inversión',
  scheduledDate: '25 de octubre de 2024',
  scheduledTime: '15:00',
  duration: '60 minutos',
  consultationGoals: 'Optimizar mi cartera de inversiones'
});
```

### 3. Recordatorio de Consultoría
```javascript
emailService.sendConsultationReminder({
  name: 'Cliente',
  email: 'cliente@ejemplo.com',
  consultationType: 'Análisis de Portafolio',
  scheduledDate: 'mañana',
  scheduledTime: '10:00'
});
```

### 4. Confirmación de Preregistro BSB Maker
```javascript
emailService.sendPreregistrationConfirmation({
  name: 'Interesado',
  email: 'interesado@ejemplo.com'
});
```

### 5. Activación de Membresía
```javascript
emailService.sendSubscriptionActivated({
  name: 'Nuevo Miembro',
  email: 'miembro@ejemplo.com',
  planName: 'Premium',
  features: ['Acceso a Academia', 'Consultas Premium', 'Herramientas Avanzadas']
});
```

## 🔧 Troubleshooting

### Error: "RESEND_API_KEY not configured"
**Solución:** Verifica que configuraste la variable de entorno en el dashboard de Supabase

### Error: "Your account does not have the necessary privileges"
**Solución:** Configura la API key desde el dashboard web de Supabase en lugar del CLI

### Error: "Email service not available"
**Solución:** Verifica que la función `send-email` está desplegada correctamente

### Error en el navegador: "Cannot import emailService"
**Solución:** Usa el objeto global o importa desde el contexto de React

## ✅ Validación Exitosa

Si todo está configurado correctamente, deberías ver:

1. **Consola:** `🟢 Servicio de emails: { available: true }`
2. **Email enviado** a danieldelamo31@gmail.com
3. **Sin errores** en la consola del navegador
4. **Respuesta exitosa** de la función Edge

---

## 🚀 Próximos Pasos

Una vez que confirmes que los emails funcionan:

1. ✅ Probar cada tipo de email
2. ✅ Verificar integración con formularios existentes
3. ✅ Testear flujo completo de consultas
4. ✅ Validar emails automáticos en signup/login