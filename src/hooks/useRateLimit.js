import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';

// Get client IP (simple approach)
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

export const useRateLimit = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [resetTime, setResetTime] = useState(null);

  const checkRateLimit = useCallback(async (action) => {
    try {
      const ip = await getClientIP();
      
      const call = () => supabase.functions.invoke('rate-limit', {
        body: { action, ip }
      });
      const { data, error } = await fetchWithTimeout(call, 10000);

      if (error) {
        console.error('Rate limit check error:', error);
        return { allowed: true, remaining: null };
      }

      setIsBlocked(!data.allowed);
      setRemaining(data.remaining);
      setResetTime(data.resetTime);

      return {
        allowed: data.allowed,
        remaining: data.remaining,
        resetTime: data.resetTime,
        message: data.message
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: null };
    }
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    remaining,
    resetTime
  };
};