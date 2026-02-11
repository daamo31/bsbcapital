# BSB Capital - Plataforma de Inversiones y Consultoría Financiera 🚀

## 📋 Descripción del Proyecto

Plataforma completa de servicios financieros especializada en criptomonedas e inversiones. Incluye sistema de membresías, consultoría personalizada, herramientas de análisis (BSB Maker), academia educativa y dashboard administrativo con interfaz moderna y animaciones interactivas.

## ✨ Características Principales

### 🎨 **Interfaz y Experiencia de Usuario**

- **Animaciones Framer Motion** para transiciones suaves y profesionales
- **Diseño responsive** optimizado para todos los dispositivos
- **Esquema de colores profesional**: Verde elegante + Amarillo dorado brillante
- **Efectos interactivos**: Hover, scale y feedback visual en componentes
- **Gradientes dinámicos** en títulos y elementos destacados

### 🔧 **Tecnologías y Herramientas**

- **Frontend**: React 18 + Vite + TypeScript
- **Estilos**: Tailwind CSS con variables CSS personalizadas
- **Animaciones**: Framer Motion para efectos fluidos
- **UI Components**: shadcn/ui + Lucide React icons
- **Routing**: React Router con protección de rutas
- **Estado**: Context API para autenticación y configuración
- **PDF Generation**: jsPDF para informes automáticos
  26:
  27: ### 🚀 **SEO & Web Performance**
  28:
  29: - **Dynamic Meta Tags**: Gestión avanzada con React Helmet para cada página
  30: - **Canonicals & Open Graph**: URLs canónicas y etiquetas OG específicas para social media
  31: - **Structured Data (JSON-LD)**: Implementación de BreadcrumbList Schema.org
  32: - **Sitemap & Robots**: Generación automática de `sitemap.xml` y configuración de `robots.txt`
  33: - **WPO (Web Performance Optimization)**: Carga perezosa (Lazy Loading) de imágenes no críticas
  34: - **Clean URLs**: Estructura de enlaces optimizada para motores de búsqueda

## 🏗️ Arquitectura del Sistema

### 🎨 **Frontend Avanzado**

- **React 18** con Vite para desarrollo rápido
- **Tailwind CSS** con sistema de variables CSS personalizadas
- **Framer Motion** para animaciones fluidas y naturales
- **React Router** con protección de rutas por roles
- **Lucide React** para iconografía consistente

### 🎨 **Sistema de Diseño**

- **Paleta Verde Elegante**: 9 tonos desde `brand-green-50` hasta `brand-green-900`
- **Amarillo Dorado Brillante**: `#FFD700` primary, `#FFE55C` accent
- **Gradientes Dinámicos**: Verde para títulos principales, dorado para acentos
- **Componentes Interactivos**: Hover states, animations y feedback visual
- **Responsive Design**: Optimizado para mobile, tablet y desktop

### 🗄️ **Backend & Base de Datos**

- **Supabase** (PostgreSQL con Row Level Security)
- **Stripe** para procesamiento de pagos y suscripciones
- **Hotmart API** para contenido educativo y cursos
- **Resend** para envío de emails transaccionales

### 🔐 **Autenticación & Seguridad**

- **Supabase Auth** con verificación por email
- **Políticas RLS** para seguridad a nivel de base de datos
- **Sistema de roles** (usuario, premium, admin)
- **Protección de rutas** por nivel de membresía
- **JWT tokens** para sesiones seguras

## 🌟 Páginas y Funcionalidades

### 📄 **Páginas Principales**

- **🏠 Home** - Landing page con hero animado y servicios destacados
- **🏢 Empresa** - Sobre nosotros, misión, visión, valores y equipo (Juan Salgado Blanco)
- **💼 Consultoría** - Formulario de consultoría con precios dinámicos y generación de informes
- **� AlgoFund** - Información sobre el fondo de inversión algorítmica (WFH) en Darwinex
- **�🛠️ BSB Maker** - Herramienta de análisis y creación de estrategias
- **🎓 Academia** - Contenido educativo y cursos especializados
- **� Formación** - Oferta formativa detallada y programas educativos
- **�💳 Membresías** - Planes de suscripción con animaciones bounce
- **� Contacto** - Página de contacto con información y formulario
- **⚖️ Legal** - Aviso legal, política de privacidad y cookies
- **�📊 Dashboard** - Panel de control personalizado por usuario

