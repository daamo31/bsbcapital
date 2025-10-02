# BSB Capital - Sistema de Membresías y Academia

## 📋 Descripción del Proyecto

Sistema completo de membresías con integración de contenido educativo para BSB Capital. Incluye autenticación de usuarios, gestión de suscripciones, integración con Hotmart para contenido premium y sistema de testing para desarrollo.

## 🏗️ Arquitectura del Sistema

### Frontend
- **React 18** con Vite
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Framer Motion** para animaciones
- **Lucide React** para iconos

### Backend & Base de Datos
- **Supabase** (PostgreSQL con RLS)
- **Stripe** para procesamiento de pagos
- **Hotmart API** para contenido educativo

### Autenticación
- Supabase Auth con políticas RLS
- Verificación por email
- Sistema de roles y permisos

## � Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Stripe
- Credenciales de Hotmart API

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd bsb-capital-memberships
npm install
```

### 2. Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key

# Hotmart
VITE_HOTMART_CLIENT_ID=tu_hotmart_client_id
VITE_HOTMART_CLIENT_SECRET=tu_hotmart_client_secret
VITE_HOTMART_PRODUCT_ID=tu_hotmart_product_id

# Resend (para envío de emails)
RESEND_API_KEY=tu_resend_api_key

# Configuración de entorno
VITE_APP_URL=http://localhost:5173
```

### 3. Configuración de Supabase

