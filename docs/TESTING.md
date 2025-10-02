# Guía de Testing - BSB Capital Academia

## 🧪 Cómo Probar Todo el Sistema

Esta guía te llevará paso a paso para probar todas las funcionalidades del sistema de membresías y academia de BSB Capital.

---

## 🚀 Quick Start - Prueba Rápida

### ⚡ **Prueba Express (5 minutos)**

1. **Abrir el proyecto:**
   ```bash
   npm run dev
   ```

2. **Ir directamente al sistema de testing:**
   ```
   http://localhost:5173/test
   ```

3. **¡Listo!** El modo premium se activa automáticamente y puedes probar todo.

---

## 🔧 Setup Inicial

### **1. Verificar que el Proyecto Está Funcionando**

```bash
# Instalar dependencias si no lo has hecho
npm install

# Iniciar servidor de desarrollo
npm run dev

# Debería abrir en http://localhost:5173
```

### **2. Verificar Variables de Entorno**

Asegúrate de tener el archivo `.env.local` con las credenciales:

```env
# Supabase (requerido para autenticación)
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Stripe (opcional para testing)
VITE_STRIPE_PUBLISHABLE_KEY=tu_stripe_key

# Hotmart (configurado para testing)
VITE_HOTMART_CLIENT_ID=tu_hotmart_client_id
VITE_HOTMART_CLIENT_SECRET=tu_hotmart_client_secret
VITE_HOTMART_PRODUCT_ID=tu_hotmart_product_id
```

---

## 📋 Plan de Testing Completo

### **Fase 1: Testing Básico (Sin Cuenta)**

#### **🌐 Test de Rutas Públicas**

1. **Página Principal** - `http://localhost:5173/`
   - ✅ Debería cargar la landing page
   - ✅ Navegación funcional en el header
   - ✅ Links a diferentes secciones

2. **Información Corporativa**
   - `/empresa` - Información de la empresa
   - `/contacto` - Formulario de contacto
   - `/blog` - Sección de blog
   - `/membresias` - Planes de suscripción

3. **Servicios**
   - `/bsb-maker` - Servicio BSB Maker
   - `/consultoria` - Consultoría financiera
   - `/formacion` - Información educativa

**✅ Resultado Esperado:** Todas las páginas cargan correctamente sin errores.

#### **🧪 Test del Sistema de Testing**

1. **Panel Principal de Testing** - `http://localhost:5173/test`
   ```
   ✅ Debería mostrar:
   - Dashboard de testing con cards organizadas
   - Indicador de "Modo Premium Simulado Activo" (corona morada)
   - Botón "Ejecutar Test Completo"
   - Grid de navegación con diferentes tests
   ```

2. **Ejecutar Test Completo**
   - Hacer clic en "Ejecutar Test Completo"
   - ✅ Debería mostrar resultados de 4 tests:
     - Autenticación (puede mostrar error si no hay usuario)
     - Control de Acceso (✅ success por modo simulado)
     - Suscripción (✅ success con datos mock)
     - Integración Hotmart (✅ success con datos mock)

### **Fase 2: Testing con Autenticación**

#### **👤 Crear/Usar Cuenta de Prueba**

**Opción A: Usar Credenciales de Test**
- Ve a `http://localhost:5173/test/user-status`
- Usa las credenciales mostradas en pantalla
- Haz clic en "Login Automático"

**Opción B: Crear Nueva Cuenta**
1. Ve a `http://localhost:5173/signup`
2. Crea una cuenta con email real
3. Verifica el email (revisa tu bandeja de entrada)
4. Inicia sesión en `http://localhost:5173/login`

#### **🔐 Test de Autenticación**

1. **Dashboard de Usuario** - `http://localhost:5173/dashboard`
   ```
   ✅ Debería mostrar:
   - Información del usuario logueado
   - Resumen de membresía
   - Accesos rápidos a diferentes secciones
   ```

2. **Test de Estado de Usuario** - `http://localhost:5173/test/user-status`
   ```
   ✅ Debería mostrar:
   - ✅ Usuario autenticado
   - Email del usuario
   - Estado de la suscripción
   - Información de acceso
   ```

