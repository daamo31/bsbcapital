import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

/**
 * Custom hook to verify and manage user access to specific content or academy features.
 * It checks administrative status and active Stripe subscriptions in Supabase.
 *
 * @param {string|null} _contentId - Retained for compatibility with existing call sites.
 * @returns {Object} Access states and refresh function.
 */
export const useUserAccess = (_contentId = null) => {
  const { user } = useAuth();

  // --- Core Access States ---
  /** @type {boolean} Final determination of whether the user has access to the current context. */
  const [hasAccess, setHasAccess] = useState(false);
  /** @type {boolean} True while checking roles, subscriptions, and external APIs. */
  const [isLoading, setIsLoading] = useState(true);
  /** @type {string|null} Error message if any check fails critically. */
  const [error, setError] = useState(null);

  // --- Detailed Metadata States ---
  /** @type {Object|null} Consolidated subscription details from local database. */
  const [userSubscription, setUserSubscription] = useState(null);
  /**
   * Checks authentication, administrative roles, and the user's active Stripe subscription.
   *
   * @param {Object} options - Mounting status and AbortSignal for fetch cancellation.
   */
  const verifyAccess = useCallback(
    async ({ isMounted = true, signal }) => {
      // Auth check
      if (!user || !user.id) {
        setHasAccess(false);
        setIsLoading(false);
        return false;
      }

      if (signal?.aborted || !isMounted) return false;

      try {
        setIsLoading(true);
        setError(null);
        // Admins are granted access to academy content.
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
          setHasAccess(true);
          setUserSubscription({
            id: 'admin-access',
            subscription_type: 'admin',
            status: 'active',
            product_name: 'Academia BSB Capital (Admin Access)',
          });
          setIsLoading(false);
          return true;
        }

        const subscriptionData = await fetchWithTimeout(
          () =>
            supabase
              .from('user_subscriptions')
              .select('*, subscription_plans(*)')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .or('expired_at.is.null,expired_at.gt.now()')
              .order('created_at', { ascending: false })
              .limit(1),
          10000,
          signal
        );

        if (signal?.aborted || !isMounted) return false;

        const activeSubscription = subscriptionData?.data?.[0] || null;
        setUserSubscription(activeSubscription);
        setHasAccess(Boolean(activeSubscription));

        setIsLoading(false);
        return Boolean(activeSubscription);
      } catch (err) {
        if (signal?.aborted || !isMounted) return false;
        console.error('Error verificando acceso:', err);
        setError(err.message || 'Error desconocido al verificar acceso');
        setHasAccess(false);
        setIsLoading(false);
        return false;
      }
    },
    [user]
  );

  /**
   * Public function to manually trigger a re-verification of access.
   */
  const refreshAccess = () => verifyAccess({ isMounted: true, signal: null });

  useEffect(() => {
    // Guard: Don't attempt verification if user is not fully loaded
    if (!user?.id) {
      setIsLoading(false);
      setHasAccess(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    verifyAccess({ isMounted, signal: abortController.signal });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user?.id, verifyAccess]);

  return {
    hasAccess,
    isLoading,
    error,
    userSubscription,
    refreshAccess,
  };
};
