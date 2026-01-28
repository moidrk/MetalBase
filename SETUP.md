# MetalBase Setup Guide

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

## Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Copy `.env.local` and configure the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://erzftsnuopyunktrgdfl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_vgtNb6Q568RqaiR4L1KGPg_JCe5q7eb
SUPABASE_SERVICE_ROLE_KEY=sb_secret_zjAt5pEUgLUwUnhek3Fnwg_C2X9PHSA
```

## Running Locally

Start the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

Build the application:

```bash
pnpm run build
```

Start the production server:

```bash
pnpm run start
```

## Authentication Flow

1. **Login**: Navigate to `/auth/login` to sign in with your email and password
2. **Signup**: Navigate to `/auth/signup` to create a new account
3. **Protected Routes**: All routes under `(dashboard)` are protected and require authentication
4. **Middleware**: The middleware checks for valid sessions and redirects accordingly

### Auth State Management

- Sessions are stored securely using httpOnly cookies via Supabase SSR
- The `useAuth` hook provides access to the current user and session
- The `AuthGuard` component protects client-side routes
- Middleware protects server-side routes

## Supabase Dashboard

Access your Supabase project at:
https://erzftsnuopyunktrgdfl.supabase.co

## Database Schema

The following tables are created with Row Level Security (RLS):

- **profiles**: User profile information
- **holdings**: Precious metal holdings
- **ai_recommendations**: AI-generated recommendations
- **notifications**: User notifications

### RLS Policies

All tables have RLS enabled with policies that:
- Allow users to read/write only their own data
- Prevent access to other users' data

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React + HugeIcons
- **Theme**: Green Lyra theme

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/       # Protected route group
│   ├── auth/              # Authentication pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (redirects to dashboard)
│   └── providers.tsx      # Context providers
├── components/
│   ├── auth/              # Auth components (LoginForm, SignupForm, etc.)
│   └── ui/                # ShadCN UI components
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   └── use-form-schema.ts # Form schema hook
├── lib/
│   └── supabase/          # Supabase client utilities
└── types/
    └── auth.ts            # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret, server-only) |

## Next Steps

Phase 2 will implement:
- Portfolio management features
- Holdings CRUD operations
- AI recommendations integration
- Real-time notifications
