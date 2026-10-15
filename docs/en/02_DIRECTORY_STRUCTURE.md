# Directory Structure

This document outlines the file and folder structure of the BSB Capital project.

## Root Directory

| Directory/File       | Description                                             |
| :------------------- | :------------------------------------------------------ |
| `.github/`           | GitHub Actions workflows and configuration.             |
| `.vscode/`           | VS Code workspace settings.                             |
| `docs/`              | Project documentation (Spanish and English).            |
| `public/`            | Static assets (images, icons, `.htaccess`).             |
| `src/`               | Main source code for the React application.             |
| `supabase/`          | Supabase configuration, migrations, and Edge Functions. |
| `index.html`         | Entry point for the Vite application.                   |
| `package.json`       | Project dependencies and scripts.                       |
| `tailwind.config.js` | Tailwind CSS configuration.                             |
| `vite.config.js`     | Vite build configuration.                               |

## Source Code (`src/`)

The `src` directory contains the core logic of the frontend application.

### `src/components/`

Reusable UI components organized by domain.

- **`ui/`**: Base UI elements (buttons, inputs, cards) based on shadcn/ui.
- **`layout/`**: Structural components like `Header`, `Footer`, `Sidebar`.
- **`auth/`**: Components related to login, register, and password recovery.
- **`common/`**: General-purpose components used across multiple pages.
- **`academy/`**: Components specific to the educational platform (video players, course lists).
- **`consultations/`**: Forms and widgets for the consultancy service.

### `src/contexts/`

React Context providers for global state management.

- **`AuthContext`**: Manages user authentication state.
- **`LanguageContext`**: Handles internationalization state.
- **`ThemeContext`**: Manages UI theming (if applicable).

### `src/hooks/`

Custom React hooks for encapsulating logic.

- **`useUserAccess`**: Checks user permissions and subscription status.
- **`useToast`**: Manages toast notifications.
- **`useScroll`**: Handles scroll-based interactions.

### `src/lib/`

Libraries, service integrations, and configuration files.

- **`supabaseClient.js`**: Supabase client initialization.
- **`stripe.js`**: Stripe configuration.
- **`emailService.js`**: Functions for sending emails via Resend.
- **`consultationPDFService.js`**: Logic for generating PDF reports.

### `src/pages/`

React components representing full pages / routes.

- **`auth/`**: Login, Signup, ForgotPassword pages.
- **`company/`**: Static pages like About Us (`Empresa`), Contact, Legal.
- **`services/`**: Landing pages for specific services (AlgoFund, Consultoría).
- **`dashboard/`**: User dashboard pages.
- **`admin/`**: Administrative panel pages.
- **`Home.jsx`**: The main landing page.

### `src/utils/`

Helper functions and constants.

- **`cn.js`**: Class name merger utility (clsx + tailwind-merge).
- **`formatters.js`**: Currency and date formatting utilities.

### `src/locales/`

Translation files for i18n.

- **`es/`**: Spanish translations.
- **`en/`**: English translations.

## Supabase (`supabase/`)

- **`functions/`**: Deno-based Edge Functions for backend logic (e.g., Stripe webhooks and email).
- **`migrations/`**: SQL files for database schema changes.