### 🎯 **Características Especiales**

- **Aurora Backgrounds** - Fondos animados con gradientes dinámicos
- **Glass Cards** - Tarjetas con efecto cristal y backdrop-blur
- **Testimonials Carousel** - Carrusel infinito con pausado en hover
- **Interactive Forms** - Formularios con validación en tiempo real
- **Mobile Optimization** - Experiencia perfecta en dispositivos móviles
- **PDF Reports** - Generación automática de resúmenes de consultoría

## 🌟 Mejoras Recientes de UI/UX

### 🌈 **Sistema de Colores Actualizado**

- ✅ **Amarillo brillante** actualizado de `#B8860B` a `#FFD700` (más vibrante)
- ✅ **Gradiente verde elegante** para títulos principales
- ✅ **Botones consistentes** - Amarillo dorado con texto gris oscuro
- ✅ **Botones de contacto** - Verde elegante con hover effects
- ✅ **Variables CSS optimizadas** para mejor mantenimiento

### 🎯 **Componentes Mejorados**

- ✅ **Logo system** - Negro en header, blanco en footer
- ✅ **Button styling** - Esquema consistente en todas las páginas
- ✅ **Card interactions** - Hover effects y animaciones de entrada con Framer Motion
- ✅ **Form enhancements** - Mejor UX en formularios de contacto
- ✅ **Mobile optimization** - Experiencia mejorada en dispositivos móviles

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Stripe
- Credenciales de Hotmart API

### 1. Clonar el Repositorio

```bash
git clone https://github.com/daamo31/bsbcapital.git
cd bsbcapital
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

### 3. Ejecutar el Proyecto

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

El proyecto estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── auth/                # Componentes de autenticación
│   ├── common/              # Componentes reutilizables
│   ├── layout/              # Layout y navegación
│   └── ui/                  # Componentes de interfaz
├── contexts/                # Context providers
├── hooks/                   # Custom hooks
├── lib/                     # Servicios y utilidades
├── locales/                 # Archivos de internacionalización
├── pages/                   # Páginas principales
│   ├── auth/                # Páginas de autenticación
│   ├── company/             # Páginas corporativas (Empresa, Contacto, Legal)
│   ├── services/            # Páginas de servicios (AlgoFund, Consultoría, etc.)
│   ├── payments/            # Páginas de pagos
│   └── admin/               # Panel administrativo
└── utils/                   # Funciones utilitarias
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

## 🧩 Componentes y Ejemplos de Uso

### 🎨 **Framer Motion Animations**

#### Card Hover Effects

```jsx
import { motion } from 'framer-motion';

<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
  className="card"
>
  {/* Contenido de la tarjeta */}
</motion.div>;
```

#### Page Transitions

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.div key={index} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>;
```

### 🎯 **Custom CSS Classes**

#### Gradientes de Texto

```jsx
// Verde elegante para títulos
<h1 className="main-gradient-text">BSB Capital</h1>

// Dorado brillante para acentos
<span className="accent-gradient-text">Premium</span>
```

#### Efectos de Fondo

```jsx
// Fondo aurora con gradientes dinámicos
<div className="aurora-background">
  <div className="relative z-10">Contenido</div>
</div>

// Tarjetas con efecto cristal
<div className="glass-card p-6">
  <p>Contenido con backdrop blur</p>
</div>
```

### 📱 **Responsive & Mobile Optimizations**

```css
/* Clases específicas para móviles */
.mobile-scroll-container {
  /* Scroll táctil optimizado */
}
.mobile-form-container {
  /* Formularios móviles */
}
.mobile-sticky-button {
  /* Botones sticky */
}

/* Animaciones adaptativas */
@media (max-width: 768px) {
  .aurora-background::before {
    filter: blur(20px);
    opacity: 0.4;
  }
}
```

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

#### `consultationPDFService.js`

Servicio para generar resúmenes de consultoría en formato PDF.