### **Fase 3: Testing de la Academia**

#### **🎓 Academia Principal**

1. **Dashboard de Academia** - `http://localhost:5173/academia`
   ```
   ✅ Debería mostrar:
   - 👑 Indicador "Modo Premium Simulado Activo"
   - Cards de navegación organizadas por secciones
   - Estado del usuario con badges
   - Todas las opciones desbloqueadas
   ```

2. **Navegación entre Secciones**
   - Hacer clic en cada card para navegar
   - ✅ Todas deberían ser accesibles (no mostrar 🔒)

#### **📚 Catálogo de Cursos**

1. **Ver Catálogo** - `http://localhost:5173/academia/catalogo`
   ```
   ✅ Debería mostrar:
   - Lista de cursos disponibles
   - Información de cada curso (título, descripción, nivel)
   - Botones de acceso sin restricciones
   ```

#### **🎥 Contenido Premium**

1. **Acceder al Contenido** - `http://localhost:5173/academia/contenido`
   ```
   ✅ Debería mostrar:
   - Contenido premium desbloqueado
   - Videos, documentos y recursos
   - Sin mensajes de "acceso denegado"
   ```

### **Fase 4: Testing de Hotmart**

#### **🎬 Player de Hotmart**

1. **Test de Hotmart** - `http://localhost:5173/test/hotmart`
   ```
   ✅ Debería mostrar:
   - 👑 Indicador de modo premium simulado
   - Controles de test con 3 modos:
     - Demo Visual
     - Mock Hotmart  
     - API Real
   ```

2. **Probar Cada Modo:**

   **Modo Demo:**
   - Simulación visual del reproductor
   - Player ficticio con gradiente
   - Botón de "Reproducir Demo"

   **Modo Mock:**
   - Lista de videos simulados
   - Videos de prueba reales (Big Buck Bunny, etc.)
   - Recursos descargables simulados
   - Progreso de reproducción mock

   **Modo API Real:**
   - Conexión real con Hotmart API
   - Reproductor nativo HTML5
   - Videos reales si las credenciales están configuradas

#### **📹 Reproducción de Video**

1. **Seleccionar un Video en Modo Mock**
   ```
   ✅ Debería:
   - Cargar el video real desde Google Cloud Storage
   - Mostrar controles de reproducción estándar
   - Permitir pausa, adelantar, retroceder
   - Mostrar duración y progreso
   ```

### **Fase 5: Testing de Funcionalidades Avanzadas**

#### **🛠️ Herramientas de Testing**

1. **Demo de Acceso** - `http://localhost:5173/test/tools`
   ```
   ✅ Debería mostrar:
   - Componentes de demostración
   - Tests de acceso granular
   - Ejemplos de uso de hooks
   ```

#### **⚙️ Administración (Si Aplica)**

1. **Panel de Admin** - `http://localhost:5173/academia/admin`
   ```
   ⚠️ Puede mostrar:
   - Acceso denegado (si no eres admin)
   - O panel de administración (si tienes permisos)
   ```

### **Fase 6: Testing de Responsive Design**

#### **📱 Probar en Diferentes Dispositivos**

1. **Abrir Developer Tools** (F12)
2. **Activar modo de dispositivo** (Ctrl/Cmd + Shift + M)
3. **Probar diferentes tamaños:**
   - 📱 iPhone SE (375px)
   - 📱 iPhone 12 Pro (390px)
   - 💻 iPad (768px)
   - 🖥️ Desktop (1200px+)

**En cada tamaño:**
```
✅ Verificar que:
- La navegación se adapta correctamente
- Los botones son accesibles
- El reproductor de video funciona
- Los modales y diálogos se ven bien
- No hay overflow horizontal
```

---

## 🔍 Checklist de Testing Completo

### **✅ Funcionalidades Básicas**
- [ ] Navegación entre páginas públicas
- [ ] Carga correcta de estilos y componentes
- [ ] Formularios de contacto funcionales
- [ ] Links externos funcionando

