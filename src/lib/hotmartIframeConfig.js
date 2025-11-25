/**
 * Configuraciones y utilidades para la integración iframe con Hotmart
 * Este archivo maneja todas las configuraciones necesarias para
 * mostrar contenido de Hotmart embebido de manera profesional
 */

// Configuración base de Hotmart
export const HOTMART_CONFIG = {
  // URL base para embeds
  EMBED_BASE_URL: 'https://player.hotmart.com/embed',
  
  // URL base para la API
  API_BASE_URL: 'https://developers.hotmart.com',
  
  // Dominios permitidos para iframe
  ALLOWED_ORIGINS: [
    'https://player.hotmart.com',
    'https://embed.hotmart.com',
    'https://content.hotmart.com'
  ],
  
  // Configuraciones por defecto del reproductor
  DEFAULT_PLAYER_CONFIG: {
    autoplay: '0',           // No autoplay por defecto
    controls: '1',           // Mostrar controles
    showinfo: '1',          // Mostrar información del video
    branding: '0',          // Ocultar branding de Hotmart
    theme: 'light',         // Tema claro
    color: '0066cc',        // Color de la marca BSB Capital
    modestbranding: '1',    // Branding modesto
    rel: '0'                // No mostrar videos relacionados
  },
  
  // Configuraciones de seguridad
  SECURITY: {
    sandbox: 'allow-scripts allow-same-origin allow-presentation allow-fullscreen',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
  }
};

/**
 * Construye la URL de iframe para contenido de Hotmart
 * @param {string} productId - ID del producto en Hotmart
 * @param {string} videoId - ID del video o contenido
 * @param {object} options - Opciones adicionales para el reproductor
 * @returns {string} URL completa para el iframe
 */
export const buildHotmartIframeUrl = (productId, videoId, options = {}) => {
  // Usar ID real de BSB Capital con fallback
  const finalProductId = productId || import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462';
  const finalVideoId = videoId || 'intro-video';
  
  // Combinar configuraciones por defecto con opciones personalizadas
  const config = {
    ...HOTMART_CONFIG.DEFAULT_PLAYER_CONFIG,
    ...options,
    product: finalProductId,
    video: finalVideoId
  };
  
  // Construir URL con parámetros
  const params = new URLSearchParams(config);
  return `${HOTMART_CONFIG.EMBED_BASE_URL}/${finalVideoId}?${params.toString()}`;
};

/**
 * Verifica si un origen es seguro para iframe
 * @param {string} origin - Origen a verificar
 * @returns {boolean} true si es seguro
 */
export const isSecureOrigin = (origin) => {
  return HOTMART_CONFIG.ALLOWED_ORIGINS.includes(origin);
};

/**
 * Configuraciones específicas por tipo de contenido
 */
export const CONTENT_TYPE_CONFIGS = {
  video: {
    autoplay: '0',
    controls: '1',
    showinfo: '1',
    height: '500px',
    minHeight: '400px'
  },
  
  live: {
    autoplay: '1',
    controls: '1',
    showinfo: '1',
    height: '600px',
    minHeight: '500px'
  },
  
  document: {
    controls: '0',
    showinfo: '0',
    height: '700px',
    minHeight: '600px'
  },
  
  course: {
    autoplay: '0',
    controls: '1',
    showinfo: '1',
    height: '500px',
    minHeight: '400px'
  }
};

/**
 * Obtiene configuración específica por tipo de contenido
 * @param {string} contentType - Tipo de contenido
 * @param {object} customConfig - Configuración personalizada
 * @returns {object} Configuración completa
 */
export const getContentTypeConfig = (contentType = 'video', customConfig = {}) => {
  const baseConfig = CONTENT_TYPE_CONFIGS[contentType] || CONTENT_TYPE_CONFIGS.video;
  return {
    ...baseConfig,
    ...customConfig
  };
};

/**
 * Mapeo de productos BSB Capital a IDs de Hotmart
 * Configuración con ID real: 6308462
 * URL del club: https://hotmart.com/es/club/bsb-capital-fz-llc
 */
