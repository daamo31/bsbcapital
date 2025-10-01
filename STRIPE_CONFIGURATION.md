# 🔧 Mapeo de Productos Stripe para BSB Capital

## 📋 **Productos Configurados en Stripe**

### **🎓 ACADEMIA (Plan Básico)**
```
ID Producto: prod_T9dymUXkbPpeir
ID Precio: price_1SDKgoJmSk3VG9oiamJj88De
Uso: Plan básico de membresía (3 meses)
```

### **👑 WEALTH MEMBERSHIP (Plan VIP)**
```
ID Producto: prod_T9dspdTkGGM7Sy
ID Precio: price_1SDKb2JmSk3VG9oiJr1unLZZ
Uso: Plan VIP Lifetime
```

### **🥇 PREMIUM INVESTOR ANUAL (Plan Premium)**
```
ID Producto: prod_T9dnmdsdbj1ETL
ID Precio: price_1SDKVXJmSk3VG9oiLEm9JOoD
Uso: Plan Premium (12 meses)
```

### **🥈 PREMIUM INVESTOR (Plan Premium Mensual)**
```
ID Producto: prod_T9dkKyjk6tatez
ID Precio: price_1SDKTKJmSk3VG9oiBTv0HaYK
Uso: Premium mensual (alternativo)
```

### **📈 PLAN TRADER PRO ANUAL**
```
ID Producto: prod_T9dhXgPONVRAwl
ID Precio: price_1SDKQZJmSk3VG9oiGudek18k
Uso: Trader Pro anual
```

### **📊 PLAN TRADER PRO**
```
ID Producto: prod_T9dfdXY3748Dlv
ID Precio: price_1SDKO8JmSk3VG9oiCLuGoE4s
Uso: Plan Básico (usamos este para el plan básico)
```

### **🕐 CONSULTORÍA 30 MIN**
```
ID Producto: prod_SpCgTdM31gAcbP
ID Precio: price_1RtYGsJmSk3VG9oicAWmQ4sN
Uso: Servicios adicionales
```

### **🕓 CONSULTORÍA 1 HORA**
```
ID Producto: prod_SpCfwTWQnfXfls
ID Precio: price_1RtYFkJmSk3VG9oi8wUdMK5k
Uso: Servicios adicionales
```

---

## 🔄 **Mapeo Usado en BSB Capital**

| Plan BSB Capital | Stripe Price ID | Stripe Product ID | Descripción |
|------------------|-----------------|-------------------|-------------|
| **Plan Básico** | `price_1SDKO8JmSk3VG9oiCLuGoE4s` | `prod_T9dfdXY3748Dlv` | PLAN TRADER PRO |
| **Plan Premium** | `price_1SDKVXJmSk3VG9oiLEm9JOoD` | `prod_T9dnmdsdbj1ETL` | PREMIUM INVESTOR ANUAL |
| **Plan VIP Lifetime** | `price_1SDKb2JmSk3VG9oiJr1unLZZ` | `prod_T9dspdTkGGM7Sy` | WEALTH MEMBERSHIP |

---

## 💻 **Configuración en el Código**

### **Variables de Entorno Necesarias:**
```bash
# Stripe Keys (conseguir del dashboard de Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (o pk_live_...)
STRIPE_SECRET_KEY=sk_test_... (o sk_live_...)

# Para Supabase Edge Functions
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Donde conseguir las claves:**
1. Ve a https://dashboard.stripe.com
2. Menú lateral: **Developers → API keys**
3. Copia:
   - **Publishable key** (pk_test_... o pk_live_...)
   - **Secret key** (sk_test_... o sk_live_...)

---

## 🚀 **Próximos Pasos**

### **1. Configurar Variables de Entorno**
```bash
# Crear archivo .env.local en la raíz del proyecto
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI" >> .env.local
echo "STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI" >> .env.local
```

### **2. Configurar en Supabase**
```bash
# Agregar secretos a Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
```

### **3. Actualizar CheckoutPage**
El CheckoutPage ya está preparado para usar los `stripe_price_id` de la base de datos.

### **4. Testing**
Usa las tarjetas de test de Stripe:
- **Éxito**: `4242 4242 4242 4242`
- **Fecha**: `12/34`
- **CVV**: `123`

---

## ⚠️ **Importante**

- ✅ **Modo Test**: Usa claves `pk_test_` y `sk_test_` para pruebas
- ✅ **Modo Live**: Usa claves `pk_live_` y `sk_live_` para producción
- ⚠️ **Nunca** subas las claves secretas a GitHub
- 🔒 **Siempre** usa variables de entorno para las claves

---

## 🎯 **¿Qué Falta?**

1. **Conseguir las claves de Stripe** (pk_test_ y sk_test_)
2. **Configurar variables de entorno**
3. **Probar el checkout completo**
4. **Verificar que las suscripciones se crean correctamente**