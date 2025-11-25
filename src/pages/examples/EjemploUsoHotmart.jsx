import React from 'react';
import HotmartIframePlayer from '@/components/hotmart/HotmartIframePlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card';

/**
 * EJEMPLO DE USO - Integración Profesional con Hotmart
 * 
 * Este archivo muestra cómo implementar la integración embebida
 * recomendada para mostrar contenido de Hotmart en tu web.
 * 
 * BENEFICIOS:
 * - Los usuarios nunca salen de tu sitio
 * - Mantiene tu branding y diseño
 * - Experiencia fluida y profesional
 * - Control total de la presentación
 */

const EjemploUsoHotmart = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🎯 Ejemplo de Uso - Hotmart Embebido</CardTitle>
          <CardDescription>
            Así es como implementas la integración profesional en cualquier página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Ejemplo 1: Video principal de bienvenida */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                📚 Ejemplo 1: Módulo de Bienvenida
              </h3>
              <HotmartIframePlayer
                contentId="modulo_0_bienvenida"
                title="Módulo 0: Bienvenida y Mentalidad Inversora"
                description="Video de introducción a la academia con píldora formativa sobre inflación"
                hotmartVideoId="bienvenida-mentalidad-inversora"
                customHeight="450px"
                allowFullscreen={true}
              />
            </div>

            {/* Ejemplo 2: Módulo específico */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                🎯 Ejemplo 2: Módulo de Gestión de Riesgo
              </h3>
              <HotmartIframePlayer
                contentId="modulo_1_riesgo"
                title="Fundamentos de Gestión del Riesgo"
                description="Aprende las bases para proteger tu capital de inversión"
                hotmartVideoId="gestion-riesgo-fundamentos"
                customHeight="500px"
                allowFullscreen={true}
              />
            </div>

            {/* Ejemplo 3: Video corto/preview */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                👁️ Ejemplo 3: Video de Introducción (Preview)
              </h3>
              <HotmartIframePlayer
                contentId="video_introduccion"
                title="Introducción al Risk Management"
                description="Conceptos básicos de gestión de riesgo financiero"
                hotmartVideoId="intro-risk-management"
                customHeight="300px"
                allowFullscreen={false}
              />
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Código de implementación */}
      <Card className="bg-gray-900 text-white">
        <CardHeader>
          <CardTitle className="text-white">💻 Código para Implementar</CardTitle>
          <CardDescription className="text-gray-300">
            Copia y pega este código en cualquier página React
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-x-auto bg-gray-800 p-4 rounded-lg">
{`import HotmartIframePlayer from '@/components/hotmart/HotmartIframePlayer';

// OPCIÓN 1: Usar mapeo automático (recomendado)
<HotmartIframePlayer
  contentId="modulo_0_bienvenida"
  title="Tu Título"
  description="Descripción del contenido"
  customHeight="500px"
  allowFullscreen={true}
/>

// OPCIÓN 2: Especificar video de Hotmart directamente
<HotmartIframePlayer
  contentId="mi_contenido"
  title="Título Personalizado"
  description="Descripción personalizada"
  hotmartVideoId="tu-video-id-en-hotmart"
  customHeight="400px"
  allowFullscreen={true}
/>

// OPCIÓN 3: Video más pequeño para previews
<HotmartIframePlayer
  contentId="preview_video"
  title="Vista Previa"
  description="Video de muestra"
  hotmartVideoId="preview-video-id"
  customHeight="300px"
  allowFullscreen={false}
/>`}
          </pre>
        </CardContent>
      </Card>

      {/* Configuración necesaria */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">⚙️ Configuración Necesaria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-blue-900">
            <div>
              <h4 className="font-semibold mb-2">1. Variables de Entorno (.env)</h4>
              <pre className="bg-blue-100 p-3 rounded text-sm">
{`VITE_HOTMART_CLIENT_ID=tu_client_id
VITE_HOTMART_CLIENT_SECRET=tu_client_secret
VITE_HOTMART_PRODUCT_ID=D102065526G`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Mapear tus Videos en hotmartIframeConfig.js</h4>
              <pre className="bg-blue-100 p-3 rounded text-sm">
{`// En src/lib/hotmartIframeConfig.js
export const PRODUCT_MAPPING = {
  'mi_modulo_1': {
    hotmartProductId: 'D102065526G',
    videoId: 'mi-video-en-hotmart',
    type: 'video',
    title: 'Mi Módulo 1'
  },
  // ... más contenidos
};`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. URLs de Hotmart</h4>
              <p className="text-sm">
                Para cada video en Hotmart, necesitas el ID del video que aparece en la URL de embed que te proporciona Hotmart.
                Ejemplo: <code className="bg-blue-100 px-1 rounded">https://player.hotmart.com/embed/TU_VIDEO_ID</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flujo de trabajo */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">🔄 Flujo de Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-green-900">
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <strong>Subir contenido a Hotmart</strong>
                <p className="text-sm">Sube tus videos a tu producto de Hotmart como siempre</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <strong>Obtener ID del video</strong>
                <p className="text-sm">Copia el ID del video desde la URL de embed de Hotmart</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <strong>Configurar mapeo</strong>
                <p className="text-sm">Agrega el mapeo en hotmartIframeConfig.js</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <strong>Usar componente</strong>
                <p className="text-sm">Usa HotmartIframePlayer en cualquier página</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default EjemploUsoHotmart;