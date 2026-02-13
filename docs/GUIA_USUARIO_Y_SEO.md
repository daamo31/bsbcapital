# 📦 Guía de Usuario, Producto y SEO - BSB Capital

Este documento es el manual definitivo para entender el producto BSB Capital, cómo operarlo como usuario y cómo mantener su excelencia en visibilidad web (SEO).

---

## 🚪 1. Manual del Usuario y Operativa de Producto

### Registro y Acceso Seguro

1.  **Registro**: Accede a `/signup`. El sistema valida tu email y aplica protección anti-bot invisible.
2.  **Verificación**: Revisa tu bandeja de entrada. Hasta que no verifiques tu email, el acceso a la Academia estará bloqueado.
3.  **Perfil**: En `/area-cliente > Mi Perfil` puedes actualizar tu nombre y gestionar tu contraseña de forma segura.

### Academia y Formación (Manual Paso a Paso)

- **Catálogo de Cursos**: Explora `/academia/catalogo`. Aquí verás qué cursos están incluidos en tu plan actual.
- **Reproducción de Contenido**:
  - Haz clic en cualquier lección.
  - El sistema usa un **Player Inteligente** que sincroniza tu progreso. Si cierras la pestaña, al volver retomarás el video en el mismo segundo.
  - **Recursos**: Siempre revisa la pestaña lateral de "Recursos" para descargar los materiales complementarios (PDFs, Excel).

### Gestión de Suscripciones

1.  Ve a `/area-cliente > Suscripciones`.
2.  Verás el estado real de tu plan (Activo, Cancelado, Pendiente de pago).
3.  **Cancelar**: No necesitas llamar a soporte. Haz clic en "Gestionar en Stripe" y el portal seguro te permitirá cancelar con un clic. La web se actualizará automáticamente mediante webhooks.

---

## ✨ 2. Funcionalidades del Producto (BSB Maker & Consultoría)

### BSB Maker

Sistema de trading algorítmico. Permite capturar leads interesados a través de un formulario de pre-registro optimizado que valida la intención del usuario.

### Consultorías Privadas

Calendario inteligente que:

- Previene solapamientos de citas.
- Sincroniza zonas horarias automáticamente.
- Requiere un formulario técnico previo para que la sesión sea 100% productiva.

---

## 🚀 3. "Mastering SEO": Guía Práctica y Ejemplos

Bsb Capital utiliza `react-helmet` para una gestión dinámica del SEO. A continuación, ejemplos reales de cómo implementar o actualizar metadatos.

### Ejemplo: Añadir SEO a una Nueva Página

Cada vista principal (Page) debe envolver su contenido con el componente `<Helmet>`.

```javascript
import { Helmet } from 'react-helmet';

const NuevaPagina = () => (
  <>
    <Helmet>
      {/* 1. Títulos y Descripciones Estándar */}
      <title>Título Atractivo | BSB Capital</title>
      <meta name="description" content="Descripción de 155 caracteres optimizada para Google." />
      <link rel="canonical" href="https://bsbcapital.io/nueva-pagina" />

      {/* 2. Open Graph (WhatsApp, LinkedIn, Facebook) */}
      <meta property="og:title" content="Título para Redes Sociales" />
      <meta property="og:description" content="Resumen visual para compartir." />
      <meta property="og:image" content="https://tu-cdn.com/imagen-previsualizacion.jpg" />
      <meta property="og:url" content="https://bsbcapital.io/nueva-pagina" />
    </Helmet>

    {/* Contenido de la página */}
  </>
);
```

### Datos Estructurados (JSON-LD) para Google

Para que Google muestre "Breadcrumbs" enriquecidos en sus resultados, inyectamos un script `application/ld+json` dentro del Helmet:

```javascript
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://bsbcapital.io/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Servicio',
        item: 'https://bsbcapital.io/servicio',
      },
    ],
  })}
</script>
```

---

## ⚡ 4. Optimización de Rendimiento (WPO)

- **Lazy Loading**: Todas las imágenes fuera de la pantalla inicial deben usar `loading="lazy"`.
- **Sitemap**: El archivo `public/sitemap.xml` se actualiza automáticamente para asegurar que Google indexe todo el contenido.

---

## 🎨 5. Guía de Estilo y Branding

- **Paleta**: Dorados premium (`#D4AF37`), fondos oscuros (`#030712`) alternos con blancos para separar secciones.
- **Tipografía**: Fuentes modernas (Inter/Outfit) para máxima legibilidad.
