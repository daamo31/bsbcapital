import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CONSULTATION_PRODUCTS, getMemberDiscountInfo, formatPrice } from './consultationPricing';

// Note: getConsultationPricing requires async supabase calls,
// so we test the pure functions first

describe('Consultation Pricing Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CONSULTATION_PRODUCTS', () => {
    it('should have 30 min consultation with correct pricing', () => {
      const product = CONSULTATION_PRODUCTS['30_min'];
      expect(product.regular_price).toBe(75);
      expect(product.member_price).toBe(60);
      expect(product.discount_percentage).toBe(20);
      expect(product.duration).toBe(30);
    });

    it('should have 60 min consultation with correct pricing', () => {
      const product = CONSULTATION_PRODUCTS['60_min'];
      expect(product.regular_price).toBe(150);
      expect(product.member_price).toBe(120);
      expect(product.discount_percentage).toBe(20);
      expect(product.duration).toBe(60);
    });

    it('should calculate member savings correctly for 30 min', () => {
      const product = CONSULTATION_PRODUCTS['30_min'];
      const savings = product.regular_price - product.member_price;
      expect(savings).toBe(15); // 75 - 60 = 15 EUR savings
    });

    it('should calculate member savings correctly for 60 min', () => {
      const product = CONSULTATION_PRODUCTS['60_min'];
      const savings = product.regular_price - product.member_price;
      expect(savings).toBe(30); // 150 - 120 = 30 EUR savings
    });
  });

  describe('getMemberDiscountInfo', () => {
    it('should return correct discount info for 30 min', () => {
      const info = getMemberDiscountInfo('30_min');
      expect(info.original_price).toBe(75);
      expect(info.discounted_price).toBe(60);
      expect(info.savings).toBe(15);
      expect(info.discount_percentage).toBe(20);
      expect(info.currency).toBe('EUR');
    });

    it('should return correct discount info for 60 min', () => {
      const info = getMemberDiscountInfo('60_min');
      expect(info.original_price).toBe(150);
      expect(info.discounted_price).toBe(120);
      expect(info.savings).toBe(30);
      expect(info.discount_percentage).toBe(20);
    });

    it('should return null for invalid duration type', () => {
      const info = getMemberDiscountInfo('90_min');
      expect(info).toBeNull();
    });
  });

  describe('formatPrice', () => {
    it('should format EUR correctly', () => {
      const formatted = formatPrice(75);
      expect(formatted).toContain('75');
      expect(formatted).toContain('€');
    });

    it('should format decimal values correctly', () => {
      const formatted = formatPrice(1234.56);
      expect(formatted).toContain('€');
    });

    it('should handle zero price', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0');
      expect(formatted).toContain('€');
    });
  });
});
