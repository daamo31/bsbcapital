# Testing System Documentation

The project includes a comprehensive testing suite accessible directly within the application to verify functionality without affecting production data (when configured correctly).

## Testing Routes

The application exposes specific routes for testing purposes, typically prefixed with `/test`.

### 1. Main Test Panel (`/test`)

- **Component**: `TestSystemPage.jsx`
- **Purpose**: Central hub for all testing tools.
- **Features**:
  - Overview of system status.
  - Links to specific test modules.
  - **Premium Mode Simulation**: Automatically simulates a premium subscription state to allow testing of restricted features without a real payment.

### 2. Hotmart Integration Test (`/test/hotmart`)

- **Purpose**: Verify the integration with the Hotmart video player.
- **Modes**:
  - **Demo**: Simulates the player visually.
  - **Mock**: Uses fake data to test the player's response.
  - **Real**: Connects to the live Hotmart API (requires valid credentials) to play actual content.

### 3. User Status Test (`/test/user-status`)

- **Purpose**: Debug user authentication and subscription state.
- **Features**:
  - Displays current user ID, email, and role.
  - Shows active subscription details.
  - Allows toggling "Test Mode" states.

### 4. Email Tester (`/test/email`)

- **Component**: `EmailTester.jsx`
- **Purpose**: Preview and send test emails.
- **Features**:
  - Select from available email templates (Welcome, Purchase Confirmation, etc.).
  - Send a test email to a specified address using the `resend-email-secure` Edge Function.
  - View the raw HTML of the email template.

### 5. Responsive Design Test (`/test/responsive`)

- **Component**: `ResponsiveTest.jsx`
- **Purpose**: Check layout behavior across different breakpoints.
- **Features**:
  - Visualizes the current Tailwind breakpoint (sm, md, lg, xl, 2xl).
  - Renders sample components to check for layout shifts or overflow issues.

## Testing Utilities

### `TestCredentials`

Pre-configured credentials for quick login during development:

```javascript
const testCredentials = {
  email: 'test@bsbcapital.com',
  password: 'Test123456!',
};
```

### Mocking

The testing system often uses mocking for external services (like Stripe or Hotmart) when running in "Mock Mode" to prevent incurring costs or polluting production data.
