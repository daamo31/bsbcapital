# Documentación de Rutas - BSB Capital

## 🗺️ Mapa Completo de Navegación

Esta es la guía completa de todas las páginas y secciones disponibles en la plataforma BSB Capital.

---

## 🌐 Rutas Públicas
*Accesibles sin necesidad de iniciar sesión*

### 🏠 **Página Principal** - `/`
- **Descripción**: Página de inicio de BSB Capital
- **Contenido**: Información corporativa, servicios, call-to-actions
- **Acceso**: Todos los visitantes
- **Funciones**: Navegación a otras secciones, registro, información general

### 💼 **Servicios Corporativos**

#### **BSB Maker** - `/bsb-maker`
- **Descripción**: Servicio de creación de estrategias de inversión
- **Contenido**: Información del servicio, beneficios, casos de uso
- **Acceso**: Público

#### **Consultoría** - `/consultoria`
- **Descripción**: Servicios de consultoría financiera personalizada
- **Contenido**: Tipos de consultoría, proceso, precios
- **Acceso**: Público

#### **AlgoFund** - `/algo-fund`
- **Descripción**: Fondo de inversión algorítmica
- **Contenido**: Información del fondo, rendimientos, estrategia
- **Acceso**: Público

#### **Otros Servicios** - `/otros-servicios`
- **Descripción**: Servicios adicionales de BSB Capital
- **Contenido**: Lista de servicios complementarios
- **Acceso**: Público

#### **Formación** - `/formacion`
- **Descripción**: Información sobre programas educativos
- **Contenido**: Cursos disponibles, metodología, certificaciones
- **Acceso**: Público

### 🏢 **Información Corporativa**

#### **Empresa** - `/empresa`
- **Descripción**: Información sobre BSB Capital
- **Contenido**: Historia, misión, visión, equipo
- **Acceso**: Público

#### **Contacto** - `/contacto`
- **Descripción**: Formulario de contacto y información
- **Contenido**: Formulario, direcciones, teléfonos, mapa
- **Acceso**: Público

#### **Legal** - `/legal/:page`
- **Descripción**: Documentos legales y políticas
- **Contenido**: Términos, privacidad, cookies
- **Páginas**: `/legal/terminos`, `/legal/privacidad`, `/legal/cookies`
- **Acceso**: Público

### 📚 **Contenido Educativo Público**

#### **Blog** - `/blog`
- **Descripción**: Artículos y noticias financieras
- **Contenido**: Posts educativos, análisis de mercado, noticias
- **Acceso**: Público

#### **Guía de Inversión** - `/guia-inversion`
- **Descripción**: Guía básica para inversores
- **Contenido**: PDF descargable con conceptos básicos
- **Acceso**: Público

---

## 🔐 Rutas de Autenticación
*Para crear cuentas e iniciar sesión*

### **Inicio de Sesión** - `/login`
- **Descripción**: Formulario de inicio de sesión
- **Funciones**: Login con email/contraseña, recuperación de contraseña
- **Acceso**: Usuarios no autenticados
- **Redirección**: Tras login exitoso → `/dashboard`

### **Registro** - `/signup`
- **Descripción**: Formulario de registro de nuevos usuarios
- **Funciones**: Crear cuenta, verificación de email
- **Acceso**: Usuarios no autenticados
- **Proceso**: Registro → Verificación email → Login

---

## 👤 Rutas de Usuario Autenticado
*Requieren iniciar sesión*

### **Dashboard Principal** - `/dashboard`
- **Descripción**: Panel principal del usuario
- **Contenido**: Resumen de cuenta, accesos rápidos, estado de membresía
- **Funciones**: Navegación a academia, perfil, suscripciones
- **Acceso**: ✅ Usuario autenticado

---

## 💳 Rutas de Membresías y Pagos

### **Planes de Membresía** - `/membresias`
- **Descripción**: Catálogo de planes de suscripción
- **Contenido**: Comparación de planes, precios, características
- **Funciones**: Selección de plan, inicio de proceso de pago
- **Acceso**: Público (compra requiere registro)

### **Proceso de Pago** - `/checkout`
- **Descripción**: Página de finalización de compra
- **Funciones**: Formulario de pago con Stripe
- **Acceso**: ✅ Usuario autenticado + plan seleccionado

### **Compra Exitosa** - `/compra-exitosa`
- **Descripción**: Confirmación de compra completada
- **Contenido**: Detalles de la compra, próximos pasos
- **Acceso**: ✅ Usuario autenticado + compra reciente

---

## 🎓 Rutas de la Academia
*Sistema educativo principal*

### **Academia Principal** - `/academia`
- **Descripción**: Dashboard principal de la academia
- **Contenido**: Navegación visual, estado de acceso, rutas disponibles
- **Funciones**: Acceso a catálogo, contenido premium, herramientas de test
- **Acceso**: ✅ Usuario autenticado

### **Catálogo de Cursos** - `/academia/catalogo`
- **Descripción**: Lista completa de cursos disponibles
- **Contenido**: Cursos gratuitos y premium, descripciones, niveles
- **Funciones**: Explorar cursos, ver detalles, inscribirse
- **Acceso**: ✅ Usuario autenticado

### **Mi Contenido** - `/academia/contenido`
- **Descripción**: Contenido premium del usuario
- **Contenido**: Videos exclusivos, materiales descargables, cursos completos
- **Funciones**: Reproducir videos, descargar PDFs, seguimiento de progreso
- **Acceso**: 👑 **Membresía Premium Requerida**