```javascript
// Generar PDF de resumen
const pdf = consultationPDFService.generateConsultationSummaryPDF(consultation, detailedData);

// Enviar email con PDF adjunto
await consultationPDFService.sendConsultationSummaryEmail(consultation, detailedData, clientEmail);
```

## 🛣️ Estructura de Rutas

### Rutas Públicas

- `/` - Página principal
- `/empresa` - Sobre nosotros
- `/servicios/algofund` - BSB Algo Fund
- `/membresias` - Planes de membresía
- `/contacto` - Página de contacto
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
- `/test/email` - Tester de plantillas de email
- `/test/responsive` - Verificación de responsividad

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

#### `/test/email` - Email Tester

- Prueba de envío de correos
- Visualización de plantillas
- Verificación de configuración de Resend

### Usuarios de Prueba

```javascript
// Credenciales de testing incluidas
const testCredentials = {
  email: 'test@bsbcapital.com',
  password: 'Test123456!',
};
```

## Sistema de Emails con Resend

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
- **consultation_summary**: Resumen PDF de consultoría
- **consultation_portfolio_optimization**: Consultoría Optimización de Cartera
- **consultation_crypto_web3**: Consultoría Crypto & Web3
- **consultation_crypto_onboarding**: Consultoría Onboarding Crypto
- **consultation_treasury_crypto**: Consultoría Gestión de Tesorería Crypto para Empresas
- **academia_bsb**: Acceso a Academia BSB
- **package_crypto_onboarding**: Paquete Onboarding Crypto
- **package_treasury_crypto**: Paquete Gestión Tesorería
- **package_investor_premium**: Paquete Inversor Premium
- **membership_annual**: Membresía Anual BSB Capital

### Uso del Servicio

```javascript
import emailService from '@/lib/emailService';

// Enviar email de bienvenida
await emailService.sendWelcomeEmail({
  name: 'Juan Pérez',
  email: 'juan@example.com',
});

// Enviar confirmación de compra
await emailService.sendPurchaseConfirmation({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  planName: 'Premium',
  amount: '$49/mes',
  transactionId: 'tx_123456',
});
```

## 🔧 Configuración de Hotmart

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
- `/docs/GUIA_TESTING_COMPLETA.md` - Testing exhaustivo del sistema
- `/docs/STRIPE_TEST_PRICES_SETUP.md` - Configuración de precios de prueba (€1)
- `/docs/IMPLEMENTACION_PRECIOS_TEST_COMPLETADA.md` - Resumen de implementación de testing

### Testing de Pagos con Stripe

Para probar el flujo completo de pagos sin costos significativos:

1. **Validar configuración de Price IDs de prueba**:

   ```bash
   node scripts/validate-test-price-ids.js
   ```

2. **Ejecutar en modo desarrollo**:

   ```bash
   npm run dev
   ```

3. **Navegar a paquetes/membresías**:
   - Ve a: `http://localhost:5173/academia/membresias-db`
   - Los precios se mostrarán en €1 automáticamente (modo desarrollo)
   - Completa un pago de prueba con tarjeta real (se cobrará €1)
   - Verifica la confirmación y registro en base de datos

📚 **Guía completa**: Ver [`docs/STRIPE_TEST_PRICES_SETUP.md`](docs/STRIPE_TEST_PRICES_SETUP.md) para instrucciones paso a paso de creación de productos en Stripe Dashboard.

### Contacto Técnico

- Issues en GitHub para bugs
- Documentación en `/docs` para dudas comunes

---

## 🔗 Enlaces Importantes

- 🌐 **Sitio Web**: [bsbcapital.io](https://bsbcapital.io)
- 📧 **Contacto**: info@bsbcapital.io
- 📱 **LinkedIn**: [BSB Capital](https://www.linkedin.com/company/bsb-capital-finance/)
- 📷 **Instagram**: [bsbcapital.io](https://www.instagram.com/bsbcapital.io)
- 💼 **GitHub**: [github.com/daamo31/bsbcapital](https://github.com/daamo31/bsbcapital)

## 📄 Licencia

© 2024 BSB Capital. Todos los derechos reservados.

---

**¡La plataforma financiera más avanzada con las mejores animaciones y UX del mercado! 🚀✨**
