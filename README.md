# Bonix MVP - Internal Alpha

A promotional platform that connects merchants with customers through cashback-driven deals.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

Follow the instructions in [`supabase/README.md`](./supabase/README.md) to:
- Create a Supabase project
- Run database migrations
- Configure environment variables

### 3. Configure Environment

```bash
cp .env.example .env
```

Then fill in your Supabase credentials in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
bonix/
├── app/                    # Next.js App Router pages
├── lib/                    # Core utilities
│   ├── supabase/          # Supabase client configurations
│   ├── config.ts          # App configuration & feature flags
│   ├── types.ts           # Core enums and types
│   └── database.types.ts  # Database type definitions
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── README.md          # Database setup guide
└── middleware.ts          # Auth middleware
```

## Core Features (MVP Phase 1)

### For Users
- Browse active promotions
- Reserve promos (15-day TTL)
- Generate QR code for redemption
- Wallet system with cashback
- Redemption history

### For Merchants
- Create and manage promos
- Scan QR codes to redeem
- View active reservations
- Monthly balance overview

### For Admins
- Disable merchants/promos
- View all redemptions
- Adjust merchant balances
- Audit logs

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `QR_TOKEN_SECRET` | Secret for QR code signing | Yes |
| `QR_TOKEN_TTL_MINUTES` | QR code expiration time | No (default: 10) |
| `PLATFORM_FEE` | Platform fee percentage | No (default: 3) |
| `AFFILIATE_FEE` | Affiliate fee percentage | No (default: 5) |
| `ENABLE_WALLET` | Enable wallet feature | No (default: true) |
| `ENABLE_AFFILIATES` | Enable affiliate system | No (default: false) |
| `ENABLE_PAYMENT_GATEWAY` | Enable payment gateway | No (default: false) |

## Development Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Database Management

All database operations are handled through Supabase:

- **Migrations**: Located in `supabase/migrations/`
- **RLS Policies**: Enforced at database level
- **Functions**: Business logic in PostgreSQL functions
- **Real-time**: Enabled via Supabase subscriptions (optional)

See [`supabase/README.md`](./supabase/README.md) for detailed database documentation.

## Security Features

- **Row Level Security (RLS)**: All tables protected
- **QR Token Signing**: Prevents tampering
- **Idempotent APIs**: Prevents double redemptions
- **Audit Logging**: All critical actions logged
- **Role-based Access**: USER | MERCHANT | ADMIN

## Phase 1 Exit Criteria

- ✅ Real merchant can redeem a real promo
- ✅ Cashback calculation is accurate
- ✅ No data corruption on failure
- ✅ Numbers can be trusted without manual verification

## License

Proprietary - Internal Use Only
"# Bonix" 
