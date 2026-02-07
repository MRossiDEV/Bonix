// TypeScript types for Supabase database tables
// Generated based on schema in supabase/migrations/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'USER' | 'MERCHANT' | 'ADMIN'
export type PromoStatus = 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'EXPIRED'
export type ReservationStatus = 'ACTIVE' | 'EXPIRED' | 'REDEEMED' | 'CANCELLED'
export type RedemptionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED'
export type PaymentType = 'FULL_WALLET' | 'PARTIAL_WALLET' | 'IN_STORE'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: UserRole
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role?: UserRole
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: UserRole
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      merchants: {
        Row: {
          id: string
          email: string
          business_name: string
          contact_name: string
          phone: string
          address: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          business_name: string
          contact_name: string
          phone: string
          address?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          business_name?: string
          contact_name?: string
          phone?: string
          address?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      promos: {
        Row: {
          id: string
          merchant_id: string
          title: string
          description: string
          original_price: number
          discounted_price: number
          cashback_percent: number
          total_slots: number
          available_slots: number
          status: PromoStatus
          activated_at: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          title: string
          description: string
          original_price: number
          discounted_price: number
          cashback_percent: number
          total_slots: number
          available_slots: number
          status?: PromoStatus
          activated_at?: string | null
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          title?: string
          description?: string
          original_price?: number
          discounted_price?: number
          cashback_percent?: number
          total_slots?: number
          available_slots?: number
          status?: PromoStatus
          activated_at?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          promo_id: string
          status: ReservationStatus
          expires_at: string
          redeemed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          promo_id: string
          status?: ReservationStatus
          expires_at: string
          redeemed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          promo_id?: string
          status?: ReservationStatus
          expires_at?: string
          redeemed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          reservation_id: string
          user_id: string
          promo_id: string
          merchant_id: string
          payment_type: PaymentType
          promo_amount: number
          wallet_used: number
          cash_paid: number
          cashback_amount: number
          cashback_percent: number
          status: RedemptionStatus
          qr_token: string | null
          qr_generated_at: string | null
          qr_expires_at: string | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          user_id: string
          promo_id: string
          merchant_id: string
          payment_type: PaymentType
          promo_amount: number
          wallet_used?: number
          cash_paid: number
          cashback_amount: number
          cashback_percent: number
          status?: RedemptionStatus
          qr_token?: string | null
          qr_generated_at?: string | null
          qr_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_id?: string
          user_id?: string
          promo_id?: string
          merchant_id?: string
          payment_type?: PaymentType
          promo_amount?: number
          wallet_used?: number
          cash_paid?: number
          cashback_amount?: number
          cashback_percent?: number
          status?: RedemptionStatus
          qr_token?: string | null
          qr_generated_at?: string | null
          qr_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      merchant_balances: {
        Row: {
          id: string
          merchant_id: string
          period_start: string
          period_end: string
          total_redemptions: number
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          wallet_credits: number
          net_balance: number
          is_locked: boolean
          status: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          period_start: string
          period_end: string
          total_redemptions?: number
          gross_amount?: number
          platform_fee?: number
          affiliate_fee?: number
          wallet_credits?: number
          net_balance?: number
          is_locked?: boolean
          status?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          period_start?: string
          period_end?: string
          total_redemptions?: number
          gross_amount?: number
          platform_fee?: number
          affiliate_fee?: number
          wallet_credits?: number
          net_balance?: number
          is_locked?: boolean
          status?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      merchant_balance_adjustments: {
        Row: {
          id: string
          merchant_id: string
          period_start: string
          period_end: string
          amount: number
          reason: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          period_start: string
          period_end: string
          amount: number
          reason: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          period_start?: string
          period_end?: string
          amount?: number
          reason?: string
          created_by?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          entity_type: string
          entity_id: string
          user_id: string | null
          metadata: Json | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          entity_type: string
          entity_id: string
          user_id?: string | null
          metadata?: Json | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          user_id?: string | null
          metadata?: Json | null
          status?: string
          created_at?: string
        }
      }
    }
    Functions: {
      reserve_promo: {
        Args: {
          p_user_id: string
          p_promo_id: string
          p_reservation_ttl_days?: number
        }
        Returns: string
      }
      expire_old_reservations: {
        Args: Record<string, never>
        Returns: number
      }
      calculate_cashback: {
        Args: {
          p_promo_amount: number
          p_wallet_used: number
          p_cashback_percent: number
        }
        Returns: number
      }
      create_redemption: {
        Args: {
          p_reservation_id: string
          p_merchant_id: string
          p_payment_type: PaymentType
          p_wallet_used?: number
        }
        Returns: string
      }
      confirm_redemption: {
        Args: {
          p_redemption_id: string
        }
        Returns: boolean
      }
      calculate_merchant_balance: {
        Args: {
          p_merchant_id: string
          p_period_start: string
          p_period_end: string
          p_platform_fee_rate?: number
          p_affiliate_fee_rate?: number
        }
        Returns: {
          total_redemptions: number
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          wallet_credits: number
          net_balance: number
        }[]
      }
      upsert_merchant_balance: {
        Args: {
          p_merchant_id: string
          p_period_start: string
          p_period_end: string
          p_platform_fee_rate?: number
          p_affiliate_fee_rate?: number
          p_lock?: boolean
          p_allow_locked_override?: boolean
        }
        Returns: {
          id: string
          merchant_id: string
          period_start: string
          period_end: string
          total_redemptions: number
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          wallet_credits: number
          net_balance: number
          is_locked: boolean
          status: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
      }
      lock_merchant_balance: {
        Args: {
          p_merchant_id: string
          p_period_start: string
        }
        Returns: {
          id: string
          merchant_id: string
          period_start: string
          period_end: string
          total_redemptions: number
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          wallet_credits: number
          net_balance: number
          is_locked: boolean
          status: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
      }
      apply_balance_adjustment: {
        Args: {
          p_merchant_id: string
          p_period_start: string
          p_period_end: string
          p_amount: number
          p_reason: string
          p_admin_id: string
        }
        Returns: {
          id: string
          merchant_id: string
          period_start: string
          period_end: string
          total_redemptions: number
          gross_amount: number
          platform_fee: number
          affiliate_fee: number
          wallet_credits: number
          net_balance: number
          is_locked: boolean
          status: string
          paid_at: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