export const PRODUCT_MAPPING = {
  // Academia principal - ID REAL: 6308462
  'academia_completa': {
    hotmartProductId: '6308462',
    type: 'course',
    title: 'Academia BSB Capital Completa',
    clubUrl: 'https://hotmart.com/es/club/bsb-capital-fz-llc'
  },
  
  // Módulos individuales - basados en tu contenido real
  'modulo_0_bienvenida': {
    hotmartProductId: '6308462',
    videoId: 'modulo-0-bienvenida-mentalidad',
    type: 'video',
    title: 'Módulo 0: Bienvenida y Mentalidad Inversora',
    description: 'Introducción a la mentalidad inversora con píldora formativa sobre inflación'
  },
  
  'modulo_1_riesgo': {
    hotmartProductId: '6308462',
    videoId: 'modulo-1-gestion-riesgo',
    type: 'video', 
    title: 'Módulo 1: Fundamentos de Gestión del Riesgo',
    description: 'Aprende las bases fundamentales para proteger tu capital de inversión'
  },
  
  'modulo_2_fiscalidad': {
    hotmartProductId: '6308462',
    videoId: 'modulo-2-fiscalidad-crypto',
    type: 'video',
    title: 'Módulo 2: Fiscalidad y Cumplimiento Crypto',
    description: 'Domina las obligaciones fiscales en el mundo de las criptomonedas'
  },
  
  'modulo_3_derivados': {
    hotmartProductId: '6308462',
    videoId: 'modulo-3-derivados-operativa',
    type: 'video',
    title: 'Módulo 3: Operativa con Derivados',
    description: 'Visión institucional sobre futuros, opciones y derivados'
  },
  
  // Videos específicos de BSB Capital
  'video_introduccion': {
    hotmartProductId: '6308462',
    videoId: 'introduccion-risk-management',
    type: 'video',
    title: 'Introducción al Risk Management',
    description: 'Conceptos básicos de gestión de riesgo financiero'
  },
  
  'video_inflacion': {
    hotmartProductId: '6308462', 
    videoId: 'pildora-formativa-inflacion',
    type: 'video',
    title: 'Píldora Formativa: La Inflación',
    description: 'Entendiendo el impacto de la inflación en las inversiones'
  },

  // Contenido adicional según tu academia
  'formacion_crypto': {
    hotmartProductId: '6308462',
    videoId: 'formacion-crypto-completa',
    type: 'course',
    title: 'Formación en Criptomonedas',
    description: 'Curso completo de inversión y fiscalidad crypto'
  },

  'trading_institucional': {
    hotmartProductId: '6308462',
    videoId: 'trading-vision-institucional',
    type: 'video',
    title: 'Trading con Visión Institucional',
    description: 'Estrategias de trading desde perspectiva institucional'
  },

  'analisis_tecnico': {
    hotmartProductId: '6308462',
    videoId: 'analisis-tecnico-avanzado',
    type: 'video',
    title: 'Análisis Técnico Avanzado',
    description: 'Herramientas profesionales de análisis técnico'
  }
};

/**
 * Obtiene configuración de un contenido específico
 * @param {string} contentId - ID interno del contenido
 * @returns {object|null} Configuración del contenido o null si no existe
 */
export const getContentConfig = (contentId) => {
  return PRODUCT_MAPPING[contentId] || null;
};

/**
 * Construye URL de iframe para contenido específico de BSB Capital
 * @param {string} contentId - ID interno del contenido
 * @param {object} options - Opciones adicionales
 * @returns {string|null} URL del iframe o null si no existe
 */
export const buildBSBContentIframeUrl = (contentId, options = {}) => {
  const contentConfig = getContentConfig(contentId);
  
  if (!contentConfig) {
    console.warn(`Contenido no encontrado: ${contentId}`);
    return null;
  }
  
  const typeConfig = getContentTypeConfig(contentConfig.type);
  const finalOptions = {
    ...typeConfig,
    ...options
  };
  
  return buildHotmartIframeUrl(
    contentConfig.hotmartProductId,
    contentConfig.videoId || contentId,
    finalOptions
  );
};

/**
 * Configuraciones para diferentes casos de uso
 */
export const USE_CASES = {
  // Para página de academia principal
  academy_main: {
    height: '600px',
    autoplay: '0',
    showControls: true,
    allowFullscreen: true,
    showBranding: false
  },
  
  // Para módulos individuales
  module_player: {
    height: '500px',
    autoplay: '0',
    showControls: true,
    allowFullscreen: true,
    showBranding: false
  },
  
  // Para demos y previews
  preview_mode: {
    height: '300px',
    autoplay: '0',
    showControls: true,
    allowFullscreen: false,
    showBranding: true
  },
  
  // Para página completa
  fullpage_mode: {
    height: '80vh',
    autoplay: '0',
    showControls: true,
    allowFullscreen: true,
    showBranding: false
  }
};

/**
 * Obtiene configuración por caso de uso
 * @param {string} useCase - Caso de uso
 * @returns {object} Configuración para el caso de uso
 */
export const getUseCaseConfig = (useCase = 'module_player') => {
  return USE_CASES[useCase] || USE_CASES.module_player;
};

/**
 * Utilidades para manejar eventos del iframe
 */
export const IFRAME_EVENTS = {
  // Eventos que puede enviar Hotmart
  PLAYER_READY: 'playerReady',
  VIDEO_START: 'videoStart', 
  VIDEO_PAUSE: 'videoPause',
  VIDEO_END: 'videoEnd',
  VIDEO_PROGRESS: 'videoProgress',
  PLAYER_ERROR: 'playerError',
  
  // Eventos personalizados
  ACCESS_DENIED: 'accessDenied',
  CONTENT_LOADED: 'contentLoaded'
};

/**
 * Handler para eventos del iframe de Hotmart
 * @param {MessageEvent} event - Evento recibido
 * @param {function} callback - Callback para manejar el evento
 */
export const handleHotmartIframeMessage = (event, callback) => {
  // Verificar origen por seguridad
  if (!isSecureOrigin(event.origin)) {
    console.warn('Mensaje de origen no seguro:', event.origin);
    return;
  }
  
  try {
    const { type, data } = event.data;
    
    if (callback && typeof callback === 'function') {
      callback(type, data);
    }
    
    // Log para debugging
    console.log('Evento de Hotmart:', { type, data });
    
  } catch (error) {
    console.error('Error procesando mensaje de Hotmart:', error);
  }
};

export default {
  HOTMART_CONFIG,
  buildHotmartIframeUrl,
  buildBSBContentIframeUrl,
  getContentConfig,
  getContentTypeConfig,
  getUseCaseConfig,
  isSecureOrigin,
  handleHotmartIframeMessage,
  IFRAME_EVENTS
};