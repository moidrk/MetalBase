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

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe to expose) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret, server-only) | Yes |
| `GOLDAPI_KEY` | GoldAPI key for real-time metal prices | No* |
| `FREECURRENCYAPI_KEY` | FreeCurrencyAPI key for USD/PKR exchange rates | No* |

*Optional: If not provided, the app will use fallback/mock prices

## Phase 4: Market Data Integration

### GoldAPI Setup

1. Sign up for a free account at [https://www.goldapi.io/](https://www.goldapi.io/)
2. Get your API key from the dashboard
3. Add to your `.env.local` file:
   ```env
   GOLDAPI_KEY=your-goldapi-key-here
   ```

The app will fetch:
- Gold prices (XAU) in USD per troy ounce
- Silver prices (XAG) in USD per troy ounce
- Automatically converts to price per gram
- Caches prices for 1 hour to minimize API calls

### FreeCurrencyAPI Setup

1. Sign up for a free account at [https://freecurrencyapi.com/](https://freecurrencyapi.com/)
2. Get your API key from the dashboard
3. Add to your `.env.local` file:
   ```env
   FREECURRENCYAPI_KEY=your-freecurrencyapi-key-here
   ```

The app will fetch:
- Live USD/PKR exchange rates
- Caches rates for 1 hour
- Fallback: 1 USD = 278 PKR if API fails

### Testing API Integration Locally

To test with real prices:
```bash
# Set your API keys in .env.local
echo "GOLDAPI_KEY=goldapi-h1ssmkyb36gd-io" >> .env.local
echo "FREECURRENCYAPI_KEY=your-key-here" >> .env.local

# Start the dev server
pnpm run dev

# Visit http://localhost:3000 and check the dashboard
# You should see "Live from GoldAPI" badge with fresh prices
```

### Fallback Behavior

If APIs are unavailable or not configured:
1. **No API keys**: Uses mock prices (estimated)
2. **API rate limit**: Uses cached prices from last successful fetch
3. **API error**: Falls back to cached, then to mock prices
4. **Network error**: Falls back to cached, then to mock prices

The dashboard will always remain functional even if APIs fail.

### Configuring on Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `GOLDAPI_KEY`: Your GoldAPI key
   - `FREECURRENCYAPI_KEY`: Your FreeCurrencyAPI key
4. Redeploy your application

### API Endpoints

#### GET /api/prices

Returns current metal prices and exchange rates.

**Response:**
```json
{
  "gold": {
    "USD": 65.50,
    "PKR": 18210.00
  },
  "silver": {
    "USD": 0.85,
    "PKR": 236.30
  },
  "rates": {
    "USD": 1,
    "PKR": 278,
    "timestamp": "2024-01-28T12:00:00.000Z"
  },
  "updatedAt": "2024-01-28T12:00:00.000Z",
  "source": "live",
  "isFresh": true,
  "ageMinutes": 0
}
```

**Rate Limiting:**
- Max 1 request per 10 seconds per IP address
- Returns 429 status if exceeded

## Next Steps

Phase 5 will implement:
- Historical price charts and visualizations
- Performance tracking over time
- AI recommendations based on market trends
