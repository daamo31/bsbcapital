# Integración con Hotmart - Guía de Configuración

## 🎯 Objetivo
Integrar contenido de Hotmart (videos, documentos, audios) directamente en tu plataforma sin redirecciones. Los usuarios ven el contenido en tu página con tu diseño y marca.

## 🔧 Configuración Inicial

### 1. Credenciales de Hotmart
1. Ve a [Hotmart Developers](https://developers.hotmart.com/)
2. Crea una aplicación y obtén:
   - `CLIENT_ID`
   - `CLIENT_SECRET`

### 2. Variables de Entorno
Crea un archivo `.env.local` con:

```bash
# Credenciales de Hotmart
REACT_APP_HOTMART_CLIENT_ID=tu_client_id_aqui
REACT_APP_HOTMART_CLIENT_SECRET=tu_client_secret_aqui

# IDs de productos (obtener desde panel de Hotmart)
REACT_APP_HOTMART_BASIC_PRODUCT_ID=12345
REACT_APP_HOTMART_STANDARD_PRODUCT_ID=12346
REACT_APP_HOTMART_PREMIUM_PRODUCT_ID=12347
REACT_APP_HOTMART_FULL_ACADEMIA_ID=12348

# Configuración adicional
REACT_APP_USE_HOTMART_VERIFICATION=true
```

### 3. Mapeo de Contenido
En `src/lib/hotmartService.js`, ajusta el mapeo según tus productos:

```javascript
getHotmartProductId(internalContentId) {
  const productMapping = {
    'module_1': 'tu-producto-basico-id',
    'module_2': 'tu-producto-standard-id',
    'module_3': 'tu-producto-premium-id',
    'academia': 'tu-academia-completa-id'
  };
  return productMapping[internalContentId] || internalContentId;
}
```

## 🚀 Cómo Funciona

### Flujo de Integración:

1. **Verificación de Acceso**
   - Sistema verifica suscripción local en Supabase
   - Consulta API de Hotmart para validar acceso real
   - Fallback a verificación local si Hotmart no responde

2. **Obtención de Contenido**
   - API de Hotmart retorna URLs directas de streaming
   - Metadatos del contenido (duración, título, descripción)
   - Enlaces de descarga para recursos adicionales

3. **Reproducción Integrada**
   - Video HTML5 con URL directa de Hotmart
   - Controles personalizados con tu marca
   - Sin redirecciones - usuario permanece en tu página

### Componentes Principales:

- **`HotmartVideoPlayer`**: Reproductor integrado con controles personalizados
- **`useUserAccess`**: Hook que verifica acceso y obtiene contenido
- **`hotmartService`**: Servicio para comunicación con API de Hotmart

## 📋 Endpoints de API de Hotmart Utilizados

```javascript
// Autenticación OAuth2
POST https://api-sec-vlc.hotmart.com/security/oauth/token

// Verificar suscripción de usuario
GET https://developers.hotmart.com/payments/api/v1/subscriptions/summary?subscriber_email={email}&product_id={productId}

// Obtener contenido del producto
GET https://developers.hotmart.com/payments/api/v1/products/{productId}/content

// Obtener URL de streaming de video
GET https://developers.hotmart.com/payments/api/v1/videos/{videoId}/stream
```

## 🎨 Componentes de UI

### HotmartVideoPlayer
Reproductor completo con:
- Controles de reproducción personalizados
- Barra de progreso interactiva
- Control de volumen y pantalla completa
- Lista de videos del módulo
- Recursos descargables integrados

### ModuleCard
Tarjeta de módulo que:
- Verifica acceso en tiempo real
- Muestra estado de suscripción
- Navega al contenido interno (no redirecciona)

## 🔍 Para Probar la Integración

1. **Demo Básico**: `/demo-acceso`
   - Muestra diferentes tipos de contenido
   - Estados de acceso según membresía

2. **Academia Hotmart**: `/hotmart-academy`
   - Vista completa de cursos con integración
   - Cards interactivos con verificación

3. **Demo Integración**: `/hotmart-demo`
   - Explicación técnica completa
   - Reproductor en funcionamiento
   - Documentación visual

4. **Módulo Individual**: `/academia/modulo/1`
   - Reproductor integrado funcionando
   - Lista de lecciones y recursos

## ⚙️ Configuración de Desarrollo

### Para Testing Local (sin Hotmart):
Si no tienes credenciales de Hotmart aún, el sistema tiene fallback:

```javascript
// En .env.local
REACT_APP_USE_HOTMART_VERIFICATION=false
```

Esto usará solo la verificación local de Supabase.

### Para Producción:
1. Configura webhooks de Hotmart para sincronizar suscripciones
2. Implementa caché para reducir llamadas a API
3. Añade analytics para tracking de visualizaciones

## 🛠️ Personalización

### Estilos del Reproductor:
Modifica `HotmartVideoPlayer.jsx` para ajustar:
- Colores de tu marca
- Diseño de controles
- Posición de elementos

### Mapeo de Productos:
Ajusta `hotmartService.js` para mapear tus productos específicos de Hotmart.

## 📈 Beneficios de esta Integración

✅ **Sin redirecciones**: Usuario nunca sale de tu página  
✅ **Marca consistente**: Diseño 100% personalizado  
✅ **Mejor UX**: Navegación fluida entre contenidos  
✅ **Control total**: Mantienes el control de la experiencia  
✅ **Analytics propios**: Puedes trackear todo en tu sistema  
✅ **Offline fallback**: Funciona aunque Hotmart esté caído  

## ⚠️ Consideraciones Importantes

- Las URLs de streaming de Hotmart pueden tener caducidad
- Implementa caché inteligente para optimizar rendimiento  
- Considera límites de API de Hotmart en tu plan
- Mantén sincronización entre tu DB y Hotmart con webhooks

¿Necesitas ayuda con algún aspecto específico de la integración?