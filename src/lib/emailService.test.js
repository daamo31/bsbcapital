/**
 * 🧪 Tests para Email Service
 * Verifica que los emails se envían correctamente a través de Supabase Edge Functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import emailService from './emailService';
import { supabase } from './customSupabaseClient';

// Mock de Supabase
vi.mock('./customSupabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.functions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    });
  });

  describe('Consultoría Emails', () => {
    it('debería enviar email de consultoría Portfolio Optimization', async () => {
      const result = await emailService.sendConsultationPortfolioOptimization({
        name: 'Test User',
        email: 'test@example.com',
        consultationType: 'Optimización de cartera',
      });

      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'resend-email-secure',
        expect.any(Object)
      );

      // Verificar que el body contiene el tipo correcto
      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('consultation_portfolio_optimization');
      expect(body.to).toBe('test@example.com');
      expect(result.success).toBe(true);
    });

    it('debería enviar email de consultoría Crypto Web3', async () => {
      await emailService.sendConsultationCryptoWeb3({
        name: 'Crypto User',
        email: 'crypto@example.com',
        consultationType: 'Crypto & Web3',
      });

      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('consultation_crypto_web3');
      expect(body.to).toBe('crypto@example.com');
    });

    it('debería enviar email de consultoría Onboarding Crypto', async () => {
      await emailService.sendConsultationCryptoOnboarding({
        name: 'New User',
        email: 'newuser@example.com',
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('consultation_crypto_onboarding');
      expect(body.to).toBe('newuser@example.com');
    });

    it('debería enviar email de consultoría Treasury Crypto', async () => {
      await emailService.sendConsultationTreasuryCrypto({
        companyName: 'Test Company',
        email: 'company@example.com',
        contactPerson: 'John Doe',
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('consultation_treasury_crypto');
      expect(body.to).toBe('company@example.com');
    });
  });

  describe('Paquetes Emails', () => {
    it('debería enviar email de paquete Onboarding Crypto', async () => {
      await emailService.sendPackageCryptoOnboarding({
        name: 'Package User',
        email: 'package@example.com',
        packageName: 'Onboarding Cripto',
        price: 390,
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('package_crypto_onboarding');
      expect(body.to).toBe('package@example.com');
    });

    it('debería enviar email de paquete Treasury Crypto', async () => {
      await emailService.sendPackageTreasuryCrypto({
        name: 'Business User',
        email: 'business@example.com',
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('package_treasury_crypto');
    });

    it('debería enviar email de paquete Inversor Premium', async () => {
      await emailService.sendPackageInvestorPremium({
        name: 'Premium User',
        email: 'premium@example.com',
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('package_investor_premium');
    });
  });

  describe('Membresía Emails', () => {
    it('debería enviar email de membresía anual', async () => {
      await emailService.sendMembershipAnnual({
        name: 'Member User',
        email: 'member@example.com',
        membershipType: 'annual',
        price: 400,
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.type).toBe('membership_annual');
      expect(body.to).toBe('member@example.com');
    });
  });

  describe('Admin Notifications', () => {
    it('debería enviar notificación al admin sobre nueva consultoría', async () => {
      await emailService.sendAdminConsultationNotification({
        adminEmail: 'info@bsbcapital.io',
        clientName: 'New Client',
        clientEmail: 'client@example.com',
        consultationType: 'Crypto & Web3',
        date: '2024-12-10',
        time: '10:00',
      });

      const callArgs = supabase.functions.invoke.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.to).toBe('info@bsbcapital.io');
      expect(body.data.clientName).toBe('New Client');
      expect(body.data.clientEmail).toBe('client@example.com');
    });
  });

  describe('Error Handling', () => {
    it('debería manejar errores de la función de Supabase', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function error' },
      });

      const result = await emailService.sendConsultationCryptoWeb3({
        name: 'Error Test',
        email: 'error@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('debería manejar excepciones de red', async () => {
      supabase.functions.invoke.mockRejectedValueOnce(new Error('Network error'));

      const result = await emailService.sendConsultationCryptoWeb3({
        name: 'Network Test',
        email: 'network@example.com',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Health Check', () => {
    it('debería verificar que el servicio está disponible', async () => {
      supabase.functions.invoke.mockResolvedValueOnce({
        data: { status: 'ok' },
        error: null,
      });

      const result = await emailService.healthCheck();
      expect(result.available).toBe(true);
    });
  });
});
