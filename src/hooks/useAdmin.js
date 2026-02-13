import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

/**
 * Custom hook to manage and provide administrative status and user permissions.
 * It synchronizes with Supabase authentication and the 'users' table to determine roles,
 * access levels, and active subscription status.
 *
 * @returns {Object} Admin states and verification functions.
 */
export const useAdmin = () => {
  // --- Basic States ---
  /** @type {boolean} True if the user has 'admin' or 'super_admin' role and is active. */
  const [isAdmin, setIsAdmin] = useState(false);
  /** @type {boolean} True if the user has 'super_admin' role and is active. */
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  /** @type {string} The raw role from the database (e.g., 'user', 'admin'). */
  const [userRole, setUserRole] = useState('user');
  /** @type {number} Numeric access level extracted from the database for fine-grained permissions. */
  const [accessLevel, setAccessLevel] = useState(0);
  /** @type {string} The tier name of the user's membership (e.g., 'free', 'premium'). */
  const [membershipTier, setMembershipTier] = useState('free');
  /** @type {string} Current subscription status (e.g., 'active', 'free', 'expired'). */
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  /** @type {boolean} True while the initial status check is in progress. */
  const [loading, setLoading] = useState(true);
  /** @type {Object} Key-value pair object representing specific granular permissions. */
  const [permissions, setPermissions] = useState({});

  /**
   * Fetches the current user from auth and reconciles it with the 'users' table in the DB.
   * Handles JWT corruption and session resets if necessary.
   *
   * @param {Object} options - Mounting status and AbortSignal.
   */
  const checkUserStatus = useCallback(async ({ isMounted = true, signal } = {}) => {
    try {
      // 1. Attempt to get the user from Supabase Auth
      const callAuth = () => supabase.auth.getUser();
      const {
        data: { user },
        error: userError,
      } = await fetchWithTimeout(callAuth, 10000, signal);

      if (signal?.aborted || !isMounted) return;

      if (userError) {
        // Handle token corruption: if JWT is invalid, sign out and clean local storage
        if (
          userError.message?.includes('invalid claim') ||
          userError.message?.includes('bad_jwt')
        ) {
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

      // 2. Fetch extended profile and role data from the custom 'users' table
      const callUser = () =>
        supabase
          .from('users')
          .select(
            'role, access_level, membership_tier, subscription_status, permissions, is_active'
          )
          .eq('id', user.id)
          .single();

      const { data: userData, error: dbError } = await fetchWithTimeout(callUser, 10000, signal);

      if (signal?.aborted || !isMounted) return;

      if (dbError) {
        console.error('Error checking user status:', dbError);
        resetUserStatus();
      } else if (userData) {
        // Successfully retrieved user data; update all related states
        const role = userData.role || 'user';
        const level = userData.access_level || 0;

        setUserRole(role);
        setAccessLevel(level);
        setMembershipTier(userData.membership_tier || 'free');
        setSubscriptionStatus(userData.subscription_status || 'free');
        setPermissions(userData.permissions || {});

        // Final administration flags: must be active AND have the correct role
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    setLoading(true);

    // Initial verification of user status
    checkUserStatus({ isMounted, signal: abortController.signal });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [checkUserStatus]);

  /**
   * Resets all states to default 'non-authenticated' values.
   */
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

  /**
   * Verifies if the user meets or exceeds a certain numeric access level.
   * Admins pass all checks.
   *
   * @param {number} requiredLevel - The minimum numeric level required.
   * @returns {boolean}
   */
  const hasAccessLevel = (requiredLevel) => {
    return accessLevel >= requiredLevel || isAdmin;
  };

  /**
   * Checks for a specific granular permission defined in the user's metadata.
   *
   * @param {string} permission - The permission key to verify.
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    return permissions[permission] === true || permissions.all === true;
  };

  /**
   * Determines if the user can access specific content based on level OR subscription.
   *
   * @param {number} contentLevel - Required level for the content.
   * @returns {boolean}
   */
  const canAccessContent = (contentLevel = 0) => {
    return hasAccessLevel(contentLevel) || ['active', 'lifetime'].includes(subscriptionStatus);
  };

  /**
   * Quick check for active paid membership or administrative status.
   *
   * @returns {boolean}
   */
  const hasActiveMembership = () => {
    return ['active', 'lifetime'].includes(subscriptionStatus) || isAdmin;
  };

  /**
   * Triggers a stored procedure to manually update a user's membership tier.
   * Useful after a successful checkout process.
   *
   * @param {string} tier - New tier to assign.
   * @param {string} [stripeCustomerId] - Associated Stripe Customer ID.
   * @param {string} [stripeSubscriptionId] - Associated Stripe Subscription ID.
   * @returns {Promise<boolean>} Success status.
   */
  const updateMembership = async (tier, stripeCustomerId = null, stripeSubscriptionId = null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.rpc('update_user_membership', {
        user_email: user.email,
        new_tier: tier,
        stripe_customer_id_param: stripeCustomerId,
        stripe_subscription_id_param: stripeSubscriptionId,
      });

      if (error) {
        console.error('Error updating membership:', error);
        return false;
      }

      // Re-fetch status to ensure local state matches DB
      await checkUserStatus();
      return true;
    } catch (error) {
      console.error('Error in updateMembership:', error);
      return false;
    }
  };

  /**
   * Logs an administrative action to the audit trails in the database.
   * Only proceeds if the current user is an admin.
   *
   * @param {string} action - Description of the action.
   * @param {string} [targetType] - Type of entity affected (e.g., 'user', 'content').
   * @param {string} [targetId] - ID of the entity affected.
   * @param {Object} [details] - Additional JSON metadata for the log.
   */
  const logAdminActivity = async (action, targetType = null, targetId = null, details = {}) => {
    if (!isAdmin) return;

    try {
      await supabase.rpc('log_admin_activity', {
        action_text: action,
        target_type_param: targetType,
        target_id_param: targetId,
        details_param: details,
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  return {
    // Basic States
    isAdmin,
    isSuperAdmin,
    userRole,
    accessLevel,
    membershipTier,
    subscriptionStatus,
    loading,
    permissions,

    // Verification Helpers
    hasAccessLevel,
    hasPermission,
    canAccessContent,
    hasActiveMembership,

    // Action Functions
    updateMembership,
    logAdminActivity,
    refreshUserStatus: checkUserStatus,
  };
};

export default useAdmin;
