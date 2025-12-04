# Components Documentation

The application's components are located in `src/components` and are organized by their function and domain.

## UI Components (`src/components/ui/`)

The base UI components are built on top of **shadcn/ui** and **Radix UI**, customized with Tailwind CSS. They are further organized into categories:

### 1. General

- **`button.jsx`**: The primary button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes.
- **`dialog.jsx`**: Modal dialogs for overlays and alerts.

### 2. Data Display (`src/components/ui/data-display/`)

Components used to present information to the user.

- _Examples_: Cards, Badges, Avatars, Tables, Accordions.

### 3. Feedback (`src/components/ui/feedback/`)

Components that provide feedback on user actions.

- _Examples_: Toasts, Alerts, Progress Bars, Spinners/Loaders.

### 4. Forms (`src/components/ui/forms/`)

Input controls and form structure components.

- _Examples_: Input, Select, Checkbox, Switch, Label, Form wrappers.

### 5. Navigation (`src/components/ui/navigation/`)

Components for moving around the application.

- _Examples_: Tabs, Dropdown Menus, Navigation Menus.

## Layout Components (`src/components/layout/`)

These components define the overall structure of the application pages.

- **`Layout.jsx`**: The main wrapper for the application. It typically includes the `Header` and `Footer` and handles the main content area's responsiveness. It may also manage global layout states like sidebar visibility.
- **`LanguageSwitcher.jsx`**: A component allowing users to toggle between supported languages (English/Spanish).
- **`ScrollToTop.jsx`**: A utility component that automatically scrolls the window to the top when the route changes.
- **`HeroImage.jsx`**: A specialized component for rendering hero section images, possibly with optimization or animation.

## Domain-Specific Components

### Academy (`src/components/academy/`)

Components used exclusively within the educational platform.

- **Video Players**: Custom wrappers for Hotmart or native video playback.
- **Course Cards**: Display summaries of available courses.
- **Progress Trackers**: Visual indicators of course completion.

### Consultations (`src/components/consultations/`)

Components for the consultancy booking flow.

- **Booking Forms**: Multi-step forms for scheduling.
- **Pricing Widgets**: Dynamic price calculators based on selected options.
- **Calendar Integration**: Date and time pickers.

### Hotmart (`src/components/hotmart/`)

Specific integrations for Hotmart services.

- **`HotmartVideoPlayer`**: Embeds the Hotmart player with proper authentication and configuration.
- **Content Lists**: Fetches and displays content from the Hotmart API.

### Auth (`src/components/auth/`)

- **Login Form**: Handles user sign-in.
- **Register Form**: Handles new user registration.
- **Protected Route Wrappers**: Components that redirect unauthenticated users.
