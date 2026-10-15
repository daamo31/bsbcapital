# Core Services Documentation

The `src/lib` directory contains the core business logic and external service integrations. This separation of concerns keeps React components clean and focused on UI.

## 1. Email Service (`src/lib/emailService.js`)

Manages transactional emails using the **Resend** API.

### Key Functions:

- **`sendWelcomeEmail(user)`**: Sends a welcome message upon registration.
- **`sendPurchaseConfirmation(details)`**: Sends a receipt and confirmation after a successful payment.
- **`sendConsultationSummary(consultationData)`**: Sends the PDF summary of a booked consultancy.
- **`sendPasswordReset(email, token)`**: Handles password recovery emails.

### Configuration:

- Uses `RESEND_API_KEY` from environment variables.
- Templates are often defined within the service or imported from a templates directory.

## 2. Consultation PDF Service (`src/lib/consultationPDFService.js`)

A utility for generating dynamic PDF reports using **jsPDF**.

### Key Functions:

- **`generateConsultationSummaryPDF(data)`**: Creates a PDF document containing:
  - Client details.
  - Selected consultancy type and date.
  - Financial summary (if provided in the form).
  - Objectives and notes.
- **`sendConsultationSummaryEmail(data, email)`**: Orchestrates the generation of the PDF and passes it to the `emailService` (or Supabase Edge Function) to be sent as an attachment.

## 3. Supabase Client (`src/lib/customSupabaseClient.js`)

A wrapper around the standard Supabase client to ensure consistent configuration.

- Initializes the client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- May include custom headers or middleware for specific requests.
- Exports the `supabase` instance used throughout the app.

## 4. Content Service (`src/lib/contentService.js`)

A service for managing protected content and progress stored in Supabase.

- **`getArticles()`**: Fetches blog posts or articles (e.g., from Supabase).
- **`getServices()`**: Retrieves the list of available services and their current pricing.

## 5. Membership Utils (`src/lib/membershipUtils.js`)

Helper functions for managing user subscriptions.

- **`checkSubscriptionStatus(user)`**: Determines if a user's subscription is active, pending, or expired.
- **`getPlanFeatures(planId)`**: Returns the list of features associated with a specific plan.
