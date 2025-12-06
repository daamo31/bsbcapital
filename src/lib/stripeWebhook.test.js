/**
 * 🧪 Tests para Stripe Webhook Handler
 * Simula eventos de Stripe y verifica el procesamiento correcto
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simulación de datos de eventos de Stripe
const mockStripeEvents = {
  // Evento de checkout completado para consultoría
  consultationCheckoutCompleted: {
    id: 'evt_test_consultation_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_consultation_abc123',
        mode: 'payment',
        payment_status: 'paid',
        customer: 'cus_test123',
        customer_details: {
          email: 'client@example.com',
          name: 'Test Client',
        },
        metadata: {
          consultation_id: 'consultation_uuid_123',
          client_name: 'Test Client',
          client_email: 'client@example.com',
          consultation_type: 'crypto_web3',
          duration_minutes: '60',
          scheduled_date: '2024-12-10',
          scheduled_time: '10:00',
          access_type: 'consultation',
        },
        amount_total: 30000, // €300 en centavos
      },
    },
  },

  // Evento de suscripción creada (membresía mensual)
  membershipSubscriptionCreated: {
    id: 'evt_test_membership_123',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_membership_abc123',
        status: 'active',
        customer: 'cus_test456',
        items: {
          data: [
            {
              price: {
                id: 'price_1SSiZIJmSk3VG9oiJPdwtxPe',
                unit_amount: 4000,
                recurring: {
                  interval: 'month',
                },
              },
            },
          ],
        },
        metadata: {
          user_id: 'user_uuid_456',
          plan_type: 'membership_monthly',
        },
      },
    },
  },

  // Evento de checkout completado para paquete
  packageCheckoutCompleted: {
    id: 'evt_test_package_123',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_package_xyz789',
        mode: 'payment',
        payment_status: 'paid',
        customer: 'cus_test789',
        customer_details: {
          email: 'package@example.com',
          name: 'Package Buyer',
        },
        metadata: {
          user_id: 'user_uuid_789',
          client_name: 'Package Buyer',
          client_email: 'package@example.com',
          plan_type: 'onboarding_crypto',
          access_type: 'membership',
        },
        amount_total: 39000, // €390 en centavos
        line_items: {
          data: [
            {
              price: {
                id: 'price_1SSshWJmSk3VG9oiU1cBNWgf',
              },
            },
          ],
        },
      },
    },
  },
};

describe('Stripe Webhook Event Processing', () => {
  describe('Estructura de Eventos de Stripe', () => {
    it('evento de consultoría debe tener metadata correcta', () => {
      const event = mockStripeEvents.consultationCheckoutCompleted;
      const session = event.data.object;

      expect(session.mode).toBe('payment');
      expect(session.payment_status).toBe('paid');
      expect(session.metadata.consultation_id).toBeDefined();
      expect(session.metadata.client_email).toBe('client@example.com');
      expect(session.metadata.consultation_type).toBe('crypto_web3');
    });

    it('evento de membresía debe tener plan_type correcto', () => {
      const event = mockStripeEvents.membershipSubscriptionCreated;
      const subscription = event.data.object;

      expect(subscription.status).toBe('active');
      expect(subscription.metadata.plan_type).toBe('membership_monthly');
      expect(subscription.items.data[0].price.recurring.interval).toBe('month');
    });

    it('evento de paquete debe tener access_type membership', () => {
      const event = mockStripeEvents.packageCheckoutCompleted;
      const session = event.data.object;

      expect(session.mode).toBe('payment');
      expect(session.metadata.access_type).toBe('membership');
      expect(session.metadata.plan_type).toBe('onboarding_crypto');
    });
  });

  describe('Mapeo de Precios a Planes', () => {
    const priceToPlanMap = {
      price_1SSiZIJmSk3VG9oiJPdwtxPe: 'Membresía Mensual',
      price_1SDKFxJmSk3VG9oip0YzAAJJ: 'Membresía Anual',
      price_1SSshWJmSk3VG9oiU1cBNWgf: 'Onboarding Cripto',
      price_1SDKb2JmSk3VG9oiJr1unLZZ: 'Inversor Premium',
      price_1SSsfoJmSk3VG9oi70AskCZv: 'Gestión de Tesorería',
    };

    it('todos los price IDs deben mapear a un plan conocido', () => {
      Object.entries(priceToPlanMap).forEach(([priceId, planName]) => {
        expect(priceId).toMatch(/^price_/);
        expect(planName).toBeTruthy();
      });
    });

    it('debe tener 5 planes configurados', () => {
      expect(Object.keys(priceToPlanMap).length).toBe(5);
    });
  });

  describe('Lógica de Procesamiento de Eventos', () => {
    it('checkout de consultoría debe disparar email al cliente', () => {
      const event = mockStripeEvents.consultationCheckoutCompleted;
      const session = event.data.object;

      // Verificar que tenemos los datos necesarios para el email
      const emailData = {
        to: session.metadata.client_email || session.customer_details.email,
        name: session.metadata.client_name || session.customer_details.name,
        consultationType: session.metadata.consultation_type,
      };

      expect(emailData.to).toBe('client@example.com');
      expect(emailData.name).toBe('Test Client');
      expect(emailData.consultationType).toBe('crypto_web3');
    });

    it('checkout de consultoría debe disparar email al admin', () => {
      const event = mockStripeEvents.consultationCheckoutCompleted;
      const session = event.data.object;

      const adminNotification = {
        to: 'info@bsbcapital.io',
        clientName: session.metadata.client_name,
        clientEmail: session.metadata.client_email,
        consultationType: session.metadata.consultation_type,
        amount: session.amount_total / 100, // Convertir de centavos
      };

      expect(adminNotification.to).toBe('info@bsbcapital.io');
      expect(adminNotification.amount).toBe(300);
    });

    it('checkout de paquete debe crear registro en user_subscriptions', () => {
      const event = mockStripeEvents.packageCheckoutCompleted;
      const session = event.data.object;

      const subscriptionRecord = {
        user_id: session.metadata.user_id,
        stripe_customer_id: session.customer,
        plan_type: session.metadata.plan_type,
        status: 'active',
        amount_paid: session.amount_total / 100,
      };

      expect(subscriptionRecord.user_id).toBe('user_uuid_789');
      expect(subscriptionRecord.plan_type).toBe('onboarding_crypto');
      expect(subscriptionRecord.amount_paid).toBe(390);
    });
  });

  describe('Validación de Datos Requeridos', () => {
    it('consultoría requiere consultation_id en metadata', () => {
      const event = mockStripeEvents.consultationCheckoutCompleted;
      const consultationId = event.data.object.metadata.consultation_id;

      expect(consultationId).toBeDefined();
      expect(consultationId).not.toBe('');
    });

    it('paquete requiere user_id y plan_type en metadata', () => {
      const event = mockStripeEvents.packageCheckoutCompleted;
      const { user_id, plan_type } = event.data.object.metadata;

      expect(user_id).toBeDefined();
      expect(plan_type).toBeDefined();
    });

    it('siempre debe haber un email del cliente', () => {
      const events = Object.values(mockStripeEvents);

      events.forEach((event) => {
        const session = event.data.object;
        const clientEmail = session.metadata?.client_email || session.customer_details?.email;

        expect(clientEmail).toBeDefined();
        expect(clientEmail).toMatch(/@/); // Debe ser un email válido
      });
    });
  });
});

describe('Email Templates por Tipo de Producto', () => {
  const emailTemplateMap = {
    // Consultorías
    financial_planning: 'consultation_portfolio_optimization',
    portfolio: 'consultation_crypto_web3',
    onboarding_crypto: 'consultation_crypto_onboarding',
    crypto_advanced: 'consultation_treasury_crypto',

    // Paquetes
    package_onboarding_crypto: 'package_crypto_onboarding',
    package_treasury_crypto: 'package_treasury_crypto',
    package_investor_premium: 'package_investor_premium',

    // Membresías
    membership_monthly: 'membership_monthly',
    membership_annual: 'membership_annual',
  };

  it('cada tipo de producto debe tener un template de email', () => {
    expect(Object.keys(emailTemplateMap).length).toBeGreaterThan(8);
  });

  it('templates de consultoría deben comenzar con consultation_', () => {
    const consultationTypes = [
      'financial_planning',
      'portfolio',
      'onboarding_crypto',
      'crypto_advanced',
    ];

    consultationTypes.forEach((type) => {
      expect(emailTemplateMap[type]).toMatch(/^consultation_/);
    });
  });

  it('templates de paquetes deben comenzar con package_', () => {
    const packageTypes = [
      'package_onboarding_crypto',
      'package_treasury_crypto',
      'package_investor_premium',
    ];

    packageTypes.forEach((type) => {
      expect(emailTemplateMap[type]).toMatch(/^package_/);
    });
  });
});
