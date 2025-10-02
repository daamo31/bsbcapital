// Servicio para integración con Hotmart API
// Documentación: https://developers.hotmart.com/

class HotmartService {
  constructor() {
    this.baseURL = 'https://developers.hotmart.com/payments'; // API base URL
    this.clientId = process.env.REACT_APP_HOTMART_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_HOTMART_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Obtener token de acceso OAuth2
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: JSON.stringify({
          grant_type: 'client_credentials'
        })
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

  // Mapeo de IDs internos a productos de Hotmart
  getHotmartProductId(internalContentId) {
    const productMapping = {
      'module_1': process.env.REACT_APP_HOTMART_BASIC_PRODUCT_ID || 'basic-course',
      'module_2': process.env.REACT_APP_HOTMART_STANDARD_PRODUCT_ID || 'standard-course', 
      'module_3': process.env.REACT_APP_HOTMART_PREMIUM_PRODUCT_ID || 'premium-course',
      'academia': process.env.REACT_APP_HOTMART_FULL_ACADEMIA_ID || 'full-academia',
      'video_1': process.env.REACT_APP_HOTMART_BASIC_PRODUCT_ID || 'basic-course',
      'video_2': process.env.REACT_APP_HOTMART_PREMIUM_PRODUCT_ID || 'premium-course'
    };

    return productMapping[internalContentId] || internalContentId;
  }
}

// Instancia singleton
const hotmartService = new HotmartService();

export default hotmartService;