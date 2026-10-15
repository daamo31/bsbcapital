// Servicio de contenido y permisos basado en Supabase.
import { supabase } from '@/lib/customSupabaseClient';

class ContentService {
  constructor() {
    this.cache = new Map(); // Cache para URLs de streaming
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Verificar acceso del usuario a contenido específico
  async checkUserAccess(userId, contentId) {
    try {
      // 1. Verificar si el contenido existe (usando course_content)
      const { data: content, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (contentError || !content) {
        console.error('Contenido no encontrado:', contentError);
        return { hasAccess: false, reason: 'content_not_found' };
      }

      // 2. Si es contenido gratuito, permitir acceso
      if (content.is_free) {
        return {
          hasAccess: true,
          content: content,
          reason: 'free_content',
        };
      }

      // 3. Verificar datos del usuario (usando tabla users)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, membership_tier, access_level, subscription_status')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error obteniendo usuario:', userError);
        return { hasAccess: false, reason: 'user_error' };
      }

      if (!user) {
        return { hasAccess: false, reason: 'user_not_found' };
      }

      // 4. Verificar si el usuario tiene suscripción activa
      if (user.subscription_status !== 'active') {
        return { hasAccess: false, reason: 'subscription_inactive' };
      }

      // 5. Verificar nivel de acceso requerido
      const hasRequiredLevel = this.checkAccessLevel(
        user.access_level || user.membership_tier || 'basic',
        content.required_access_level
      );

      if (!hasRequiredLevel) {
        return {
          hasAccess: false,
          reason: 'insufficient_access_level',
          required: content.required_access_level,
          current: user.access_level || user.membership_tier || 'basic',
        };
      }

      return {
        hasAccess: true,
        content: content,
        user: user,
        reason: 'access_granted',
      };
    } catch (error) {
      console.error('Error verificando acceso:', error);
      return { hasAccess: false, reason: 'system_error', error: error.message };
    }
  }

  // Verificar nivel de acceso (usando access_level/membership_tier de users)
  checkAccessLevel(userLevel, requiredLevel) {
    const levels = {
      basic: 1,
      premium: 2,
      enterprise: 3,
      pro: 2, // Alias para premium
      admin: 4, // Máximo nivel
    };

    const userLevelValue = levels[userLevel?.toLowerCase()] || 1;
    const requiredLevelValue = levels[requiredLevel?.toLowerCase()] || 1;

    return userLevelValue >= requiredLevelValue;
  }

  // Obtener contenido de un módulo completo (usando course_content)
  async getModuleContent(moduleId, userId = null) {
    try {
      // Obtener contenido del módulo
      const { data: content, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (contentError) {
        console.error('Error obteniendo contenido:', contentError);
        return null;
      }

      // Si hay usuario, verificar accesos
      let contentWithAccess = content;
      if (userId) {
        contentWithAccess = await Promise.all(
          content.map(async (item) => {
            const access = await this.checkUserAccess(userId, item.content_id);
            return {
              ...item,
              hasAccess: access.hasAccess,
              accessReason: access.reason,
            };
          })
        );
      }

      // Crear un módulo virtual basado en el contenido
      const moduleInfo = {
        module_id: moduleId,
        title: this.getModuleTitleFromId(moduleId),
        description: this.getModuleDescriptionFromId(moduleId),
        category: this.getModuleCategoryFromId(moduleId),
        difficulty_level: this.getModuleDifficultyFromId(moduleId),
      };

      return {
        module: moduleInfo,
        content: contentWithAccess,
      };
    } catch (error) {
      console.error('Error obteniendo contenido del módulo:', error);
      return null;
    }
  }

  // Obtener una URL directa de vídeo almacenada en Supabase.
  async getVideoStreamURL(contentId, userId) {
    try {
      // Verificar acceso primero
      const access = await this.checkUserAccess(userId, contentId);
      if (!access.hasAccess) {
        throw new Error(`Acceso denegado: ${access.reason}`);
      }

      const content = access.content;

      // Solo para videos
      if (content.content_type !== 'video') {
        throw new Error('El contenido no es un video');
      }

      // Verificar cache
      const cacheKey = `${contentId}_${userId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.url;
      }

      const streamURL = content.direct_url || content.content_url || null;

      if (!streamURL) {
        throw new Error('No se pudo obtener URL de streaming');
      }

      // Guardar en cache
      this.cache.set(cacheKey, {
        url: streamURL,
        timestamp: Date.now(),
      });

      return streamURL;
    } catch (error) {
      console.error('Error obteniendo URL de video:', error);
      throw error;
    }
  }

  // Obtener URL de descarga para PDFs/documentos
  async getFileDownloadURL(contentId, userId) {
    try {
      // Verificar acceso
      const access = await this.checkUserAccess(userId, contentId);
      if (!access.hasAccess) {
        throw new Error(`Acceso denegado: ${access.reason}`);
      }

      const content = access.content;

      // Para PDFs y documentos
      if (!['pdf', 'document'].includes(content.content_type)) {
        throw new Error('El contenido no es un documento descargable');
      }

      // Obtener URL de descarga
      if (content.direct_url) {
        return content.direct_url;
      }

      throw new Error('No se encontró URL de descarga');
    } catch (error) {
      console.error('Error obteniendo URL de descarga:', error);
      throw error;
    }
  }

  // Registrar progreso del usuario (usando user_progress existente)
  async updateUserProgress(userId, contentId, progressData) {
    try {
      const updateData = {
        user_id: userId,
        content_id_ref: contentId, // Usando content_id_ref
        last_accessed_at: new Date().toISOString(),
        ...progressData,
      };

      if (progressData.completed) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase.from('user_progress').upsert(updateData, {
        onConflict: 'user_id,content_id_ref',
      });

      if (error) {
        console.error('Error actualizando progreso:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error registrando progreso:', error);
      return false;
    }
  }

  // Obtener progreso del usuario (usando user_progress existente)
  async getUserProgress(userId, contentId = null) {
    try {
      let query = supabase.from('user_progress').select('*').eq('user_id', userId);

      if (contentId) {
        query = query.eq('content_id_ref', contentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo progreso:', error);
        return null;
      }

      return contentId ? data[0] || null : data;
    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      return null;
    }
  }

  // Obtener todos los módulos disponibles (basado en course_content)
  async getAllModules(userId = null) {
    try {
      // Obtener módulos únicos del contenido
      const { data: moduleData, error } = await supabase
        .from('course_content')
        .select('module_id')
        .not('module_id', 'is', null)
        .order('module_id');

      if (error) {
        console.error('Error obteniendo módulos:', error);
        return [];
      }

      // Crear lista única de módulos
      const uniqueModules = [...new Set(moduleData.map((item) => item.module_id))];

      const modules = uniqueModules
        .map((moduleId) => ({
          module_id: moduleId,
          title: this.getModuleTitleFromId(moduleId),
          description: this.getModuleDescriptionFromId(moduleId),
          category: this.getModuleCategoryFromId(moduleId),
          difficulty_level: this.getModuleDifficultyFromId(moduleId),
          order_index: this.getModuleOrderFromId(moduleId),
        }))
        .sort((a, b) => a.order_index - b.order_index);

      // Si hay usuario, verificar accesos
      if (userId) {
        return await Promise.all(
          modules.map(async (module) => {
            // Obtener una muestra de contenido para verificar acceso
            const { data: sampleContent } = await supabase
              .from('course_content')
              .select('content_id, required_subscription_level')
              .eq('module_id', module.module_id)
              .limit(1);

            if (sampleContent && sampleContent.length > 0) {
              const access = await this.checkUserAccess(userId, sampleContent[0].content_id);
              return {
                ...module,
                hasAccess: access.hasAccess,
                accessReason: access.reason,
              };
            }

            return {
              ...module,
              hasAccess: false,
              accessReason: 'no_content',
            };
          })
        );
      }

      return modules;
    } catch (error) {
      console.error('Error obteniendo módulos:', error);
      return [];
    }
  }

  // Funciones auxiliares para obtener información de módulos
  getModuleTitleFromId(moduleId) {
    const titles = {
      module_1: 'Fundamentos de Gestión del Riesgo',
      module_2: 'Fiscalidad y Cumplimiento Crypto',
      module_3: 'Operativa con Derivados',
      academia: 'Academia BSB Capital Completa',
    };
    return titles[moduleId] || `Módulo ${moduleId}`;
  }

  getModuleDescriptionFromId(moduleId) {
    const descriptions = {
      module_1:
        'Aprende las bases fundamentales para proteger tu capital de inversión y minimizar riesgos.',
      module_2:
        'Domina las obligaciones fiscales y el cumplimiento legal en el mundo de las criptomonedas.',
      module_3: 'Visión institucional sobre futuros, opciones y otros instrumentos derivados.',
      academia: 'Acceso completo a todos los cursos, videos y materiales de la academia.',
    };
    return descriptions[moduleId] || `Descripción del ${moduleId}`;
  }

  getModuleCategoryFromId(moduleId) {
    const categories = {
      module_1: 'risk-management',
      module_2: 'crypto-tax',
      module_3: 'derivatives',
      academia: 'complete',
    };
    return categories[moduleId] || 'general';
  }

  getModuleDifficultyFromId(moduleId) {
    const difficulties = {
      module_1: 'basic',
      module_2: 'intermediate',
      module_3: 'advanced',
      academia: 'all',
    };
    return difficulties[moduleId] || 'basic';
  }

  getModuleOrderFromId(moduleId) {
    const orders = {
      academia: 0,
      module_1: 1,
      module_2: 2,
      module_3: 3,
    };
    return orders[moduleId] || 999;
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }
}

// Instancia singleton
const contentService = new ContentService();

export default contentService;
