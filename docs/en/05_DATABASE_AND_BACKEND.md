# Database & Backend Documentation

The backend infrastructure is built on **Supabase**, utilizing its PostgreSQL database, Authentication, and Edge Functions.

## Database Schema

The database uses PostgreSQL with Row Level Security (RLS) enabled for data protection.

### Core Tables

#### `subscription_plans`

Defines the available membership tiers.

- **`id`**: UUID (Primary Key)
- **`name`**: Plan name (e.g., "Premium", "Basic")
- **`price`**: Monthly/Annual cost.
- **`stripe_price_id`**: Mapping to Stripe product.
- **`features`**: JSONB array of plan features.

#### `user_subscriptions`

Tracks user subscriptions and their status.

- **`user_id`**: Reference to `auth.users`.
- **`plan_id`**: Reference to `subscription_plans`.
- **`status`**: 'active', 'canceled', 'past_due', etc.
- **`current_period_end`**: Expiration date.

#### `academy_content`

Metadata for educational content (videos, courses).

- **`content_url`**: URL for the configured content asset.
- **`required_plan_level`**: Minimum plan level required to access.

#### `consultations`

Records of booked consultancy sessions.

- **`client_name`**, **`client_email`**: Contact info.
- **`scheduled_at`**: Date and time of the session.
- **`status`**: 'scheduled', 'completed', 'cancelled'.
- **`details`**: JSONB field for form responses (financial goals, etc.).

## Row Level Security (RLS) Policies

Security is enforced at the database level.

- **`user_subscriptions`**: Users can only view their own subscription records.
- **`consultations`**: Users can view their own bookings; Admins can view all.
- **`academy_content`**: Publicly readable if `is_active` is true; sensitive fields may be restricted.

## Edge Functions (`supabase/functions/`)

Serverless functions written in TypeScript (Deno) for backend logic that requires secure credentials or third-party integrations.

### Payment & Subscriptions

- **`create-stripe-checkout`**: Generates a Stripe Checkout session for payments.
- **`stripe-webhook`**: Listens for Stripe events (payment success, subscription updates) to update the database.
- **`stripe-diagnostics`**: Tool for debugging Stripe configuration.

### Integrations

- **`resend-email-secure`**: Sends transactional emails via Resend (hiding the API key from the client).

### Access Control

- **`rate-limit`**: Implements rate limiting for API endpoints to prevent abuse.

### Testing

- **`create-test-user`**: Helper to generate users for testing purposes.
