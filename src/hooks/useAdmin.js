import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [accessLevel, setAccessLevel] = useState(0);
  const [membershipTier, setMembershipTier] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [loading, setLoading] = useState(true); // loading=true al inicio
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    setLoading(true);
    checkUserStatus({ isMounted, signal: abortController.signal });
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const checkUserStatus = async ({ isMounted = true, signal } = {}) => {
    try {
      // Intenta obtener el usuario, puede fallar si la sesión es antigua o inválida
      const callAuth = () => supabase.auth.getUser();
      const { data: { user }, error: userError } = await fetchWithTimeout(callAuth, 10000, signal);
      if (signal?.aborted || !isMounted) return;
      if (userError) {
        if (userError.message?.includes('invalid claim') || userError.message?.includes('bad_jwt')) {
          console.log('JWT corrupto detectado, limpiando sesión...');
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
        }
        resetUserStatus();
        return;
      }
      if (!user) {
        resetUserStatus();
        return;
      }
      // Obtener datos completos del usuario
      const callUser = () => supabase
        .from('users')
        .select('role, access_level, membership_tier, subscription_status, permissions, is_active')
        .eq('id', user.id)
        .single();
      const { data: userData, error: dbError } = await fetchWithTimeout(callUser, 10000, signal);
      if (signal?.aborted || !isMounted) return;
      if (dbError) {
        console.error('Error checking user status:', dbError);
        resetUserStatus();
      } else if (userData) {
        const role = userData.role || 'user';
        const level = userData.access_level || 0;
        setUserRole(role);
        setAccessLevel(level);
        setMembershipTier(userData.membership_tier || 'free');
        setSubscriptionStatus(userData.subscription_status || 'free');
        setPermissions(userData.permissions || {});
        setIsAdmin(['admin', 'super_admin'].includes(role) && userData.is_active);
        setIsSuperAdmin(role === 'super_admin' && userData.is_active);
      }
    } catch (error) {
      if (signal?.aborted || !isMounted) return;
      console.error('Error in user status check:', error);
      resetUserStatus();
    } finally {
      if (signal?.aborted || !isMounted) return;
      setLoading(false);
    }
  };

  const resetUserStatus = () => {
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setUserRole('user');
    setAccessLevel(0);
    setMembershipTier('free');
    setSubscriptionStatus('free');
    setPermissions({});
    setLoading(false);
  };

  // Verificar si tiene acceso a un nivel específico
  const hasAccessLevel = (requiredLevel) => {
    return accessLevel >= requiredLevel || isAdmin;
  };

  // Verificar permisos específicos
  const hasPermission = (permission) => {
    return permissions[permission] === true || permissions.all === true;
  };

  // Verificar si puede acceder a contenido específico
  const canAccessContent = (contentLevel = 0) => {
    return hasAccessLevel(contentLevel) || ['active', 'lifetime'].includes(subscriptionStatus);
  };

  // Verificar si la membresía está activa
  const hasActiveMembership = () => {
    return ['active', 'lifetime'].includes(subscriptionStatus) || isAdmin;
  };

  // Función para actualizar membresía (usar después de compra)
  const updateMembership = async (tier, stripeCustomerId = null, stripeSubscriptionId = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('update_user_membership', {
        user_email: user.email,
        new_tier: tier,
        stripe_customer_id_param: stripeCustomerId,
        stripe_subscription_id_param: stripeSubscriptionId
      });

      if (error) {
        console.error('Error updating membership:', error);
        return false;
      }

      // Refrescar estado después de actualizar
      await checkUserStatus();
      return true;
    } catch (error) {
      console.error('Error in updateMembership:', error);
      return false;
    }
  };

  const logAdminActivity = async (action, targetType = null, targetId = null, details = {}) => {
    if (!isAdmin) return;

    try {
      await supabase.rpc('log_admin_activity', {
        action_text: action,
        target_type_param: targetType,
        target_id_param: targetId,
        details_param: details
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  return {
    // Estados básicos
    isAdmin,
    isSuperAdmin,
    userRole,
    accessLevel,
    membershipTier,
    subscriptionStatus,
    loading,
    permissions,
    
    // Funciones de verificación
    hasAccessLevel,
    hasPermission,
    canAccessContent,
    hasActiveMembership,
    
    // Funciones de acción
    updateMembership,
    logAdminActivity,
    refreshUserStatus: checkUserStatus
  };
};

export default useAdmin;



