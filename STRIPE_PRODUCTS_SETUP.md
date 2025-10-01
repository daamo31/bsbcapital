# 🎯 Manual para crear Productos en Stripe

## 📋 Paso a Paso

### 1. Acceder al Dashboard de Stripe
- Ve a https://dashboard.stripe.com
- Asegúrate de estar en el modo **LIVE** (no test)

### 2. Crear Productos 

#### **Plan Básico**
1. Ve a **Products** → **Add product**
2. Llena los datos:
   - **Name**: Plan Básico BSB Capital
   - **Description**: Acceso básico a la formación de trading e inversión de BSB Capital
   - **Statement descriptor**: BSB CAPITAL BASIC
   - **Product type**: Recurring
   - **Pricing model**: Standard pricing
   - **Price**: $99.99 USD
   - **Billing period**: Monthly
   - **Trial period**: 0 days
3. **Guardar** y copiar el `price_id` (empieza con `price_`)

#### **Plan Premium**
1. **Add product**
2. Datos:
   - **Name**: Plan Premium BSB Capital  
   - **Description**: Acceso premium con contenido avanzado y soporte prioritario
   - **Statement descriptor**: BSB CAPITAL PREMIUM
   - **Price**: $299.99 USD
   - **Billing period**: Monthly
3. **Guardar** y copiar el `price_id`

#### **Plan VIP**
1. **Add product**
2. Datos:
   - **Name**: Plan VIP BSB Capital
   - **Description**: Acceso VIP con todo el contenido, sesiones 1:1 y acceso de por vida
   - **Statement descriptor**: BSB CAPITAL VIP
   - **Price**: $999.99 USD  
   - **Billing period**: Monthly
3. **Guardar** y copiar el `price_id`

### 3. Configurar Webhooks
1. Ve a **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL**: `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/stripe-webhook`
4. **Events to send**: Seleccionar
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Add endpoint**
6. Copiar el **Signing secret** (empieza con `whsec_`)

### 4. Actualizar Variables de Entorno
Una vez tengas los `price_id`s, actualizar el archivo de población de base de datos.

## ⚠️ Importante
- Guarda los `price_id`s en un lugar seguro
- El webhook secret ya está configurado en las variables de entorno
- Verifica que estés en modo LIVE para producción