#### Tablas Principales
```sql
-- Planes de suscripción
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER,
  features JSONB,
  stripe_price_id VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suscripciones de usuarios
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR NOT NULL DEFAULT 'pending',
  stripe_subscription_id VARCHAR,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contenido de la academia
CREATE TABLE academy_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR NOT NULL,
  hotmart_content_id VARCHAR,
  required_plan_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Funciones RPC
```sql
-- Verificar acceso a contenido
CREATE OR REPLACE FUNCTION check_user_content_access(
  user_id_param UUID,
  content_id_param VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_id_param
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Políticas RLS
```sql
-- Habilitar RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_content ENABLE ROW LEVEL SECURITY;

-- Políticas para user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para academy_content
CREATE POLICY "Users can view active content" ON academy_content
  FOR SELECT USING (is_active = true);
```

### 4. Ejecutar el Proyecto
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 🧩 Estructura de Componentes

### Componentes Principales

#### `useUserAccess` Hook
```javascript
const { hasAccess, isLoading, userSubscription, refreshAccess } = useUserAccess(contentId);
```
- **hasAccess**: Boolean - Si el usuario tiene acceso
- **isLoading**: Boolean - Estado de carga
- **userSubscription**: Object - Datos de suscripción activa
- **refreshAccess**: Function - Refrescar verificación

#### `AcademyProtectedRoute`
Componente para proteger rutas que requieren membresía activa.

#### `HotmartVideoPlayer`
Reproductor nativo integrado con la API de Hotmart.

### Servicios

#### `hotmartService.js`
```javascript
// Obtener datos de contenido
const contentData = await hotmartService.getContentData(productId);

// Obtener URL de streaming
const streamUrl = await hotmartService.getVideoStreamURL(videoId);

// Verificar acceso del usuario
const access = await hotmartService.checkUserAccess(userId, contentId);
```

## 🛣️ Estructura de Rutas

### Rutas Públicas
- `/` - Página principal
- `/membresias` - Planes de membresía
- `/login` - Inicio de sesión
- `/signup` - Registro

### Rutas Protegidas (Requieren Login)
- `/dashboard` - Panel del usuario
- `/academia/catalogo` - Catálogo público de cursos

### Rutas Premium (Requieren Membresía)
- `/academia/contenido` - Contenido premium
- `/academia/modulo/:moduleId` - Módulos específicos

### Rutas de Administración
- `/academia/admin` - Panel de administración
- `/panel/accesos` - Gestión de accesos

### Rutas de Testing
- `/test` - Sistema de testing completo
- `/test/hotmart` - Test específico de Hotmart
- `/test/user-status` - Verificación de usuario

## 🧪 Sistema de Testing

### Modo Premium Simulado
El sistema incluye un modo de testing que simula automáticamente una membresía premium cuando se accede a rutas de testing (`/test/*`).

**Características:**
- Activación automática en rutas de test
- Bypass de verificaciones de suscripción
- Datos mock realistas para desarrollo
- Indicadores visuales del estado de testing

### Rutas de Testing Disponibles

#### `/test` - Panel Principal de Testing
- Verificación completa del sistema
- Test de autenticación y acceso
- Navegación a todas las secciones
- Estado de integración con Hotmart

#### `/test/hotmart` - Player de Testing
- Modo demo (simulación visual)
- Modo mock (datos falsos)
- Modo real (API de Hotmart)
- Videos de prueba reales

#### `/test/user-status` - Verificación de Usuario
- Estado de autenticación
- Información de suscripción
- Credenciales de test disponibles

### Usuarios de Prueba
```javascript
// Credenciales de testing incluidas
const testCredentials = {
  email: 'test@bsbcapital.com',
  password: 'Test123456!'
};
```

## � Sistema de Emails con Resend

### Variables Requeridas
```env
RESEND_API_KEY=tu_resend_api_key
```

### Configuración de Resend
1. Crear cuenta en [resend.com](https://resend.com)
2. Generar API Key en el dashboard
3. Configurar dominio personalizado (opcional)
4. Agregar `RESEND_API_KEY` a las variables de entorno

### Tipos de Email Disponibles
- **welcome**: Email de bienvenida para nuevos usuarios
- **preregistration_confirmation**: Confirmación de preregistro BSB Maker
- **purchase_confirmation**: Confirmación de compra/suscripción
- **subscription_activated**: Notificación de membresía activada
- **contact_form**: Formularios de contacto (interno)
- **service_inquiry**: Consultas de servicios (interno)

### Uso del Servicio
```javascript
import emailService from '@/lib/emailService';

// Enviar email de bienvenida
await emailService.sendWelcomeEmail({
  name: 'Juan Pérez',
  email: 'juan@example.com'
});

// Enviar confirmación de compra
await emailService.sendPurchaseConfirmation({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  planName: 'Premium',
  amount: '$49/mes',
  transactionId: 'tx_123456'
});
```

## �🔧 Configuración de Hotmart

### Variables Requeridas
```env
VITE_HOTMART_CLIENT_ID=tu_client_id
VITE_HOTMART_CLIENT_SECRET=tu_client_secret  
VITE_HOTMART_PRODUCT_ID=tu_product_id
```

### Configuración de OAuth2
1. Registrar aplicación en Hotmart Developer Portal
2. Configurar redirect URIs
3. Obtener credenciales de cliente
4. Configurar permisos de producto

### Endpoints Utilizados
- `/auth/oauth/token` - Autenticación OAuth2
- `/products/{productId}/content` - Obtener contenido
- `/products/{productId}/videos/{videoId}/stream` - URLs de streaming

## 🎨 Personalización de UI

### Temas y Estilos
El proyecto utiliza Tailwind CSS con componentes personalizados en `/src/components/ui/`.

### Componentes Reutilizables
- `Button` - Botones con variantes
- `Card` - Tarjetas de contenido
- `Badge` - Etiquetas de estado
- `Dialog` - Modales
- `Toast` - Notificaciones

## 📦 Despliegue

### Variables de Producción
```env
VITE_APP_URL=https://tu-dominio.com
VITE_SUPABASE_URL=tu_supabase_production_url
# ... resto de variables
```

### Build para Producción
```bash
npm run build
npm run preview
```

## 🔒 Seguridad

### Autenticación
- JWT tokens con Supabase Auth
- Verificación por email obligatoria
- Rate limiting en endpoints sensibles

### Autorización
- Row Level Security (RLS) en Supabase
- Verificación de permisos en frontend y backend
- Políticas granulares por tabla

### Datos Sensibles
- Variables de entorno para credenciales
- Encriptación de datos de pago
- Logs de auditoría para acciones críticas

## 🐛 Debugging y Logs

### Logs de Desarrollo
```javascript
// Activar logs detallados
localStorage.setItem('debug', 'app:*');
```

### Herramientas de Debug
- React Developer Tools
- Supabase Dashboard para queries
- Stripe Dashboard para pagos
- Browser DevTools para network

## 📈 Monitoreo

### Métricas Importantes
- Tasa de conversión de suscripciones
- Tiempo de carga de contenido
- Errores de autenticación
- Uso de contenido premium

### Herramientas Recomendadas
- Google Analytics para métricas web
- Supabase Analytics para base de datos
- Stripe Analytics para pagos

## 🤝 Contribución

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- ESLint para linting
- Prettier para formateo
- Nomenclatura descriptiva
- Comentarios para lógica compleja

## 📞 Soporte

### Documentación Adicional
- `/docs/GUIA_USUARIO.md` - Guía para usuarios finales
- `/docs/RUTAS.md` - Documentación de rutas
- `/docs/TESTING.md` - Guía de testing

### Contacto Técnico
- Issues en GitHub para bugs
- Documentación en `/docs` para dudas comunes

---

## � Quick Start

Para empezar rápidamente:

1. **Clonar y configurar:**
   ```bash
   git clone <repo-url>
   cd bsb-capital
   npm install
   cp .env.example .env.local
   ```

2. **Configurar variables de entorno** en `.env.local`

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder al sistema de testing:**
   - Ir a `http://localhost:5173/test`
   - El modo premium se activará automáticamente
   - Explorar todas las funcionalidades

¡El sistema está listo para usar! 🎉

- **Home** - Página de inicio
- **Academia** - Plataforma de formación
- **Área Cliente** - Dashboard personalizado
- **Servicios** - AlgoFund, Consultoría, etc.
- **Blog** - Contenido educativo

## 🔐 Autenticación

La aplicación utiliza Supabase para:
- Registro y login de usuarios
- Verificación por email
- Gestión de sesiones
- Control de acceso por roles

## 💳 Integraciones de Pago

- **Stripe** - Pagos recurrentes y únicos
- **Hotmart** - Academia y productos digitales

## 🌍 Internacionalización

Soporte completo para:
- Español (por defecto)
- Inglés

## 📄 Licencia

© 2024 BSB Capital. Todos los derechos reservados.
