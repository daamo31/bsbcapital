import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ConsultationPostPayment from '../ConsultationPostPayment';
import emailService from '@/lib/emailService';
import { supabase } from '@/lib/customSupabaseClient';

// Mock de dependencias
vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

vi.mock('@/lib/emailService', () => ({
  default: {
    sendConsultationPortfolioOptimization: vi.fn(),
    sendConsultationCryptoWeb3: vi.fn(),
    sendConsultationCryptoOnboarding: vi.fn(),
    sendConsultationTreasuryCrypto: vi.fn(),
    sendNewConsultationNotification: vi.fn(),
  },
}));

vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  }),
}));

// Wrapper para React Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ConsultationPostPayment - Formularios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de auth.getUser
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    });
  });

  describe('Formulario Financial Planning (Optimización de cartera)', () => {
    beforeEach(() => {
      // Mock de consulta tipo financial_planning
      const mockConsultation = {
        id: 'test-consultation-1',
        service: 'financial_planning',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 60,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });
    });

    it('debe renderizar el formulario de Financial Planning correctamente', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-1');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByText(/Optimización de cartera/i)).toBeInTheDocument();
      });
    });

    it('debe mostrar campos específicos de Financial Planning', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-1');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/País de residencia/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Rango de ingresos mensuales/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Porcentaje.*ahorro/i)).toBeInTheDocument();
      });
    });

    it('debe enviar emails correctos al completar formulario Financial Planning', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-1');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      // Mock de update exitoso
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-consultation-1',
            service: 'financial_planning',
            user_id: 'test-user-id',
            scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
            duration_minutes: 60,
          },
          error: null,
        }),
        update: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'test-consultation-1',
              service: 'financial_planning',
              client_name: 'Test User',
              client_email: 'test@example.com',
            },
          ],
          error: null,
        }),
      });

      renderWithRouter(<ConsultationPostPayment />);

      // Esperar a que cargue el formulario
      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      // Llenar campos obligatorios
      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });

      // Enviar formulario
      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      // Verificar que se llamó al servicio de email correcto
      await waitFor(() => {
        expect(emailService.sendConsultationPortfolioOptimization).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            consultationType: expect.any(String),
          })
        );
      });
    });
  });

  describe('Formulario Crypto Web3 (portfolio)', () => {
    beforeEach(() => {
      const mockConsultation = {
        id: 'test-consultation-2',
        service: 'portfolio',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 60,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });
    });

    it('debe mostrar el nombre correcto "Crypto & Web3"', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-2');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByText(/Crypto & Web3/i)).toBeInTheDocument();
      });
    });

    it('debe usar GenericConsultationForm para tipo portfolio', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-2');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Objetivos de la Consultoría/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Tamaño aproximado de cartera/i)).toBeInTheDocument();
      });
    });

    it('debe enviar email crypto web3 al completar formulario portfolio', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-2');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-consultation-2',
            service: 'portfolio',
            user_id: 'test-user-id',
            scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
            duration_minutes: 60,
          },
          error: null,
        }),
        update: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'test-consultation-2',
              service: 'portfolio',
              client_name: 'Crypto User',
              client_email: 'crypto@example.com',
            },
          ],
          error: null,
        }),
      });

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Crypto User' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'crypto@example.com' },
      });

      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailService.sendConsultationCryptoWeb3).toHaveBeenCalled();
      });
    });
  });

  describe('Formulario Onboarding Crypto', () => {
    beforeEach(() => {
      const mockConsultation = {
        id: 'test-consultation-3',
        service: 'onboarding_crypto',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 30,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });
    });

    it('debe renderizar OnboardingCryptoForm', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-3');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByText(/Onboarding cripto/i)).toBeInTheDocument();
        expect(
          screen.getByLabelText(/¿Has invertido antes en criptomonedas?/i)
        ).toBeInTheDocument();
      });
    });

    it('debe enviar email de onboarding crypto', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-3');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-consultation-3',
            service: 'onboarding_crypto',
            user_id: 'test-user-id',
            scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
            duration_minutes: 30,
          },
          error: null,
        }),
        update: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'test-consultation-3',
              service: 'onboarding_crypto',
              client_name: 'Onboarding User',
              client_email: 'onboarding@example.com',
            },
          ],
          error: null,
        }),
      });

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Onboarding User' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'onboarding@example.com' },
      });

      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailService.sendConsultationCryptoOnboarding).toHaveBeenCalled();
      });
    });
  });

  describe('Formulario Gestión de Tesorería Cripto (crypto_advanced)', () => {
    beforeEach(() => {
      const mockConsultation = {
        id: 'test-consultation-4',
        service: 'crypto_advanced',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 90,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });
    });

    it('debe mostrar nombre correcto "Gestión de tesorería cripto para empresas"', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-4');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByText(/Gestión de tesorería cripto para empresas/i)).toBeInTheDocument();
      });
    });

    it('debe renderizar TreasuryEnterpriseForm con campos empresariales', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-4');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre de la empresa/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/País de constitución/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Persona de contacto/i)).toBeInTheDocument();
      });
    });

    it('debe enviar email de treasury crypto', async () => {
      const searchParams = new URLSearchParams('?consultation_id=test-consultation-4');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-consultation-4',
            service: 'crypto_advanced',
            user_id: 'test-user-id',
            scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
            duration_minutes: 90,
          },
          error: null,
        }),
        update: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'test-consultation-4',
              service: 'crypto_advanced',
              company_name: 'Test Company',
              contact_person: 'Contact Person',
            },
          ],
          error: null,
        }),
      });

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Treasury User' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'treasury@example.com' },
      });

      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailService.sendConsultationTreasuryCrypto).toHaveBeenCalled();
      });
    });
  });

  describe('Funcionalidad "Completar Más Tarde"', () => {
    it('debe guardar datos parciales sin enviar emails', async () => {
      const mockConsultation = {
        id: 'test-consultation-5',
        service: 'portfolio',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 60,
        status: 'pending',
      };

      const mockUpdate = vi.fn().mockResolvedValue({
        data: [mockConsultation],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: mockUpdate,
      });

      const searchParams = new URLSearchParams('?consultation_id=test-consultation-5');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      // Llenar algunos campos
      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Partial User' },
      });

      // Hacer clic en "Completar Más Tarde"
      const laterButton = screen.getByText(/Completar Más Tarde/i);
      fireEvent.click(laterButton);

      // Verificar que se guardó pero NO se enviaron emails
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            form_data_json: expect.objectContaining({
              client_name: 'Partial User',
            }),
          })
        );

        // NO debe enviar emails
        expect(emailService.sendConsultationPortfolioOptimization).not.toHaveBeenCalled();
        expect(emailService.sendConsultationCryptoWeb3).not.toHaveBeenCalled();
        expect(emailService.sendConsultationCryptoOnboarding).not.toHaveBeenCalled();
        expect(emailService.sendConsultationTreasuryCrypto).not.toHaveBeenCalled();
      });
    });
  });

  describe('Validación de formularios', () => {
    it('debe validar campos obligatorios antes de enviar', async () => {
      const mockConsultation = {
        id: 'test-consultation-6',
        service: 'financial_planning',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 60,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      });

      const searchParams = new URLSearchParams('?consultation_id=test-consultation-6');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      // Intentar enviar sin llenar campos
      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      // No debe enviar emails si falta validación
      await waitFor(() => {
        expect(emailService.sendConsultationPortfolioOptimization).not.toHaveBeenCalled();
      });
    });
  });

  describe('Envío de notificación admin', () => {
    it('debe enviar email de notificación a administradores', async () => {
      const mockConsultation = {
        id: 'test-consultation-7',
        service: 'portfolio',
        user_id: 'test-user-id',
        scheduled_at: new Date('2025-12-10T10:00:00').toISOString(),
        duration_minutes: 60,
        status: 'pending',
      };

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConsultation,
          error: null,
        }),
        update: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'test-consultation-7',
              service: 'portfolio',
              client_name: 'Admin Test',
              client_email: 'admin@example.com',
            },
          ],
          error: null,
        }),
      });

      const searchParams = new URLSearchParams('?consultation_id=test-consultation-7');
      window.history.pushState({}, '', `?${searchParams.toString()}`);

      renderWithRouter(<ConsultationPostPayment />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
        target: { value: 'Admin Test' },
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'admin@example.com' },
      });

      const submitButton = screen.getByText(/Confirmar Consultoría/i);
      fireEvent.click(submitButton);

      // Debe enviar notificación al admin
      await waitFor(() => {
        expect(emailService.sendNewConsultationNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            adminEmail: 'info@bsbcapital.io',
          })
        );
      });
    });
  });
});
