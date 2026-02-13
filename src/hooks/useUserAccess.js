import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import hotmartService from '@/lib/hotmartService';

/**
 * Custom hook to verify and manage user access to specific content or academy features.
 * It checks administrative status, multiple subscription tables in Supabase,
 * and optionally integrates with Hotmart API for content verification.
 *
 * @param {string|null} contentId - Optional ID of the content to verify specific access for.
 * @returns {Object} Access states and refresh function.
 */
export const useUserAccess = (contentId = null) => {
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
  /** @type {Object|null} Access metadata returned from Hotmart API. */
  const [hotmartData, setHotmartData] = useState(null);
  /** @type {Object|null} Details of the specific content being accessed (lessons, videos, etc). */
  const [contentData, setContentData] = useState(null);
  /** @type {string|null} Resolved direct streaming URL for localized video playback. */
  const [videoStreamURL, setVideoStreamURL] = useState(null);

  /**
   * @type {boolean} Internal flag to bypass checks in development or via URL parameters.
   * Useful for UI/UX testing without needing real subscriptions.
   */
  const isTestingMode = import.meta.env.DEV || window.location.search.includes('testing=true');

  /**
   * Orchestrates the multi-layered verification process.
   * 1. Check Dev/Testing mode.
   * 2. Check Administrative roles (Admin always has access).
   * 3. Check Local Subscriptions (across 3 different tables for backwards compatibility).
   * 4. Check Hotmart API (if a content ID is provided).
   *
   * @param {Object} options - Mounting status and AbortSignal for fetch cancellation.
   */
  const verifyAccess = useCallback(
    async ({ isMounted = true, signal }) => {
      // Stage 0: TESTING MODE
      if (isTestingMode) {
        setHasAccess(true);
        setUserSubscription({
          id: 'testing-sub',
          subscription_type: 'premium',
          status: 'active',
          product_name: 'Academia BSB Capital (Testing)',
        });
        setHotmartData({
          hasAccess: true,
          mockMode: true,
          productId: '6308462',
        });
        setIsLoading(false);
        return true;
      }

      // Stage 1: Auth check
      if (!user || !user.id) {
        setHasAccess(false);
        setIsLoading(false);
        return false;
      }

      if (signal?.aborted || !isMounted) return false;

      try {
        setIsLoading(true);
        setError(null);
        setHotmartData(null);
        setContentData(null);
        setVideoStreamURL(null);

        // Stage 2: ADMIN CHECK
        // Admins are granted full bypass for all academy content.
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
          setHotmartData({
            hasAccess: true,
            adminMode: true,
            productId: '6308462',
          });
          setIsLoading(false);
          return true;
        }

        // Stage 3: LOCAL SUBSCRIPTION RECONCILIATION
        // Checks three tables to ensure no valid purchase is missed.
        const [subscriptionData, academyAccessData, userAccessData] = await Promise.all([
          // Table A: user_subscriptions (Modern Stripe integration)
          fetchWithTimeout(
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
          ),

          // Table B: user_academy_access (Direct grants or manual entries)
          fetchWithTimeout(
            () =>
              supabase
                .from('user_academy_access')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1),
            10000,
            signal
          ),

          // Table C: user_access (Legacy webhook data)
          fetchWithTimeout(
            () =>
              supabase
                .from('user_access')
                .select('*')
                .eq('user_id', user.id)
                .eq('has_access', true)
                .order('created_at', { ascending: false })
                .limit(1),
            10000,
            signal
          ),
        ]);

        if (signal?.aborted || !isMounted) return false;

        // Determine local validity
        const hasUserSubscription = subscriptionData?.data && subscriptionData.data.length > 0;
        const hasAcademyAccess = academyAccessData?.data && academyAccessData.data.length > 0;
        const hasUserAccess = userAccessData?.data && userAccessData.data.length > 0;

        const hasLocalSubscription = hasUserSubscription || hasAcademyAccess || hasUserAccess;

        // Prioritize modern subscription data for state management
        if (hasUserSubscription) {
          setUserSubscription(subscriptionData.data[0]);
        } else if (hasAcademyAccess) {
          setUserSubscription({
            id: academyAccessData.data[0].id,
            subscription_type: 'hotmart',
            status: 'active',
            product_name: 'Academia BSB Capital',
            created_at: academyAccessData.data[0].created_at,
          });
        } else if (hasUserAccess) {
          setUserSubscription({
            id: userAccessData.data[0].id,
            subscription_type: 'hotmart',
            status: 'active',
            product_name: 'Academia BSB Capital',
            created_at: userAccessData.data[0].created_at,
          });
        } else {
          setUserSubscription(null);
        }

        // Stage 4: EXTERNAL CONTENT VERIFICATION (Hotmart)
        // If a specific content ID is targeted, verify ownership via Hotmart API.
        if (contentId && user.email) {
          const hotmartProductId = hotmartService.getHotmartProductId(contentId);
          let currentAccessStatus = hasLocalSubscription;

          try {
            const contentResponse = await hotmartService.getContentData(
              hotmartProductId,
              user.email
            );
            if (signal?.aborted || !isMounted) return false;

            setHotmartData(contentResponse);

            if (contentResponse.hasAccess && contentResponse.contentData) {
              setContentData(contentResponse.contentData);
              currentAccessStatus = true;

              // Auto-fetch stream URL for the primary video asset
              if (contentResponse.contentData.videos?.length > 0) {
                const firstVideo = contentResponse.contentData.videos[0];
                const streamURL = await hotmartService.getVideoStreamURL(firstVideo.id, user.email);
                if (signal?.aborted || !isMounted) return false;
                setVideoStreamURL(streamURL);
              }
            } else {
              currentAccessStatus = false;
              setContentData(null);
              setVideoStreamURL(null);
            }
            setHasAccess(currentAccessStatus);
          } catch (hotmartError) {
            if (signal?.aborted || !isMounted) return false;

            // If API credentials are missing, we can still fall back to manual iframe embedding
            if (hotmartError.message?.includes('Credenciales de Hotmart no configuradas')) {
              setHotmartData({
                hasAccess: hasLocalSubscription,
                iframeMode: true,
                productId: '6308462', // Default BSB Academy ID
              });
            }

            // Resilience: always prioritize local subscription if API fails
            setHasAccess(hasLocalSubscription);
            setContentData(null);
            setVideoStreamURL(null);
          }
        } else {
          // No specific content ID: Use broad subscription validity
          setHasAccess(hasLocalSubscription);
        }

        setIsLoading(false);
        return hasAccess;
      } catch (err) {
        if (signal?.aborted || !isMounted) return false;
        console.error('Error verificando acceso:', err);
        setError(err.message || 'Error desconocido al verificar acceso');
        setHasAccess(false);
        setIsLoading(false);
        return false;
      }
    },
    [contentId, user, isTestingMode, hasAccess]
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
  }, [user?.id, contentId, verifyAccess]);

  return {
    hasAccess,
    isLoading,
    error,
    userSubscription,
    hotmartData,
    contentData,
    videoStreamURL,
    refreshAccess,
  };
};
