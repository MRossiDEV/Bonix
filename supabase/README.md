# Bonix MVP - Supabase Setup Guide

## Database Setup

This project uses **Supabase** as the database and authentication provider.

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

### 2. Run Migrations

You can run the migrations in order using the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions.sql`
5. Run each migration

### 3. Configure Environment Variables

1. Get your project credentials from Supabase Dashboard > Settings > API
2. Copy `.env.example` to `.env`
3. Fill in the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Optional: Use Supabase CLI

For local development, you can use the Supabase CLI:

```bash
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Or push local migrations
supabase db push
```

## Authentication Setup

Supabase Auth is integrated with the database schema. Users are created in the `auth.users` table by Supabase, and we maintain extended user profiles in our `users` and `merchants` tables.

### User Roles

- **USER**: Regular customers who can reserve and redeem promos
- **MERCHANT**: Business owners who create promos and process redemptions
- **ADMIN**: Platform administrators with full access

## Database Schema

The database consists of 8 main tables:

1. **users** - User profiles and authentication
2. **merchants** - Merchant profiles
3. **promos** - Promotional offers
4. **reservations** - User promo reservations
5. **redemptions** - Completed promo redemptions
6. **wallets** - User wallet balances
7. **merchant_balances** - Monthly merchant settlements
8. **audit_logs** - System audit trail

## Row Level Security (RLS)

All tables have RLS enabled. Users can only access data they own or are authorized to view. Merchants can only manage their own promos, and admins have full access.

## Database Functions

Several PostgreSQL functions are provided for business logic:

- `reserve_promo()` - Atomically reserve a promo slot
- `expire_old_reservations()` - Batch expire old reservations
- `calculate_cashback()` - Calculate cashback amount
- `create_redemption()` - Create redemption with validations
- `confirm_redemption()` - Confirm and credit cashback

These functions ensure data integrity and prevent race conditions.