### **Módulo Específico** - `/academia/modulo/:moduleId`
- **Descripción**: Contenido de un módulo específico
- **Contenido**: Videos del módulo, materiales, ejercicios
- **Funciones**: Reproducción secuencial, descarga de recursos
- **Acceso**: 👑 **Membresía Premium Requerida**

### **Panel de Administración** - `/academia/admin`
- **Descripción**: Gestión de contenido y usuarios (solo administradores)
- **Funciones**: Crear/editar cursos, gestionar usuarios, estadísticas
- **Acceso**: 🔒 **Solo Administradores**

---

## 🧪 Rutas de Testing y Desarrollo
*Para pruebas y verificación del sistema*

### **Sistema de Testing Principal** - `/test`
- **Descripción**: Panel completo de testing del sistema
- **Funciones**: Verificación de autenticación, acceso, integración Hotmart
- **Características**: Modo premium automático, tests de sistema
- **Acceso**: Público (con simulación automática de premium)

### **Test de Hotmart** - `/test/hotmart`
- **Descripción**: Reproductor de prueba para contenido Hotmart
- **Funciones**: Modo demo, mock y real; reproductor nativo
- **Características**: Videos de prueba reales, simulación de acceso
- **Acceso**: Público (con simulación automática de premium)

### **Estado del Usuario** - `/test/user-status`
- **Descripción**: Verificación del estado del usuario y credenciales
- **Funciones**: Mostrar info de autenticación, suscripción, acceso
- **Características**: Credenciales de prueba incluidas
- **Acceso**: Público

### **Herramientas de Testing** - `/test/tools`
- **Descripción**: Utilidades adicionales para desarrollo
- **Funciones**: Demos de componentes, tests de acceso
- **Acceso**: Público

---

## ⚙️ Rutas de Administración

### **Panel de Accesos** - `/panel/accesos`
- **Descripción**: Gestión de permisos y accesos de usuarios
- **Funciones**: Ver usuarios, modificar permisos, gestionar suscripciones
- **Acceso**: 🔒 **Solo Administradores**

---

## 🔄 Rutas de Redirección y Transiciones

### **Rutas Legacy**
Estas rutas redirigen automáticamente para mantener compatibilidad:
- `/app` → `/dashboard`
- `/area-cliente` → `/dashboard`
- `/client-dashboard` → `/dashboard`
- `/academia-legacy` → `/formacion`

---

## 📱 Comportamiento por Tipo de Usuario

### 👤 **Usuario No Autenticado**
**Puede Acceder a:**
- ✅ Todas las rutas públicas
- ✅ Páginas de autenticación (`/login`, `/signup`)
- ✅ Rutas de testing (con simulación automática)

**Será Redirigido a `/login` si intenta:**
- ❌ Dashboard o rutas de usuario
- ❌ Academia (excepto testing)
- ❌ Proceso de pago

### 👤 **Usuario Autenticado (Sin Membresía)**
**Puede Acceder a:**
- ✅ Todo lo anterior
- ✅ Dashboard personal
- ✅ Catálogo de la academia
- ✅ Proceso de compra de membresías

**Verá Mensaje de "Membresía Requerida" en:**
- 🔒 Contenido premium de la academia
- 🔒 Módulos específicos de cursos

### 👑 **Usuario con Membresía Premium**
**Puede Acceder a:**
- ✅ Todo lo anterior
- ✅ Contenido premium completo
- ✅ Módulos específicos
- ✅ Videos y materiales exclusivos

### 🔒 **Administrador**
**Puede Acceder a:**
- ✅ Todo lo anterior
- ✅ Panel de administración de academia
- ✅ Gestión de accesos y usuarios

---

## 🎯 Rutas Especiales con Funcionalidades Únicas

### 🧪 **Modo Testing Automático**
Las siguientes rutas activan automáticamente el modo premium simulado:
- `/test/*` (todas las rutas de testing)
- `/hotmart/*` (rutas específicas de Hotmart)

**Características del Modo Testing:**
- 👑 Acceso premium automático
- 🎥 Videos de prueba reales
- 📁 Datos mock realistas
- 🔄 Bypass de verificaciones de suscripción

### 📱 **Responsividad**
Todas las rutas están optimizadas para:
- 🖥️ Desktop (1200px+)
- 💻 Laptop (768px - 1199px)
- 📱 Tablet (480px - 767px)
- 📱 Mobile (< 480px)

---

## 🚀 Navegación Recomendada para Nuevos Usuarios

### **Para Visitantes:**
1. `/` → Conocer BSB Capital
2. `/formacion` → Ver oferta educativa
3. `/membresias` → Comparar planes
4. `/signup` → Crear cuenta

### **Para Usuarios Nuevos:**
1. `/login` → Iniciar sesión
2. `/dashboard` → Ver panel personal
3. `/academia` → Explorar academia
4. `/academia/catalogo` → Ver cursos disponibles

### **Para Testing/Desarrollo:**
1. `/test` → Panel principal de testing
2. `/test/hotmart` → Probar reproductor
3. `/test/user-status` → Verificar estado
4. `/academia` → Probar con acceso premium simulado

Esta documentación te ayudará a navegar eficientemente por toda la plataforma BSB Capital. ¡Cada ruta está diseñada para ofrecerte la mejor experiencia posible! 🎯