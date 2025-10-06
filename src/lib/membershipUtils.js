import { supabase } from '@/lib/customSupabaseClient';

// Función para manejar el éxito de pago con Stripe
export const handlePaymentSuccess = async (stripeSession) => {
  try {
    const { 
      customer_email,
      customer,
      subscription,
      metadata 
    } = stripeSession;

    const membershipTier = metadata?.membership_tier || 'basic';
    
    // Calcular fecha de expiración (si no es lifetime)
    const expiresAt = membershipTier === 'lifetime' ? null : 
      new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 año

    // Actualizar membresía del usuario
    const { data, error } = await supabase.rpc('update_user_membership', {
      user_email: customer_email,
      new_tier: membershipTier,
      stripe_customer_id_param: customer,
      stripe_subscription_id_param: subscription,
      expires_at: expiresAt
    });

    if (error) {
      console.error('Error updating membership:', error);
      return { success: false, error };
    }

    console.log('Membership updated successfully:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
    return { success: false, error };
  }
};

// Función para manejar cancelación de suscripción
export const handleSubscriptionCancellation = async (stripeSubscriptionId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        subscription_status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error handling cancellation:', error);
    return { success: false, error };
  }
};

// Función para manejar expiración de suscripción
export const handleSubscriptionExpiration = async () => {
  try {
    // Encontrar suscripciones expiradas
    const { data: expiredUsers, error } = await supabase
      .from('users')
      .select('*')
      .lt('subscription_expires_at', new Date().toISOString())
      .eq('subscription_status', 'active');

    if (error) throw error;

    // Actualizar usuarios expirados
    for (const user of expiredUsers) {
      await supabase.rpc('update_user_membership', {
        user_email: user.email,
        new_tier: 'free'
      });
    }

    return { success: true, updated: expiredUsers.length };
  } catch (error) {
    console.error('Error handling expiration:', error);
    return { success: false, error };
  }
};

// Función para verificar y sincronizar estado con Stripe
export const syncWithStripe = async (stripeCustomerId) => {
  try {
    // Aquí implementarías la lógica para verificar el estado actual en Stripe
    // y sincronizar con tu base de datos
    
    // Ejemplo básico:
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (error) throw error;

    // Verificar estado en Stripe y actualizar si es necesario
    // (implementar según tu configuración de Stripe)
    
    return { success: true, user };
  } catch (error) {
    console.error('Error syncing with Stripe:', error);
    return { success: false, error };
  }
};