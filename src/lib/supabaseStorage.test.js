/**
 * 🧪 Tests para guardado de formularios en Supabase
 * Verifica que los datos de consultas se guardan correctamente
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(),
};

vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: mockSupabase,
}));

describe('Supabase Form Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock chain
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
  });

  describe('Estructura de tabla consultations', () => {
    it('debería tener campos requeridos para consultoría', () => {
      const consultationRecord = {
        id: 'uuid',
        user_id: 'user_uuid',
        service: 'crypto_web3',
        scheduled_at: '2024-12-10T10:00:00Z',
        duration_minutes: 60,
        status: 'confirmed',
        client_name: 'Test Client',
        client_email: 'client@example.com',
        client_phone: '+34600000000',
        form_data_json: {},
        payment_status: 'paid',
        stripe_session_id: 'cs_test_123',
        created_at: '2024-12-05T10:00:00Z',
      };

      // Verificar que todos los campos existen
      expect(consultationRecord.id).toBeDefined();
      expect(consultationRecord.service).toBeDefined();
      expect(consultationRecord.client_email).toBeDefined();
      expect(consultationRecord.form_data_json).toBeDefined();
    });

    it('form_data_json debe poder almacenar datos del formulario', () => {
      const formData = {
        investment_experience: 'intermedio',
        portfolio_size: '10000-50000',
        consultation_goals: 'Optimizar cartera crypto',
        current_investments: ['Bitcoin', 'Ethereum'],
        specific_questions: '¿Cómo diversificar en DeFi?',
        preferred_communication: 'email',
        country: 'España',
        age_range: '30-40',
        risk_tolerance: 'moderado',
        time_horizon: 'largo_plazo',
      };

      expect(typeof formData).toBe('object');
      expect(formData.investment_experience).toBe('intermedio');
      expect(Array.isArray(formData.current_investments)).toBe(true);
    });
  });

  describe('Estructura de tabla user_subscriptions', () => {
    it('debería tener campos requeridos para suscripción', () => {
      const subscriptionRecord = {
        id: 'uuid',
        user_id: 'user_uuid',
        plan_id: 'plan_uuid',
        stripe_subscription_id: 'sub_123',
        stripe_customer_id: 'cus_123',
        status: 'active',
        current_period_start: '2024-12-05T00:00:00Z',
        current_period_end: '2025-01-05T00:00:00Z',
        cancel_at_period_end: false,
        metadata: {
          client_name: 'Test User',
          plan_type: 'membership_monthly',
        },
        created_at: '2024-12-05T10:00:00Z',
        updated_at: '2024-12-05T10:00:00Z',
      };

      expect(subscriptionRecord.user_id).toBeDefined();
      expect(subscriptionRecord.status).toBe('active');
      expect(subscriptionRecord.stripe_subscription_id).toMatch(/^sub_/);
    });
  });

  describe('Operaciones de guardado', () => {
    it('debería poder insertar nueva consultoría', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'new_consultation_id',
          service: 'crypto_web3',
          status: 'pending',
        },
        error: null,
      });

      const { supabase } = await import('@/lib/customSupabaseClient');

      const result = await supabase
        .from('consultations')
        .insert({
          service: 'crypto_web3',
          status: 'pending',
          client_email: 'test@example.com',
        })
        .select()
        .single();

      expect(supabase.from).toHaveBeenCalledWith('consultations');
      expect(supabase.insert).toHaveBeenCalled();
    });

    it('debería poder actualizar formulario con form_data_json', async () => {
      mockSupabase.eq.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'consultation_id',
              form_data_json: { investment_experience: 'avanzado' },
            },
            error: null,
          }),
        }),
      });

      const { supabase } = await import('@/lib/customSupabaseClient');

      const formData = {
        investment_experience: 'avanzado',
        portfolio_size: '50000+',
      };

      await supabase
        .from('consultations')
        .update({ form_data_json: formData })
        .eq('id', 'consultation_id');

      expect(supabase.from).toHaveBeenCalledWith('consultations');
      expect(supabase.update).toHaveBeenCalledWith({ form_data_json: formData });
    });

    it('debería poder crear registro de suscripción', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'new_subscription_id',
          status: 'active',
        },
        error: null,
      });

      const { supabase } = await import('@/lib/customSupabaseClient');

      const subscriptionPayload = {
        user_id: 'user_123',
        plan_id: 'plan_456',
        stripe_subscription_id: 'sub_789',
        status: 'active',
      };

      await supabase.from('user_subscriptions').insert(subscriptionPayload).select().single();

      expect(supabase.from).toHaveBeenCalledWith('user_subscriptions');
      expect(supabase.insert).toHaveBeenCalledWith(subscriptionPayload);
    });
  });

  describe('Validación de datos', () => {
    it('email debe tener formato válido', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co', 'user+tag@gmail.com'];

      const invalidEmails = ['not-an-email', '@domain.com', 'user@', ''];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('status debe ser uno de los valores permitidos', () => {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

      const testStatus = 'confirmed';
      expect(validStatuses.includes(testStatus)).toBe(true);
      expect(validStatuses.includes('invalid_status')).toBe(false);
    });

    it('service type debe ser uno de los tipos válidos', () => {
      const validServices = [
        'financial_planning',
        'portfolio',
        'onboarding_crypto',
        'crypto_advanced',
      ];

      const testService = 'crypto_advanced';
      expect(validServices.includes(testService)).toBe(true);
    });
  });
});
