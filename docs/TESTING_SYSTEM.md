# Guía de Testing - Sistema Completo BSB Capital

## 🎯 Objetivo
Esta guía te permitirá probar todos los componentes del sistema de membresías, academia, consultas y emails de BSB Capital.

## 📋 Prerrequisitos

### Base de Datos
1. **Ejecutar migraciones en orden:**
   ```sql
   -- 1. Sistema de membresías base
   \i supabase/migrations/20240930_create_membership_system.sql
   
   -- 2. Sistema de consultas
   \i supabase/migrations/20241002_consultation_system.sql
   
   -- 3. Datos de ejemplo
   \i supabase/seed_complete_system.sql
   ```

### Variables de Entorno
2. **Configurar variables en Supabase:**
   ```env
   RESEND_API_KEY=tu_resend_api_key_aqui
   ```

### Funciones Edge
3. **Desplegar función de emails:**
   ```bash
   supabase functions deploy send-email
   ```

## 🧪 Tests por Componente

### 1. Sistema de Autenticación y Membresías

#### Test 1.1: Registro de Usuario
- [ ] Ir a `/signup`
- [ ] Registrar nuevo usuario con email válido
- [ ] Verificar que se crea en `auth.users`
- [ ] Verificar que NO tiene membresía activa inicialmente

#### Test 1.2: Login y Estado de Membresía
- [ ] Login con usuario registrado
- [ ] Verificar que aparece en `/area-cliente` sin membresías activas
- [ ] Intentar acceder a `/academia` → debe mostrar "Activa tu Membresía"

#### Test 1.3: Activación de Membresía (Manual)
```sql
-- Activar membresía Premium para testing
INSERT INTO user_subscriptions (user_id, plan_id, status, started_at, expires_at) 
VALUES (
  'tu_user_id_aqui',
  (SELECT id FROM subscription_plans WHERE name = 'Premium' LIMIT 1),
  'active',
  NOW(),
  NOW() + INTERVAL '1 month'
);
```
- [ ] Refresh página y verificar acceso a academia
- [ ] Verificar límites de consulta en calendario

### 2. Sistema de Academia

#### Test 2.1: Control de Acceso por Membresía
- [ ] **Sin membresía:** `/academia` → Mensaje de "Activa tu Membresía"
- [ ] **Con membresía Basic:** Ver contenido público únicamente
- [ ] **Con membresía Premium:** Ver contenido público + premium
- [ ] **Con membresía Elite:** Ver todo el contenido

#### Test 2.2: Navegación de Contenido
- [ ] Verificar que aparecen estadísticas correctas (cursos, videos, horas)
- [ ] Click en "Acceder al Curso" para contenido permitido
- [ ] Verificar que contenido restringido muestra "Requiere Membresía Premium"

#### Test 2.3: Hook useUserAccess
- [ ] Verificar que `useUserAccess()` devuelve `hasAccess: true` con membresía
- [ ] Verificar que `userSubscription` contiene datos del plan actual
- [ ] Probar `refreshAccess()` después de cambios de membresía

### 3. Sistema de Consultas con Calendario

#### Test 3.1: Verificación de Límites por Membresía
```javascript
// En consola del navegador
const testLimits = async () => {
  const { data } = await supabase.rpc('check_user_consultation_limits', {
    user_id_param: 'tu_user_id',
    consultation_type_param: 'investment'
  });
  console.log('Límites del usuario:', data);
};
testLimits();
```

#### Test 3.2: Calendario de Disponibilidad
- [ ] Ir a `/consultoria`
- [ ] Click en "Reservar Consultoría"
- [ ] **Paso 1:** Seleccionar tipo y duración
- [ ] **Paso 2:** Verificar que el calendario muestra:
  - ✅ Slots verdes (disponibles)
  - ❌ Slots grises (no disponibles)
  - Solo horarios futuros (9:00-17:30, Lun-Vie)

#### Test 3.3: Prevención de Solapamiento
```sql
-- Crear consulta de prueba para verificar conflictos
INSERT INTO consultations (user_id, scheduled_at, duration_minutes, status) 
VALUES ('user_id', '2024-10-03 15:00:00', 60, 'confirmed');
```
- [ ] Verificar que slots 15:00-16:00 aparecen como no disponibles
- [ ] Intentar reservar en horario ocupado → debe mostrar error

#### Test 3.4: Flujo Completo de Reserva
- [ ] **Paso 1:** Seleccionar "Estrategia de Inversión" + "60 minutos"
- [ ] **Paso 2:** Seleccionar slot disponible
- [ ] **Paso 3:** Completar todos los campos obligatorios:
  - Nombre, email, objetivos de consultoría
  - Experiencia en inversión, tamaño de cartera
  - Preguntas específicas
- [ ] Click "Proceder al Pago" → redirige a Stripe

### 4. Sistema de Emails

#### Test 4.1: Health Check del Servicio
```javascript
// En consola del navegador
const testEmailService = async () => {
  const health = await emailService.healthCheck();
  console.log('Estado del servicio:', health);
};
testEmailService();
```

