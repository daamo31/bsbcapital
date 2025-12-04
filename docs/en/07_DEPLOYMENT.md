# Deployment Guide

This guide covers the steps to deploy the BSB Capital application to a production environment.

## Prerequisites

1.  **Production Supabase Project**: A separate Supabase project for production data.
2.  **Domain Name**: A configured domain (e.g., `bsbcapital.io`).
3.  **Hosting Provider**: Vercel, Netlify, or similar for the frontend.
4.  **Stripe Live Keys**: Production API keys from Stripe.
5.  **Hotmart Production Credentials**: Live API credentials.

## Environment Variables

Configure the following variables in your hosting provider's dashboard:

```env
# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key

# Stripe (Live)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Hotmart (Production)
VITE_HOTMART_CLIENT_ID=your-client-id
VITE_HOTMART_CLIENT_SECRET=your-client-secret
VITE_HOTMART_PRODUCT_ID=your-product-id

# Resend
RESEND_API_KEY=re_...

# Application URL
VITE_APP_URL=https://bsbcapital.io
```

## Frontend Deployment (Vercel Example)

1.  **Connect Repository**: Link your GitHub repository to Vercel.
2.  **Configure Build Settings**:
    - **Framework Preset**: Vite
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
3.  **Add Environment Variables**: Input the production variables listed above.
4.  **Deploy**: Trigger the deployment.

## Backend Deployment (Supabase)

1.  **Database Migration**:
    - Run the SQL migration scripts located in `supabase/migrations` against your production database to set up the schema.
    - Ensure RLS policies are enabled.

2.  **Deploy Edge Functions**:
    - Use the Supabase CLI to deploy functions:
      ```bash
      supabase functions deploy --project-ref your-project-id
      ```
    - Set secrets for Edge Functions:
      ```bash
      supabase secrets set --env-file .env.production --project-ref your-project-id
      ```

## Post-Deployment Checks

1.  **Verify Domain**: Ensure the custom domain is propagating correctly.
2.  **Test Auth**: Sign up a new user and verify the confirmation email is received.
3.  **Test Payments**: Make a real payment (or use a 100% off coupon) to verify the Stripe webhook triggers the subscription update.
4.  **Check Content**: Verify that Hotmart content loads correctly for authorized users.
