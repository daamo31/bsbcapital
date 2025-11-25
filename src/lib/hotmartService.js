// Servicio para integración con Hotmart API
// Documentación: https://developers.hotmart.com/

import { 
  buildHotmartIframeUrl, 
  buildBSBContentIframeUrl,
  getContentConfig,
  HOTMART_CONFIG,
  isSecureOrigin,
  handleHotmartIframeMessage
} from './hotmartIframeConfig';

class HotmartService {
  constructor() {
    this.baseURL = 'https://developers.hotmart.com/payments'; // API base URL
    this.clientId = import.meta.env.VITE_HOTMART_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_HOTMART_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Configuración para iframe embebido
    this.embedMode = true; // Por defecto usar iframe embebido
  }

  // Obtener token de acceso OAuth2
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Verificar si tenemos credenciales
    if (!this.clientId || !this.clientSecret) {
      console.warn('🔧 Credenciales de Hotmart no configuradas - Usando modo iframe sin API');
      throw new Error('Credenciales de Hotmart no configuradas');
    }

    try {
      const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      
      if (response.ok) {
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        return this.accessToken;
      } else {
        throw new Error(data.error_description || 'Error obteniendo token de Hotmart');
      }
    } catch (error) {
      console.error('Error autenticando con Hotmart:', error);
      throw error;
    }
  }

  // Verificar si un usuario tiene acceso a un producto específico
  async checkUserAccess(userEmail, productId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseURL}/api/v1/subscriptions/summary?subscriber_email=${encodeURIComponent(userEmail)}&product_id=${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.items && data.items.length > 0) {
        const subscription = data.items[0];
        return {
          hasAccess: subscription.status === 'ACTIVE',
          subscription: subscription,
          expiryDate: subscription.date_next_charge,
          status: subscription.status
        };
      }

      return {
        hasAccess: false,
        subscription: null,
        expiryDate: null,
        status: 'INACTIVE'
      };
    } catch (error) {
      console.error('Error verificando acceso en Hotmart:', error);
      return {
        hasAccess: false,
        error: error.message
      };
    }
  }

  // Obtener información de suscripción del usuario
  async getUserSubscriptions(userEmail) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseURL}/api/v1/subscriptions/summary?subscriber_email=${encodeURIComponent(userEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        return data.items || [];
      }

      throw new Error('Error obteniendo suscripciones');
    } catch (error) {
      console.error('Error obteniendo suscripciones de Hotmart:', error);
      return [];
    }
  }

  // Obtener información de un producto
  async getProductInfo(productId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseURL}/api/v1/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        return data;
      }

      throw new Error('Error obteniendo información del producto');
    } catch (error) {
      console.error('Error obteniendo producto de Hotmart:', error);
      return null;
    }
  }

  // Obtener URLs directas de contenido desde Hotmart
  async getContentData(productId, userEmail) {
    try {
      const accessCheck = await this.checkUserAccess(userEmail, productId);
      
      if (!accessCheck.hasAccess) {
        return { hasAccess: false, contentData: null };
      }

      // Obtener datos del contenido específico
      const token = await this.getAccessToken();
      
      // API para obtener contenido del producto
      const response = await fetch(
        `${this.baseURL}/api/v1/products/${productId}/content`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const contentData = await response.json();
        return {
          hasAccess: true,
          contentData: {
            videos: contentData.videos || [],
            documents: contentData.documents || [],
            audios: contentData.audios || [],
            modules: contentData.modules || []
          }
        };
      }

      return { hasAccess: true, contentData: null };
    } catch (error) {
      console.error('Error obteniendo contenido de Hotmart:', error);
      return { hasAccess: false, error: error.message };
    }
  }

  // Obtener URL directa de un video específico
  async getVideoStreamURL(videoId, userEmail) {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(
        `${this.baseURL}/api/v1/videos/${videoId}/stream`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.stream_url; // URL directa del video para tu reproductor
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo URL de video:', error);
      return null;
    }
  }

  // Mapeo de IDs internos a productos de Hotmart - ACTUALIZADO CON ID REAL
  getHotmartProductId(internalContentId) {
    const productMapping = {
      'module_1': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
      'module_2': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462', 
      'module_3': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
      'academia': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
      'video_1': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
      'video_2': import.meta.env.VITE_HOTMART_PRODUCT_ID || '6308462',
      // Nuevos mapeos para BSB Capital
      'modulo_0_bienvenida': '6308462',
      'modulo_1_riesgo': '6308462',
      'modulo_2_fiscalidad': '6308462',
      'modulo_3_derivados': '6308462',
      'formacion_crypto': '6308462',
      'trading_institucional': '6308462',
      'analisis_tecnico': '6308462'
    };

    return productMapping[internalContentId] || '6308462'; // Fallback al ID real
  }

  // ===== NUEVOS MÉTODOS PARA IFRAME EMBEBIDO =====

  /**
   * Obtiene URL de iframe embebido para contenido
   * Esta es la implementación profesional recomendada
   * @param {string} contentId - ID interno del contenido
   * @param {object} options - Opciones adicionales para el iframe
   * @returns {string|null} URL del iframe o null si no existe
   */
  getEmbedUrl(contentId, options = {}) {
    try {
      // Usar configuración BSB para mapeo de contenido
      const embedUrl = buildBSBContentIframeUrl(contentId, options);
      
      if (!embedUrl) {
        console.warn(`No se pudo construir URL de embed para: ${contentId}`);
        return null;
      }
      
      return embedUrl;
    } catch (error) {
      console.error('Error construyendo URL de embed:', error);
      return null;
    }
  }

  /**
   * Obtiene URL de iframe directa para producto/video específico de Hotmart
   * @param {string} productId - ID del producto en Hotmart
   * @param {string} videoId - ID del video en Hotmart
   * @param {object} options - Opciones adicionales
   * @returns {string} URL del iframe
   */
  getDirectEmbedUrl(productId, videoId, options = {}) {
    return buildHotmartIframeUrl(productId, videoId, options);
  }

  /**
   * Verifica si el modo iframe embebido está habilitado
   * @returns {boolean} true si está habilitado
   */
  isEmbedModeEnabled() {
    return this.embedMode;
  }

  /**
   * Habilita o deshabilita el modo iframe embebido
   * @param {boolean} enabled - true para habilitar, false para usar redirecciones
   */
  setEmbedMode(enabled) {
    this.embedMode = enabled;
  }

  /**
   * Obtiene configuración para un contenido específico
   * @param {string} contentId - ID del contenido
   * @returns {object|null} Configuración del contenido
   */
  getContentEmbedConfig(contentId) {
    return getContentConfig(contentId);
  }

  /**
   * Obtiene URL para acceder al contenido (embed o directo según configuración)
   * @param {string} contentId - ID del contenido
   * @param {object} options - Opciones adicionales
   * @returns {string|null} URL de acceso
   */
  getContentAccessUrl(contentId, options = {}) {
    if (this.embedMode) {
      return this.getEmbedUrl(contentId, options);
    } else {
      // Fallback a URL directa de Hotmart
      const config = getContentConfig(contentId);
      if (config && config.hotmartProductId) {
        const productId = config.hotmartProductId;
        return `https://go.hotmart.com/${productId}?dp=`;
      }
      return null;
    }
  }

  /**
   * Maneja mensajes del iframe de Hotmart
   * @param {MessageEvent} event - Evento del iframe
   * @param {function} callback - Callback para manejar eventos
   */
  handleIframeMessage(event, callback) {
    // Verificar origen por seguridad
    if (!isSecureOrigin(event.origin)) {
      console.warn('Mensaje de origen no seguro desde iframe:', event.origin);
      return;
    }

    return handleHotmartIframeMessage(event, callback);
  }

  /**
   * Inicializa listeners para comunicación con iframe
   * @param {function} messageHandler - Handler para mensajes del iframe
   */
  initializeIframeListeners(messageHandler) {
    const handleMessage = (event) => {
      this.handleIframeMessage(event, messageHandler);
    };

    window.addEventListener('message', handleMessage);
    
    // Retornar función para cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }

  /**
   * Valida configuración necesaria para iframe embebido
   * @returns {object} Resultado de la validación
   */
  validateEmbedConfiguration() {
    const issues = [];
    
    if (!this.clientId) {
      issues.push('VITE_HOTMART_CLIENT_ID no configurado');
    }
    
    if (!this.clientSecret) {
      issues.push('VITE_HOTMART_CLIENT_SECRET no configurado');
    }
    
    if (!import.meta.env.VITE_HOTMART_PRODUCT_ID) {
      issues.push('VITE_HOTMART_PRODUCT_ID no configurado');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      embedModeEnabled: this.embedMode
    };
  }

  /**
   * Obtiene información de diagnóstico para debugging
   * @returns {object} Información de diagnóstico
   */
  getDiagnosticInfo() {
    return {
      serviceName: 'HotmartService',
      embedMode: this.embedMode,
      hasCredentials: !!(this.clientId && this.clientSecret),
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry,
      baseURL: this.baseURL,
      configuration: this.validateEmbedConfiguration(),
      embedBaseUrl: HOTMART_CONFIG.EMBED_BASE_URL
    };
  }
}

// Instancia singleton
const hotmartService = new HotmartService();

export default hotmartService;