### **✅ Autenticación**
- [ ] Registro de nuevos usuarios
- [ ] Inicio de sesión
- [ ] Recuperación de contraseña
- [ ] Logout
- [ ] Redirecciones correctas tras login

### **✅ Sistema de Membresías**
- [ ] Visualización de planes
- [ ] Proceso de selección de plan
- [ ] Simulación de acceso premium en modo test

### **✅ Academia**
- [ ] Dashboard principal con navegación
- [ ] Catálogo de cursos accesible
- [ ] Contenido premium desbloqueado en modo test
- [ ] Indicadores visuales de estado premium

### **✅ Integración Hotmart**
- [ ] Player de testing con múltiples modos
- [ ] Reproducción de videos de prueba
- [ ] Datos mock realistas
- [ ] Indicadores de modo premium simulado

### **✅ Responsive Design**
- [ ] Funciona en móvil (375px+)
- [ ] Funciona en tablet (768px+)
- [ ] Funciona en desktop (1200px+)
- [ ] Navegación touch-friendly

### **✅ Performance**
- [ ] Carga rápida de páginas
- [ ] Videos se reproducen sin problemas
- [ ] Sin errores en consola del navegador
- [ ] Transiciones suaves

---

## 🐛 Solución de Problemas Comunes

### **❌ "Error de Conexión a Supabase"**
```bash
# Verificar variables de entorno
cat .env.local

# Asegurarse de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén correctas
```

### **❌ "Videos No Cargan"**
```bash
# Los videos de prueba usan URLs externas
# Verificar conexión a internet
# Probar en modo "Demo" si hay problemas con URLs externas
```

### **❌ "Modo Premium No Se Activa"**
```bash
# Verificar que estás en rutas de testing:
# /test/*
# /hotmart/*

# El hook useUserAccess detecta automáticamente estas rutas
```

### **❌ "Página en Blanco"**
```bash
# Verificar la consola del navegador (F12)
# Buscar errores de JavaScript
# Verificar que todas las dependencias están instaladas:
npm install
```

---

## 📊 Resultados Esperados por Sección

### **🧪 `/test` - Sistema de Testing**
- ✅ Modo premium automático activo
- ✅ 4 tests del sistema ejecutables
- ✅ Navegación completa funcional
- ✅ Indicadores visuales claros

### **🎥 `/test/hotmart` - Player Hotmart**
- ✅ 3 modos de testing disponibles
- ✅ Videos de prueba reales reproducibles
- ✅ Interfaz responsive
- ✅ Controles de video funcionales

### **🎓 `/academia` - Academia Principal**
- ✅ Dashboard con navegación visual
- ✅ Acceso desbloqueado a todo contenido
- ✅ Indicadores de estado premium
- ✅ Cards organizadas por categorías

### **👤 `/dashboard` - Panel Usuario**
- ✅ Información de usuario mostrada
- ✅ Estado de membresía visible
- ✅ Navegación a otras secciones
- ✅ Interface personalizada

---

## 🎯 Tests de Aceptación Final

Antes de considerar el testing completo, verifica:

1. **✅ Flujo Completo de Usuario:**
   - Registro → Login → Academia → Contenido Premium

2. **✅ Modo Premium Simulado:**
   - Se activa automáticamente en rutas de test
   - Proporciona acceso completo al contenido
   - Muestra indicadores visuales apropiados

3. **✅ Integración Hotmart:**
   - Player nativo funcional
   - Videos de prueba reproducibles
   - Múltiples modos de testing

4. **✅ Responsive y UX:**
   - Funciona en todos los dispositivos
   - Navegación intuitiva
   - Feedback visual claro

¡Si todos estos tests pasan, el sistema está completamente funcional! 🎉

---

## 📞 Si Encuentras Problemas

1. **Revisar la consola del navegador** (F12) para errores
2. **Verificar las variables de entorno** en `.env.local`
3. **Probar en modo incógnito** para descartar problemas de caché
4. **Verificar la conexión a internet** para videos externos

¡Happy Testing! 🚀