#### Test 4.2: Email de Bienvenida
```javascript
const testWelcomeEmail = async () => {
  const result = await emailService.sendWelcomeEmail({
    name: 'Usuario Test',
    email: 'test@ejemplo.com'
  });
  console.log('Email enviado:', result);
};
testWelcomeEmail();
```

#### Test 4.3: Email de Confirmación de Consulta
```javascript
const testConsultationEmail = async () => {
  const result = await emailService.sendConsultationConfirmation({
    name: 'Cliente Test',
    email: 'cliente@ejemplo.com',
    consultationType: 'Estrategia de Inversión',
    scheduledDate: '23 de octubre de 2024',
    scheduledTime: '15:00',
    duration: '60 minutos',
    consultationGoals: 'Optimizar mi cartera de inversiones'
  });
  console.log('Email de consulta enviado:', result);
};
testConsultationEmail();
```

#### Test 4.4: Formulario Post-Pago
- [ ] Simular llegada desde Stripe: `/consultation-post-payment?session_id=test_session`
- [ ] Verificar que se cargan datos de la consulta
- [ ] Completar formulario adicional
- [ ] Submit → debe enviar email de confirmación automáticamente

### 5. Integración BSB Maker

#### Test 5.1: Preregistro BSB Maker
- [ ] Ir a la página BSB Maker
- [ ] Completar formulario de preregistro
- [ ] Verificar inserción en tabla `bsb_maker_preregistrations`
- [ ] Verificar email de confirmación automático

### 6. Simulación de Flujo Completo

#### Flujo Usuario Nuevo → Academia
1. [ ] Registro usuario nuevo
2. [ ] Intento acceso academia → bloqueado
3. [ ] Activación membresía Premium (manual/Stripe)
4. [ ] Acceso exitoso a academia con contenido premium
5. [ ] Navegación entre cursos permitidos

#### Flujo Consulta Completa
1. [ ] Usuario con membresía activa
2. [ ] Reserva consulta vía calendario
3. [ ] Pago exitoso en Stripe
4. [ ] Completar formulario post-pago
5. [ ] Recibir email de confirmación
6. [ ] Ver consulta en área cliente

## 🔧 Comandos Útiles para Testing

### Verificar Estado de Usuario
```sql
-- Ver membresías activas de un usuario
SELECT u.email, us.status, sp.name as plan_name, us.expires_at
FROM auth.users u
JOIN user_subscriptions us ON u.id = us.user_id
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE u.email = 'tu_email@ejemplo.com';
```

### Verificar Consultas Programadas
```sql
-- Ver consultas del sistema
SELECT 
  c.title,
  c.scheduled_at,
  c.status,
  c.client_name,
  u.email as user_email
FROM consultations c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.scheduled_at DESC;
```

### Verificar Límites de Consulta
```sql
-- Ver límites por plan
SELECT 
  sp.name as plan_name,
  mcl.monthly_limit,
  mcl.allowed_consultation_types
FROM membership_consultation_limits mcl
JOIN subscription_plans sp ON mcl.plan_id = sp.id;
```

### Limpiar Datos de Test
```sql
-- Limpiar datos de prueba
DELETE FROM consultations WHERE client_email LIKE '%test%';
DELETE FROM bsb_maker_preregistrations WHERE email LIKE '%test%';
DELETE FROM user_subscriptions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%test%'
);
```

## ✅ Checklist de Validación Final

### Funcionalidad Core
- [ ] Autenticación funciona correctamente
- [ ] Control de acceso por membresía operativo
- [ ] Academia muestra contenido según plan
- [ ] Calendario previene solapamientos
- [ ] Límites de consulta se respetan
- [ ] Emails se envían correctamente

### Experiencia de Usuario
- [ ] Flujo de reserva es intuitivo
- [ ] Mensajes de error son claros
- [ ] Estados de carga funcionan
- [ ] Responsive design es correcto
- [ ] Navegación es fluida

### Seguridad y Datos
- [ ] RLS políticas funcionan
- [ ] No hay acceso no autorizado
- [ ] Datos se persisten correctamente
- [ ] Validaciones frontend/backend coherentes

## 🚨 Problemas Conocidos y Soluciones

### Error: "Email service not available"
**Solución:** Verificar que `RESEND_API_KEY` está configurado en Supabase

### Error: "Cannot read properties of undefined"
**Solución:** Verificar que las migraciones se ejecutaron correctamente

### Error: "User cannot book consultation"
**Solución:** Verificar que el usuario tiene membresía activa y no ha superado límites

### Consulta no aparece en calendario
**Solución:** Verificar que la fecha/hora están en el futuro y dentro del horario laboral

---

## 📞 Soporte

Si encuentras problemas durante el testing:
1. Revisar logs del navegador (F12 → Console)
2. Verificar logs de Supabase Edge Functions
3. Comprobar estado de la base de datos
4. Validar configuración de variables de entorno