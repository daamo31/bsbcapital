-- Crear usuario de prueba en Supabase Auth
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'test@bsbcapital.com',
  crypt('TestUser123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Usuario Prueba BSB"}',
  'authenticated',
  'authenticated'
);

-- Simular una compra exitosa para el usuario de prueba
INSERT INTO hotmart_checkouts (
  user_id,
  email,
  name,
  product_id,
  checkout_url,
  status,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@bsbcapital.com'),
  'test@bsbcapital.com',
  'Usuario Prueba BSB',
  '6308462',
  'https://checkout.hotmart.com/test-checkout-url',
  'approved',
  now()
);

-- Crear registro de acceso para el usuario de prueba
INSERT INTO user_access (
  user_id,
  product_id,
  access_type,
  status,
  expires_at,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@bsbcapital.com'),
  '6308462',
  'course',
  'active',
  now() + INTERVAL '1 year',
  now()
);