# Project Overview

## Introduction

BSB Capital is a comprehensive financial services platform specializing in cryptocurrency and investments. The platform integrates a membership system, personalized consultancy, analysis tools (BSB Maker), an educational academy, and an administrative dashboard, all wrapped in a modern interface with interactive animations.

## Tech Stack

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: JavaScript / TypeScript
- **Styling**: Tailwind CSS (with custom configuration and variables)
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Internationalization**: i18next

### Backend & Services

- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Payments**: Stripe
- **Educational Content**: Hotmart API
- **Email**: Resend
- **PDF Generation**: jsPDF

## Core Features

### 1. User Interface & Experience

- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **Animations**: Extensive use of Framer Motion for page transitions, hover effects, and scroll animations.
- **Theming**: Custom color palette (Brand Green + Gold) with support for dark/light modes (via CSS variables).

### 2. Authentication & Security

- **Supabase Auth**: Email/password login, registration, and session management.
- **Role-Based Access Control (RBAC)**: Distinct roles for Users, Premium Members, and Admins.
- **Protected Routes**: Middleware-like protection for sensitive pages.

### 3. Services

- **Consultancy**: Dynamic booking forms with pricing calculation and PDF summary generation.
- **Academy**: Educational platform with video streaming (Hotmart integration) and progress tracking.
- **BSB Maker**: Investment strategy analysis tools.
- **AlgoFund**: Information and integration with Darwinex for algorithmic trading.

### 4. Payments & Subscriptions

- **Stripe Integration**: Handling recurring subscriptions and one-time payments.
- **Membership Tiers**: Different access levels granting specific content and features.

### 5. Administration

- **Dashboard**: Comprehensive admin panel to manage users, subscriptions, and content.
- **Analytics**: Visualization of key platform metrics.
