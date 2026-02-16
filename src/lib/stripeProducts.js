/**
 * Stripe Products Configuration
 * Archivo centralizado con todos los Price IDs de Stripe
 *
 * Para testing usa el price_id "test" de consultorías: price_1SKG4NJmSk3VG9oi6CjvmqLC
 */

// Consultorías
export const CONSULTATION_PRICES = {
  '30min': {
    name: 'Consultoría 30 minutos',
    price: 200,
    price_id: 'price_1RtYGsJmSk3VG9oicAWmQ4sN',
    duration_minutes: 30,
  },
  '60min': {
    name: 'Consultoría 60 minutos',
    price: 300,
    price_id: 'price_1RtYFkJmSk3VG9oi8wUdMK5k',
    duration_minutes: 60,
  },
  test: {
    name: 'Consultoría Test',
    price: 1, // Precio mínimo para testing
    price_id: 'price_1SKG4NJmSk3VG9oi6CjvmqLC',
    product_id: 'prod_TGnf81ENbBkghj',
    duration_minutes: 5,
    is_test: true,
  },
};

// Consultoría con descuento de miembro (20% off)
export const CONSULTATION_MEMBER_PRICES = {
  '30min': {
    regular_price: 75,
    member_price: 60,
    member_price_id: 'price_1SHoSzJmSk3VG9oiEF2xRHNp',
    discount_percentage: 20,
  },
  '60min': {
    regular_price: 150,
    member_price: 120,
    member_price_id: 'price_1SHoU8JmSk3VG9oiiMmypJRJ',
    discount_percentage: 20,
  },
};

// Paquetes BSB Capital
export const PACKAGE_PRICES = {
  onboarding_crypto: {
    name: 'Onboarding Cripto',
    price_annual: 390,
    price_original: 500,
    stripe_price_id_annual: 'price_1SSshWJmSk3VG9oiU1cBNWgf',
    stripe_product_id: 'prod_TPi7iCVtydt3Cw',
    mode: 'payment', // pago único
    highlight: true,
  },
  inversor_premium: {
    name: 'Inversor Premium',
    price_annual: 2400,
    stripe_price_id_annual: 'price_1SDKb2JmSk3VG9oiJr1unLZZ',
    stripe_product_id: 'prod_T9dspdTkGGM7Sy',
    mode: 'payment',
  },
  gestion_tesoreria: {
    name: 'Gestión Tesorería Cripto para Empresas',
    price_annual: 1200,
    stripe_price_id_annual: 'price_1SSsfoJmSk3VG9oi70AskCZv',
    stripe_product_id: 'prod_TPi5l6SK9nwBKF',
    mode: 'payment',
  },
};

// Membresía Exclusiva BSB
export const MEMBERSHIP_PRICES = {
  monthly: {
    name: 'Membresía Exclusiva BSB Mensual',
    price: 40,
    stripe_price_id: 'price_1SaXofJmSk3VG9oigjDZtcF6',
    stripe_product_id: 'prod_TXd41kG8ddpyDP',
    mode: 'subscription',
    interval: 'month',
  },
  annual: {
    name: 'Membresía Exclusiva BSB Anual',
    price: 400,
    stripe_price_id: 'price_1SaXpNJmSk3VG9oifsW4ajZ2',
    stripe_product_id: 'prod_TXd5JJfHRg8ZTx',
    mode: 'payment', // pago único anual
    interval: 'year',
  },
};

// Academia
export const ACADEMY_PRICES = {
  monthly: {
    name: 'Academia BSB Mensual',
    price: 29,
    stripe_price_id: 'price_1SaXVjJmSk3VG9oix0Pu2N9J',
    mode: 'subscription',
    interval: 'month',
  },
  annual: {
    name: 'Academia BSB Anual',
    price: 290,
    stripe_price_id: 'price_1SDKgoJmSk3VG9oiamJj88De',
    mode: 'payment',
    interval: 'year',
  },
};

// Price ID de test para usar en cualquier flujo
export const TEST_PRICE_ID = 'price_1SKG4NJmSk3VG9oi6CjvmqLC';

// Exportar todos los productos
export const ALL_PRODUCTS = {
  consultations: CONSULTATION_PRICES,
  consultation_member: CONSULTATION_MEMBER_PRICES,
  packages: PACKAGE_PRICES,
  membership: MEMBERSHIP_PRICES,
  academy: ACADEMY_PRICES,
};

/**
 * Helper para obtener el Price ID de test
 * Útil para probar cualquier flujo de checkout sin pagar de verdad
 */
export const getTestPriceId = () => TEST_PRICE_ID;

/**
 * Valida que un price_id tenga el formato correcto de Stripe
 */
export const isValidStripePriceId = (priceId) => {
  return /^price_[a-zA-Z0-9]{24,}$/.test(priceId);
};

export default ALL_PRODUCTS;
