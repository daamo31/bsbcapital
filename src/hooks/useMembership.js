import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

export const useMembership = () => {
  const { user, loading: loadingAuth } = useAuth();
  const [membershipData, setMembershipData] = useState({
    isActive: false,
    tier: 'free',
    status: 'inactive',
    expiresAt: null,
    loading: true,
    error: null
  });

  const [loadingData, setLoadingData] = useState(false);
  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      setMembershipData({
        isActive: false,
        tier: 'free',
        status: 'inactive',
        expiresAt: null,
        loading: false,
        error: null
      });
      return;
    }
    if (loadingData) return;
    let isMounted = true;
    const abortController = new AbortController();
    setLoadingData(true);
    fetchMembershipData({ isMounted, signal: abortController.signal }).finally(() => {
      if (isMounted) setLoadingData(false);
    });
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user, loadingAuth]);

  const fetchMembershipData = async ({ isMounted = true, signal } = {}) => {
    try {
      setMembershipData(prev => ({ ...prev, loading: true, error: null }));
      const call = () => supabase
        .from('profiles')
        .select(`
          subscription_status,
          membership_tier,
          subscription_expires_at,
          stripe_customer_id,
          user_subscriptions (
            status,
            current_period_end,
            stripe_subscription_id
          )
        `)
        .eq('id', user.id)
        .single();
      const { data, error } = await fetchWithTimeout(call, 10000, signal);
      if (signal?.aborted || !isMounted) return;
      if (error) throw error;
      const isActive = data?.subscription_status === 'active' || 
                      data?.membership_tier === 'lifetime' ||
                      data?.membership_tier === 'premium' ||
                      data?.membership_tier === 'pro';
      setMembershipData({
        isActive,
        tier: data?.membership_tier || 'free',
        status: data?.subscription_status || 'inactive',
        expiresAt: data?.subscription_expires_at,
        subscriptionData: data?.user_subscriptions?.[0],
        loading: false,
        error: null
      });
    } catch (error) {
      if (signal?.aborted || !isMounted) return;
      if (error.message === 'timeout') {
        console.warn('fetchMembershipData aborted');
      } else {
        console.error('Error fetching membership data:', error);
      }
      setMembershipData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const refreshMembership = () => {
    if (user) {
      fetchMembershipData();
    }
  };

  // Helper functions
  const hasActiveSubscription = () => membershipData.isActive;
  
  const getMembershipBadge = () => {
    if (!membershipData.isActive) return null;
    
    const tierLabels = {
      'free': 'Gratuito',
      'basic': 'Básico',
      'premium': 'Premium',
      'pro': 'Pro',
      'lifetime': 'Vitalicio'
    };

    return {
      label: tierLabels[membershipData.tier] || membershipData.tier,
      tier: membershipData.tier,
      color: membershipData.tier === 'lifetime' ? 'gold' : 
             membershipData.tier === 'pro' ? 'purple' :
             membershipData.tier === 'premium' ? 'blue' : 'gray'
    };
  };

  const getDaysUntilExpiry = () => {
    if (!membershipData.expiresAt || membershipData.tier === 'lifetime') return null;
    
    const expiryDate = new Date(membershipData.expiresAt);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const isExpiringSoon = () => {
    const daysUntilExpiry = getDaysUntilExpiry();
    return daysUntilExpiry !== null && daysUntilExpiry <= 7;
  };

  const canAccessPremiumFeatures = () => {
    return membershipData.isActive && ['premium', 'pro', 'lifetime'].includes(membershipData.tier);
  };

  const getConsultationDiscount = () => {
    return membershipData.isActive ? 20 : 0; // 20% discount for members
  };

  return {
    ...membershipData,
    refreshMembership,
    hasActiveSubscription,
    getMembershipBadge,
    getDaysUntilExpiry,
    isExpiringSoon,
    canAccessPremiumFeatures,
    getConsultationDiscount
  };
};

export default useMembership;