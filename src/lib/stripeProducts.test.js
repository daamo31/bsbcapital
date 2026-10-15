import { describe, it, expect } from 'vitest';
import {
  CONSULTATION_PRICES,
  CONSULTATION_MEMBER_PRICES,
  PACKAGE_PRICES,
  MEMBERSHIP_PRICES,
  ACADEMY_PRICES,
  isValidStripePriceId,
} from './stripeProducts';

describe('Stripe Products Configuration', () => {
  describe('Price ID Validation', () => {
    it('should validate correct Stripe price IDs', () => {
      expect(isValidStripePriceId('price_1RtYGsJmSk3VG9oicAWmQ4sN')).toBe(true);
    });

    it('should reject invalid price IDs', () => {
      expect(isValidStripePriceId('invalid_price')).toBe(false);
      expect(isValidStripePriceId('price_short')).toBe(false);
      expect(isValidStripePriceId('')).toBe(false);
    });
  });

  describe('Consultation Prices', () => {
    it('should have 30min consultation with correct pricing', () => {
      const consultation = CONSULTATION_PRICES['30min'];
      expect(consultation.price).toBe(200);
      expect(consultation.duration_minutes).toBe(30);
      expect(isValidStripePriceId(consultation.price_id)).toBe(true);
    });

    it('should have 60min consultation with correct pricing', () => {
      const consultation = CONSULTATION_PRICES['60min'];
      expect(consultation.price).toBe(300);
      expect(consultation.duration_minutes).toBe(60);
      expect(isValidStripePriceId(consultation.price_id)).toBe(true);
    });
  });

  describe('Consultation Member Discounts', () => {
    it('should have 20% discount for 30min', () => {
      const member = CONSULTATION_MEMBER_PRICES['30min'];
      expect(member.regular_price).toBe(75);
      expect(member.member_price).toBe(60);
      expect(member.discount_percentage).toBe(20);
      // Verify discount calculation
      const expectedDiscount = member.regular_price * 0.2;
      expect(member.regular_price - member.member_price).toBe(expectedDiscount);
    });

    it('should have 20% discount for 60min', () => {
      const member = CONSULTATION_MEMBER_PRICES['60min'];
      expect(member.regular_price).toBe(150);
      expect(member.member_price).toBe(120);
      expect(member.discount_percentage).toBe(20);
    });
  });

  describe('Package Prices (Paquetes BSB)', () => {
    it('should have Onboarding Cripto package', () => {
      const pkg = PACKAGE_PRICES.onboarding_crypto;
      expect(pkg.name).toBe('Onboarding Cripto');
      expect(pkg.price_annual).toBe(390);
      expect(pkg.price_original).toBe(500);
      expect(pkg.mode).toBe('payment');
      expect(isValidStripePriceId(pkg.stripe_price_id_annual)).toBe(true);
    });

    it('should have Inversor Premium package as highlighted', () => {
      const pkg = PACKAGE_PRICES.inversor_premium;
      expect(pkg.name).toBe('Inversor Premium');
      expect(pkg.price_annual).toBe(2400);
      expect(pkg.highlight).toBe(true);
      expect(isValidStripePriceId(pkg.stripe_price_id_annual)).toBe(true);
    });

    it('should have Gestión Tesorería for empresas', () => {
      const pkg = PACKAGE_PRICES.gestion_tesoreria;
      expect(pkg.price_annual).toBe(1200);
      expect(pkg.mode).toBe('payment');
      expect(isValidStripePriceId(pkg.stripe_price_id_annual)).toBe(true);
    });

    it('all packages should use payment mode (one-time)', () => {
      Object.values(PACKAGE_PRICES).forEach((pkg) => {
        expect(pkg.mode).toBe('payment');
      });
    });
  });

  describe('Membership Prices (Membresía Exclusiva)', () => {
    it('should have monthly membership', () => {
      const membership = MEMBERSHIP_PRICES.monthly;
      expect(membership.price).toBe(40);
      expect(membership.mode).toBe('subscription');
      expect(membership.interval).toBe('month');
      expect(isValidStripePriceId(membership.stripe_price_id)).toBe(true);
    });

    it('should have annual membership with savings', () => {
      const annual = MEMBERSHIP_PRICES.annual;
      const monthly = MEMBERSHIP_PRICES.monthly;
      expect(annual.price).toBe(400);
      expect(annual.mode).toBe('payment'); // pago único
      expect(annual.interval).toBe('year');
      // Annual should save money vs 12 months
      const monthlyTotal = monthly.price * 12; // 480€
      expect(annual.price).toBeLessThan(monthlyTotal);
      expect(isValidStripePriceId(annual.stripe_price_id)).toBe(true);
    });
  });

  describe('Academy Prices', () => {
    it('should have monthly academy subscription', () => {
      const academy = ACADEMY_PRICES.monthly;
      expect(academy.price).toBe(29);
      expect(academy.mode).toBe('subscription');
      expect(isValidStripePriceId(academy.stripe_price_id)).toBe(true);
    });

    it('should have annual academy with savings', () => {
      const annual = ACADEMY_PRICES.annual;
      const monthly = ACADEMY_PRICES.monthly;
      expect(annual.price).toBe(290);
      // Annual = 10 months instead of 12
      const monthlyTotal = monthly.price * 12; // 348€
      expect(annual.price).toBeLessThan(monthlyTotal);
      expect(isValidStripePriceId(annual.stripe_price_id)).toBe(true);
    });
  });

  describe('All Products have valid Stripe IDs', () => {
    it('all consultation price IDs should be valid', () => {
      Object.values(CONSULTATION_PRICES).forEach((c) => {
        expect(isValidStripePriceId(c.price_id)).toBe(true);
      });
    });

    it('all package price IDs should be valid', () => {
      Object.values(PACKAGE_PRICES).forEach((p) => {
        expect(isValidStripePriceId(p.stripe_price_id_annual)).toBe(true);
      });
    });

    it('all membership price IDs should be valid', () => {
      Object.values(MEMBERSHIP_PRICES).forEach((m) => {
        expect(isValidStripePriceId(m.stripe_price_id)).toBe(true);
      });
    });

    it('all academy price IDs should be valid', () => {
      Object.values(ACADEMY_PRICES).forEach((a) => {
        expect(isValidStripePriceId(a.stripe_price_id)).toBe(true);
      });
    });
  });
});
