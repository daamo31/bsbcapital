# Guía Técnica: SEO y Rendimiento

Este documento detalla la implementación técnica de las estrategias de SEO y las optimizaciones de rendimiento en la aplicación web de BSB Capital.

---

## 🚀 Rendimiento (Performance)

La web ha sido optimizada para asegurar tiempos de carga rápidos y una mejor experiencia de usuario.

### 1. Lazy Loading (Carga Diferida)

Hemos implementado **Code Splitting** utilizando `React.lazy` y `Suspense`.

**¿Qué hace?**
En lugar de descargar toda la aplicación (todos los servicios, dashboard, admin, etc.) cuando un usuario entra a la Home, ahora **solo se descarga lo necesario para la página actual**.

**Implementación en `App.jsx`:**

```javascript
// Antes (Import estático - Carga todo al inicio)
import Consultoria from '@/pages/services/Consultoria';

// Ahora (Import dinámico - Carga bajo demanda)
const Consultoria = lazy(() => import('@/pages/services/Consultoria'));
```

**Beneficios:**

- **LCP (Largest Contentful Paint) más rápido:** La página principal carga casi instantáneamente.
- **Menor consumo de datos:** Los usuarios no descargan código de páginas que no visitan.
- **Mejor puntuación en Google PageSpeed:** Google premia las webs que no bloquean el hilo principal con bundles gigantes.

### 2. Optimización de Construcción (Vite)

Usamos **Vite** para la compilación, configurado para separar los archivos CSS y generar "chunks" (fragmentos) de código con nombres únicos (hashes) para un **cacheo eficiente** en el navegador.

### 3. Optimización de Imágenes

Hemos integrado `vite-plugin-image-optimizer` para comprimir automáticamente las imágenes durante el proceso de build.

- **Formatos:** JPG, PNG, WebP, SVG, AVIF.
- **Configuración:** Calidad de ~80% para un equilibrio óptimo entre peso y visualización.
- **Resultado:** Reducciones de tamaño de hasta un 80% en imágenes pesadas sin pérdida perceptible de calidad.

### 4. Optimización de Fuentes (Fonts)

Para evitar el "bloqueo de renderizado" (que la web no muestre texto hasta que cargue la fuente), hemos optimizado la carga de Google Fonts:

- **Ubicación:** Movido de `@import` en CSS a `<link>` en `index.html`.
- **Parallelización:** Permite que el navegador descargue la fuente mientras lee el CSS.
- **`display: swap`:** Asegurado en todos los imports para que el texto se muestre inmediatamente con una fuente del sistema si la personalizada tarda en cargar.

---

## 🔍 SEO Técnico (Search Engine Optimization)

Hemos implementado una estrategia de SEO avanzada para maximizar la visibilidad en buscadores.

### 1. Etiquetas Meta y Títulos (`<Helmet>`)

Cada página crítica (`Home`, `Empresa`, `Consultoría`, `Academia`, `Paquetes`) tiene sus etiquetas `<title>`, `<meta name="description">`, `<link rel="canonical">` y `<meta name="keywords">` personalizadas.

**Ubicación:** Dentro del componente de cada página, usando `react-helmet`.

### 2. Datos Estructurados (Schema.org - JSON-LD)

Hemos inyectado código JSON-LD para ayudar a Google a entender qué es cada página y mostrar **resultados enriquecidos** (Rich Snippets).

| Página             | Tipo de Schema     | Propósito                                                   |
| :----------------- | :----------------- | :---------------------------------------------------------- |
| **Home / Empresa** | `Organization`     | Identidad corporativa, logo, redes sociales.                |
| **Consultoría**    | `FinancialService` | Define el servicio de asesoramiento financiero.             |
| **Academia**       | `Course`           | Permite aparecer en carruseles de cursos de Google.         |
| **Paquetes**       | `Product`          | Muestra precios y rangos de ofertas directamente en Google. |

**Ejemplo de implementación:**

```javascript
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'BSB Academy',
    // ...
  })}
</script>
```

### 3. Mapa del Sitio Dinámico (`sitemap.xml`)

Hemos automatizado la generación del sitemap. Ya no es necesario editarlo a mano.

- **Script:** `scripts/generate-sitemap.js`
- **Funcionamiento:** Cada vez que se ejecuta `npm run build`, este script se ejecuta automáticamente (gracias al hook `postbuild` en `package.json`), escanea las rutas definidas y regenera `public/sitemap.xml` con la fecha de última modificación actual.

### 4. Archivo `robots.txt`

Configurado en `public/robots.txt` para:

- Indicar a Google dónde está el sitemap.
- Bloquear el acceso de rastreadores a áreas privadas como `/dashboard`, `/admin` o `/area-cliente` para no desperdiciar el presupuesto de rastreo (crawl budget).

---

## 🛠 Mantenimiento

### Cómo añadir una nueva página al Sitemap

1.  Abre `scripts/generate-sitemap.js`.
2.  Añade la nueva ruta al array `routes`:
    ```javascript
    { path: '/nueva-pagina', priority: '0.7', changefreq: 'monthly' },
    ```
3.  Ejecuta `npm run build` o `node scripts/generate-sitemap.js`.

### Cómo verificar el SEO

1.  **Títulos y Metas:** Abrir la web, inspeccionar elemento (`F12`) y mirar en `<head>`.
2.  **Schema:** Usar la herramienta [Rich Results Test](https://search.google.com/test/rich-results) de Google.
3.  **Sitemap:** Visitar `https://bsbcapital.io/sitemap.xml`.
