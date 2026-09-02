// Centralized environment access with fail-fast validation.
//
// - Server-only secrets are read through getters that throw a clear error
//   when missing or set to a known development placeholder. This means a
//   client bundle that incidentally imports `config` will not crash at
//   load time; the error is raised the first time the secret is actually
//   read (which only happens on the server).
// - Public values are validated the same way but use the NEXT_PUBLIC_*
//   prefix so they can be safely read from both runtimes.

const DEV_PLACEHOLDERS = new Set([
  'default-secret-key',
  'default-qr-secret',
  'change-me',
  'changeme',
])

const FALLBACK_PUBLIC_ENV: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://dwzgziwamsxsmqlrkmjr.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    'sb_publishable_gPLo9_-BMa9H0VeD4UDSHg_er8jsPcL',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
}

function readEnv(key: string): string | undefined {
  const value = process.env[key]
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  return FALLBACK_PUBLIC_ENV[key]
}

function assertSecret(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in .env or your deployment configuration.`,
    )
  }
  if (DEV_PLACEHOLDERS.has(value)) {
    throw new Error(
      `Environment variable ${key} is set to a known development placeholder. Provide a real secret before booting.`,
    )
  }
  if (value.length < 16) {
    throw new Error(
      `Environment variable ${key} is too short (minimum 16 characters) to be considered a real secret.`,
    )
  }
  return value
}

function assertPublic(key: string, value: string | undefined): string {
  if (!value) {
    if (typeof window !== 'undefined') {
      console.warn(
        `Missing required environment variable: ${key}. Restart the Next.js dev server after updating .env values.`,
      )
      return ''
    }

    throw new Error(
      `Missing required environment variable: ${key}. Set it in .env or your deployment configuration.`,
    )
  }
  return value
}

export const serverEnv = {
  get jwtSecret(): string {
    return assertSecret('JWT_SECRET', readEnv('JWT_SECRET'))
  },
  get qrTokenSecret(): string {
    return assertSecret('QR_TOKEN_SECRET', readEnv('QR_TOKEN_SECRET'))
  },
  get supabaseServiceRoleKey(): string {
    return assertSecret(
      'SUPABASE_SERVICE_ROLE_KEY',
      readEnv('SUPABASE_SERVICE_ROLE_KEY'),
    )
  },
}

export const publicEnv = {
  get supabaseUrl(): string {
    return assertPublic(
      'NEXT_PUBLIC_SUPABASE_URL',
      readEnv('NEXT_PUBLIC_SUPABASE_URL'),
    )
  },
  get supabaseAnonKey(): string {
    return assertPublic(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    )
  },
  get appUrl(): string {
    return readEnv('NEXT_PUBLIC_APP_URL') ?? 'http://localhost:3000'
  },
}

function parsePositiveInt(key: string, fallback: number): number {
  const raw = readEnv(key)
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Environment variable ${key} must be a positive integer, got "${raw}".`,
    )
  }
  return parsed
}

export const numericEnv = {
  get qrTokenTTL(): number {
    return parsePositiveInt('QR_TOKEN_TTL_MINUTES', 10)
  },
  get platformFee(): number {
    return parsePositiveInt('PLATFORM_FEE', 3)
  },
  get affiliateFee(): number {
    return parsePositiveInt('AFFILIATE_FEE', 5)
  },
}
