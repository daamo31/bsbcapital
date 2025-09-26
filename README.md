# BSB Capital - Plataforma de Inversión y Academia

Una plataforma moderna de inversión y formación financiera desarrollada con React, Vite y Tailwind CSS.

## 🚀 Características

- **Página web corporativa** con diseño moderno y responsive
- **Academia de formación** integrada con Hotmart
- **Panel de cliente** con autenticación Supabase
- **Múltiples idiomas** (Español/Inglés)
- **Componentes UI personalizados** con Tailwind CSS
- **Integración con Stripe** para pagos

## 🛠️ Tecnologías

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Pagos**: Stripe, Hotmart
- **Internacionalización**: i18next
- **Animaciones**: Framer Motion
- **UI Components**: Radix UI, Lucide Icons

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración

### Variables de Entorno

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🌟 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas principales
├── contexts/           # Contextos de React
├── lib/               # Utilidades y configuración
├── locales/           # Archivos de traducción
└── assets/            # Recursos estáticos
```

## 📱 Páginas Principales

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
