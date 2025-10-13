# 🚀 Guía Completa: Subir BSB Capital a Hostinger

## 📋 Preparativos Antes de Subir

### 1. **Configurar Variables de Entorno de Producción**

En tu proyecto, asegúrate de tener configurado `.env.production` con los valores correctos:

```bash
# Supabase - CAMBIAR por tus valores de producción
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_produccion

# Stripe - CAMBIAR por tus claves LIVE de Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_stripe_key_produccion

# Tu dominio de Hostinger
VITE_APP_URL=https://tudominio.com

# IDs de productos de consultoría (los que me diste)
VITE_STRIPE_CONSULTATION_30MIN_MEMBER=price_1SHoSzJmSk3VG9oiEF2xRHNp
VITE_STRIPE_CONSULTATION_60MIN_MEMBER=price_1SHoU8JmSk3VG9oiiMmypJRJ
```

### 2. **Verificar configuración de Stripe**
- ✅ Asegúrate que los price IDs estén activos en tu cuenta Stripe
- ✅ Configura los webhooks de Stripe apuntando a tu dominio
- ✅ Activa el modo LIVE en Stripe

### 3. **Configurar Supabase para Producción**
- ✅ Configura las Edge Functions para producción
- ✅ Actualiza las políticas de RLS si es necesario
- ✅ Verifica que la base de datos tenga todas las tablas

## 🛠️ Proceso de Build

### Paso 1: Instalar dependencias
```bash
cd tu-proyecto
npm install
```

### Paso 2: Build para producción
```bash
npm run build
```

Esto creará una carpeta `dist` con todos los archivos optimizados.

## 📁 Subir a Hostinger

### Opción A: Via File Manager de Hostinger

1. **Accede a tu panel de Hostinger**
2. **Ve a File Manager**
3. **Navega a `public_html`**
4. **Elimina todo el contenido actual** (si es un sitio nuevo)
5. **Sube TODO el contenido de la carpeta `dist`**
   - index.html
   - assets/
   - Todos los archivos y carpetas

### Opción B: Via FTP/SFTP

```bash
# Usando SCP (si tienes acceso SSH)
scp -r dist/* usuario@tudominio.com:/domains/tudominio.com/public_html/

# O usando FileZilla/WinSCP
# Conecta via FTP y sube todo el contenido de dist/
```

## ⚙️ Configuración Post-Subida

### 1. **Configurar .htaccess para React Router**
Crear archivo `.htaccess` en public_html:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# CORS headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### 2. **Configurar SSL (HTTPS)**
- En el panel de Hostinger, activa SSL gratuito para tu dominio
- Asegúrate de redirigir HTTP a HTTPS

### 3. **Verificar Variables de Entorno**
Como Hostinger no soporta variables de entorno como Vercel, las variables `VITE_*` se "queman" en el build. Asegúrate de que `.env.production` tenga los valores correctos ANTES de hacer `npm run build`.

## 🗄️ Configuración de Base de Datos

### Supabase Edge Functions
Si usas Edge Functions para pagos, configúralas para producción:

```sql
-- Ejemplo: Función para crear checkout de consultoría
CREATE OR REPLACE FUNCTION create_consultation_checkout(
  consultation_data jsonb
) RETURNS json AS $$
-- Tu lógica de Edge Function aquí
$$ LANGUAGE plpgsql;
```

### Webhooks de Stripe
Configura los webhooks en Stripe Dashboard:
- URL: `https://tudominio.com/api/stripe-webhook`
- Eventos: `checkout.session.completed`, `invoice.payment_succeeded`

## 🧪 Testing en Producción

### 1. **Verifica rutas principales:**
- ✅ https://tudominio.com/ (Home)
- ✅ https://tudominio.com/consultoria/precios (Pricing)
- ✅ https://tudominio.com/membresias (Memberships)
- ✅ https://tudominio.com/admin (Admin panel)

### 2. **Prueba funcionalidades críticas:**
- ✅ Login/Registro
- ✅ Detección de membresía
- ✅ Precios con descuento
- ✅ Proceso de pago
- ✅ Formulario post-pago

### 3. **Verifica integraciónes:**
- ✅ Supabase conecta correctamente
- ✅ Stripe procesa pagos
- ✅ Emails se envían
- ✅ Admin panel funciona

## 🚨 Troubleshooting Común

### Error 404 en rutas
- Verificar que `.htaccess` esté configurado
- Asegurar que todas las rutas de React Router funcionan

### Error de CORS
- Configurar headers CORS en `.htaccess`
- Verificar configuración de Supabase

### Variables de entorno no funcionan
- Rebuilder con `.env.production` correcto
- Verificar que las variables tengan prefijo `VITE_`

### Errores de SSL
- Activar SSL en panel Hostinger
- Verificar redirección HTTP → HTTPS

## 📞 Soporte

Si tienes problemas:
1. **Hostinger Support**: Chat 24/7
2. **Logs de error**: Panel Hostinger → Error Logs
3. **Console del navegador**: F12 para ver errores JavaScript

## ✅ Checklist Final

- [ ] Build completado sin errores
- [ ] Archivos subidos a public_html
- [ ] .htaccess configurado
- [ ] SSL activado
- [ ] Variables de entorno correctas
- [ ] Supabase configurado para producción
- [ ] Stripe en modo LIVE
- [ ] Webhooks configurados
- [ ] Rutas principales funcionando
- [ ] Sistema de pagos funcionando
- [ ] Admin panel accesible

¡Tu aplicación BSB Capital con sistema de consultorías y descuentos estará lista! 🎉