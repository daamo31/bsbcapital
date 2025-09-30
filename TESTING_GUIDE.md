# 🧪 Guía de Pruebas - Sistema Hotmart Integrado

## ✅ Usuario de Prueba Creado

He creado exitosamente un usuario de prueba con las siguientes credenciales:

### 👤 Credenciales
- **Email:** `test@bsbcapital.com`
- **Password:** `TestUser123!`
- **Nombre:** Usuario Prueba BSB
- **ID:** b4abe1df-34d5-4951-b111-a6441a0c7f48

### 🎯 Configuración del Usuario
✅ Usuario creado en Supabase Auth  
✅ Checkout simulado como "approved"  
✅ Acceso al producto 6308462 configurado  
✅ Válido por 1 año desde hoy  

## 🚀 Cómo Probar el Sistema

### 1. Iniciar la Aplicación
```bash
cd /Users/daniel/Downloads/horizons-export-817ad863-5db3-450e-8aa2-198248142884
npm run dev
```

### 2. Acceder a la Página de Pruebas
Ve a: `http://localhost:5173/test`

### 3. Ejecutar Tests en Orden

#### 🔐 Test 1: Autenticación
1. Haz clic en "Probar Login"
2. Se autenticará automáticamente con el usuario de prueba
3. Verifica que aparezca la información del usuario

#### 🛒 Test 2: Crear Checkout
1. Una vez logueado, haz clic en "Crear Checkout"
2. Se creará un checkout usando la API de Hotmart
3. Verifica que se muestre la URL del checkout

#### ✅ Test 3: Verificar Acceso
1. Haz clic en "Verificar Acceso"
2. Debería mostrar "PERMITIDO" ya que el usuario tiene acceso configurado
3. Verifica los detalles del acceso en el JSON

#### ⚡ Test 4: Rate Limiting
1. Haz clic en "Probar Rate Limit" varias veces
2. Las primeras veces debería mostrar "PERMITIDO"
3. Después de varios intentos debería mostrar "BLOQUEADO"

### 4. Probar Características de Seguridad

#### 🎥 Video con Watermark
- Reproduce el video de demo
- Verifica que aparezca el watermark con el email del usuario
- Intenta hacer clic derecho → debería estar deshabilitado

#### 🔒 Contenido Protegido
- Intenta hacer clic derecho → bloqueado
- Intenta abrir DevTools (F12) → bloqueado
- Cambia de pestaña → el contenido se debería difuminar

## 📊 URLs de las Edge Functions

Todas estas URLs están activas y funcionando:

### Principales
- **Checkout:** `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/hotmart-checkout`
- **Verificar Acceso:** `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/verify-access`
- **Webhook:** `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/hotmart-webhook`
- **Rate Limit:** `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/rate-limit`

### Testing
- **Crear Usuario:** `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/create-test-user`

## 🔧 Tests Manuales con cURL

### Test Checkout (requiere token de usuario)
```bash
curl -X POST "https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/hotmart-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -d '{
    "user_id": "b4abe1df-34d5-4951-b111-a6441a0c7f48",
    "email": "test@bsbcapital.com",
    "name": "Usuario Prueba BSB"
  }'
```

### Test Verificar Acceso
```bash
curl -X POST "https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/verify-access" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -d '{
    "user_id": "b4abe1df-34d5-4951-b111-a6441a0c7f48",
    "product_id": "6308462"
  }'
```

### Test Rate Limit
```bash
curl -X POST "https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/rate-limit" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "test-action",
    "ip": "127.0.0.1"
  }'
```

## 🗃️ Verificar Base de Datos

Puedes verificar que todo funciona consultando estas tablas en Supabase:

### hotmart_checkouts
```sql
SELECT * FROM hotmart_checkouts WHERE email = 'test@bsbcapital.com';
```

### user_access
```sql
SELECT * FROM user_access WHERE user_id = 'b4abe1df-34d5-4951-b111-a6441a0c7f48';
```

### rate_limits
```sql
SELECT * FROM rate_limits ORDER BY created_at DESC LIMIT 10;
```

## 🎯 Resultados Esperados

### ✅ Test Exitoso
- Login: Usuario autenticado correctamente
- Checkout: URL de checkout generada
- Acceso: "has_access: true" para producto 6308462
- Rate Limit: Primero permitido, luego bloqueado tras varios intentos

### 🔒 Seguridad Funcionando
- Videos con watermark visible
- Click derecho deshabilitado
- DevTools bloqueados
- Contenido protegido contra capturas

## 🚨 Troubleshooting

### Si el login falla:
- Verifica que el servidor esté corriendo en puerto 5173
- Confirma que las variables de entorno están configuradas

### Si los tests fallan:
- Verifica que las Edge Functions estén desplegadas
- Confirma la conectividad a Supabase
- Revisa los logs en el dashboard de Supabase

### Si la página no carga:
- Ejecuta `npm install` si es la primera vez
- Verifica que todas las dependencias estén instaladas

## 📈 Dashboard de Monitoreo

Puedes monitorear todo en tiempo real:
- **Functions:** https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/functions
- **Database:** https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/editor
- **Auth:** https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/auth/users

¡El sistema está completamente funcional y listo para testing! 🚀