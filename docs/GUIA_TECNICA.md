# 🛠️ Guía Técnica y de Desarrollo - BSB Capital

Este documento es la referencia técnica completa para el desarrollo y mantenimiento del sistema BSB Capital. Cubre desde la arquitectura base hasta las implementaciones especializadas de seguridad y datos.

---

## 🏗️ 1. Arquitectura y Stack Tecnológico

BSB Capital es una Progressive Web App (PWA) moderna:

- **Core**: React 18 + Vite.
- **Backend & Auth**: Supabase.
- **Estilos**: Tailwind CSS + Framer Motion para animaciones premium.
- **Pagos**: Stripe para suscripciones y pagos únicos.

---

## 🚀 2. Patrones de Implementación (Hooks y Contextos)

El sistema se basa en contextos globales para evitar el "prop drilling" y hooks personalizados para la lógica de negocio.

### Gestión de Autenticación (`useAuth`)

El `SupabaseAuthContext` gestiona la sesión y el perfil del usuario de forma reactiva.

```javascript
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ComponenteProtegido = () => {
  const { user, profile, signOut } = useAuth();

  if (!user) return <p>Inicia sesión para continuar.</p>;

  return (
    <div>
      <h1>Bienvenido, {profile?.full_name}</h1>
      <button onClick={signOut}>Cerrar Sesión</button>
    </div>
  );
};
```

### Control de Acceso y Academia (`useUserAccess`)

Este hook valida el rol y la suscripción activa del usuario en Supabase.

```javascript
import { useUserAccess } from '@/hooks/useUserAccess';

const VisualizadorVideo = ({ videoId }) => {
  const { hasAccess, isLoading } = useUserAccess();

  if (isLoading) return <Loader />;
  if (!hasAccess) return <LockMessage />;

  return hasAccess ? <ProtectedContent /> : <LockMessage />;
};
```

---

## 🗺️ 3. Mapa Técnico de Rutas y Componentes

### Estructura de Rutas (`App.jsx`)

Las rutas están organizadas por responsabilidades:

- **Públicas**: `Landing`, `Empresa`, `Contacto`, `Blog`.
- **Protegidas**: Envueltas en `SupabaseAuthContext` para asegurar que el `user` esté disponible.
- **Admin**: Rutas bajo `/academia/admin` que verifican el `role === 'admin'` del perfil.

---

## 🛡️ 4. Desarrollo de Nuevas Funcionalidades (Recetas)

### Cómo Añadir un Nuevo Curso a la Academia

1.  **Stripe**: Crea el precio y añade su ID al catálogo permitido de la Edge Function.
2.  **Base de Datos**: Añade metadatos y la URL del contenido en `course_content`.
3.  **UI**: `ContentPlayer` carga el recurso y registra el progreso del usuario.

### Implementación del Sistema Anti-Bot

Si creas un nuevo formulario de alta, aplica estas tres protecciones:

```javascript
// 1. Honeypot (Campo trampa)
<input type="text" style={{ display: 'none' }} name="hp_field" />;

// 2. Validación de Tiempo
const startTime = useRef(Date.now());
const handleSubmit = () => {
  if (Date.now() - startTime.current < 3000) return alert('Bot detectado');
};

// 3. Interacciones
// El hook 'useBotProtection' ya está disponible para inyectar esta lógica.
```

---

## 🔧 5. Mantenimiento y Calidad de Código

### Estándares JSDoc

Mantener la documentación actualizada es vital:

```javascript
/**
 * Procesa un pago fallido y notifica al usuario.
 * @param {string} sessionId - ID de la sesión de Stripe.
 * @throws {Error} Si el ID no es válido.
 */
```

### Git Hooks (Husky)

Al intentar un `git commit`, el sistema ejecutará:

1.  **Prettier**: Formatea el código automáticamente.
2.  **ESLint**: Verifica que no haya variables sin usar o errores de sintaxis.
3.  **Vitest**: (Configurable) Puede correr los tests de la rama antes de permitir el commit.
