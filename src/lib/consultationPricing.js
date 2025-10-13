// Utilities for handling consultation pricing with membership discounts
import { supabase } from '@/lib/customSupabaseClient';

// Consultation products with their discounted Stripe price IDs
export const CONSULTATION_PRODUCTS = {
  '30_min': {
    id: 'consultation_30_min',
    name: 'Consultoría 30 minutos',
    duration: 30,
    regular_price: 75, // Regular price in EUR
    regular_stripe_price_id: import.meta.env.VITE_STRIPE_CONSULTATION_30MIN_REGULAR || 'price_regular_30min',
    member_price: 60, // 20% discount
    member_stripe_price_id: import.meta.env.VITE_STRIPE_CONSULTATION_30MIN_MEMBER || 'price_1SHoSzJmSk3VG9oiEF2xRHNp',
    member_product_id: 'prod_TEH1pw7rFSqXke',
    discount_percentage: 20
  },
  '60_min': {
    id: 'consultation_60_min', 
    name: 'Consultoría 1 hora',
    duration: 60,
    regular_price: 150, // Regular price in EUR
    regular_stripe_price_id: import.meta.env.VITE_STRIPE_CONSULTATION_60MIN_REGULAR || 'price_regular_60min',
    member_price: 120, // 20% discount
    member_stripe_price_id: import.meta.env.VITE_STRIPE_CONSULTATION_60MIN_MEMBER || 'price_1SHoU8JmSk3VG9oiiMmypJRJ',
    member_product_id: 'prod_TEH29G9Y4nF82x',
    discount_percentage: 20
  }
};

/**
 * Check if user has active membership
 */
export const hasActiveMembership = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_status, membership_tier')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data?.subscription_status === 'active' || 
           data?.membership_tier === 'lifetime' ||
           data?.membership_tier === 'premium' ||
           data?.membership_tier === 'pro';
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

/**
 * Get consultation pricing based on user's membership status
 */
export const getConsultationPricing = async (durationType, userId) => {
  const product = CONSULTATION_PRODUCTS[durationType];
  
  if (!product) {
    throw new Error(`Invalid consultation duration: ${durationType}`);
  }

  const isMember = userId ? await hasActiveMembership(userId) : false;

  return {
    ...product,
    is_member: isMember,
    final_price: isMember ? product.member_price : product.regular_price,
    stripe_price_id: isMember ? product.member_stripe_price_id : product.regular_stripe_price_id,
    savings: isMember ? product.regular_price - product.member_price : 0
  };
};

/**
 * Create consultation checkout session with appropriate pricing
 */
export const createConsultationCheckout = async (durationType, userId, consultationData = {}) => {
  const pricing = await getConsultationPricing(durationType, userId);
  
  const checkoutData = {
    price_id: pricing.stripe_price_id,
    user_id: userId,
    consultation_type: pricing.name,
    duration_minutes: pricing.duration,
    scheduled_at: consultationData.scheduled_at,
    consultant_id: consultationData.consultant_id,
    client_email: consultationData.client_email,
    client_name: consultationData.client_name,
    consultation_notes: consultationData.notes || '',
    metadata: {
      consultation_duration: durationType,
      is_member_discount: pricing.is_member,
      regular_price: pricing.regular_price,
      final_price: pricing.final_price,
      savings: pricing.savings
    }
  };

  // Create Stripe checkout session
  const { data, error } = await supabase.functions.invoke('create-consultation-checkout', {
    body: checkoutData
  });

  if (error) throw error;
  return data;
};

/**
 * Get member discount info for display
 */
export const getMemberDiscountInfo = (durationType) => {
  const product = CONSULTATION_PRODUCTS[durationType];
  
  if (!product) return null;

  return {
    original_price: product.regular_price,
    discounted_price: product.member_price,
    savings: product.regular_price - product.member_price,
    discount_percentage: product.discount_percentage,
    currency: 'EUR'
  };
};

/**
 * Format price for display
 */
export const formatPrice = (price, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export default {
  CONSULTATION_PRODUCTS,
  hasActiveMembership,
  getConsultationPricing,
  createConsultationCheckout,
  getMemberDiscountInfo,
  formatPrice
};