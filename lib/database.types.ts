// TypeScript types for Supabase database tables
// Generated based on schema in supabase/migrations/

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'USER' | 'MERCHANT' | 'AGENT' | 'ADMIN'
export type PromoStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SOLD_OUT'
  | 'DISABLED'
  | 'EXPIRED'
export type PromoActivityState = 'ACTIVE' | 'UNACTIVE'
export type ReservationStatus = 'ACTIVE' | 'EXPIRED' | 'REDEEMED' | 'CANCELLED'
export type AssetType = 'BUILDING' | 'VEGETATION' | 'PROP' | 'ENVIRONMENT' | 'CHARACTER'
export type AssetStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED'
export type WorldType = 'CITY' | 'DISTRICT' | 'MERCHANT'
export type WorldTheme =
  | 'MODERN'
  | 'INDUSTRIAL'
  | 'JAPANESE'
  | 'RUSTIC'
  | 'URBAN'
  | 'LUXURY'
  | 'NEUTRAL'
export type SlotType = 'BUILDING' | 'DECORATION' | 'EMPTY'
export type BuildingState =
  | 'NORMAL'
  | 'NEW'
  | 'RESERVED'
  | 'VISITED'
  | 'ACTIVE_PROMO'
  | 'LIMITED_PROMO'
export type CityProgressEventKind =
  | 'FAVORITE_ADDED'
  | 'SLOT_UNLOCKED'
  | 'PROMO_PLACED'
  | 'PROMO_REDEEMED'
  | 'BUILDING_PLACED'
  | 'BUILDING_VISITED'
  | 'LEVEL_UP'
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
          password_hash: string | null
          auth_provider: string | null
          avatar_url: string | null
          last_login_at: string | null
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
          password_hash?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
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
          password_hash?: string | null
          auth_provider?: string | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: {
          user_id: string
          role: UserRole
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: UserRole
          created_at?: string
        }
      }
      user_favorite_merchants: {
        Row: {
          user_id: string
          merchant_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          merchant_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          merchant_id?: string
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          asset_type: AssetType
          category: string
          file_url: string
          thumbnail_url: string | null
          preview_url: string | null
          metadata: Json
          version: number
          status: AssetStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          asset_type: AssetType
          category: string
          file_url: string
          thumbnail_url?: string | null
          preview_url?: string | null
          metadata?: Json
          version?: number
          status?: AssetStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          asset_type?: AssetType
          category?: string
          file_url?: string
          thumbnail_url?: string | null
          preview_url?: string | null
          metadata?: Json
          version?: number
          status?: AssetStatus
          created_at?: string
          updated_at?: string
        }
      }
      asset_versions: {
        Row: {
          id: string
          asset_id: string
          version: number
          file_url: string
          thumbnail_url: string | null
          metadata: Json
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          version: number
          file_url: string
          thumbnail_url?: string | null
          metadata?: Json
          is_current?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          version?: number
          file_url?: string
          thumbnail_url?: string | null
          metadata?: Json
          is_current?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'asset_versions_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          }
        ]
      }
      building_templates: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          base_asset_id: string
          description: string | null
          configuration: Json
          thumbnail_url: string | null
          status: AssetStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          base_asset_id: string
          description?: string | null
          configuration?: Json
          thumbnail_url?: string | null
          status?: AssetStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          base_asset_id?: string
          description?: string | null
          configuration?: Json
          thumbnail_url?: string | null
          status?: AssetStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'building_templates_base_asset_id_fkey'
            columns: ['base_asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          }
        ]
      }
      building_template_components: {
        Row: {
          id: string
          template_id: string
          asset_id: string
          component_type: string
          position: Json
          rotation: Json
          scale: Json
          configuration: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          asset_id: string
          component_type: string
          position?: Json
          rotation?: Json
          scale?: Json
          configuration?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          asset_id?: string
          component_type?: string
          position?: Json
          rotation?: Json
          scale?: Json
          configuration?: Json
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'building_template_components_asset_id_fkey'
            columns: ['asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'building_template_components_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'building_templates'
            referencedColumns: ['id']
          }
        ]
      }
      worlds: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          world_type: WorldType
          level: number
          theme: WorldTheme
          max_slots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          world_type?: WorldType
          level?: number
          theme?: WorldTheme
          max_slots?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          world_type?: WorldType
          level?: number
          theme?: WorldTheme
          max_slots?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'worlds_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      world_slots: {
        Row: {
          id: string
          world_id: string
          slot_key: string
          x: number
          y: number
          z: number
          rotation_x: number
          rotation_y: number
          rotation_z: number
          scale: number
          slot_type: SlotType
          occupied: boolean
          unlock_level: number
          created_at: string
        }
        Insert: {
          id?: string
          world_id: string
          slot_key: string
          x?: number
          y?: number
          z?: number
          rotation_x?: number
          rotation_y?: number
          rotation_z?: number
          scale?: number
          slot_type?: SlotType
          occupied?: boolean
          unlock_level?: number
          created_at?: string
        }
        Update: {
          id?: string
          world_id?: string
          slot_key?: string
          x?: number
          y?: number
          z?: number
          rotation_x?: number
          rotation_y?: number
          rotation_z?: number
          scale?: number
          slot_type?: SlotType
          occupied?: boolean
          unlock_level?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'world_slots_world_id_fkey'
            columns: ['world_id']
            isOneToOne: false
            referencedRelation: 'worlds'
            referencedColumns: ['id']
          }
        ]
      }
      world_buildings: {
        Row: {
          id: string
          world_id: string
          slot_id: string
          merchant_id: string | null
          building_template_id: string | null
          customization_id: string | null
          state: BuildingState
          placed_at: string
          last_visited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          world_id: string
          slot_id: string
          merchant_id?: string | null
          building_template_id?: string | null
          customization_id?: string | null
          state?: BuildingState
          placed_at?: string
          last_visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          world_id?: string
          slot_id?: string
          merchant_id?: string | null
          building_template_id?: string | null
          customization_id?: string | null
          state?: BuildingState
          placed_at?: string
          last_visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'world_buildings_world_id_fkey'
            columns: ['world_id']
            isOneToOne: false
            referencedRelation: 'worlds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'world_buildings_slot_id_fkey'
            columns: ['slot_id']
            isOneToOne: true
            referencedRelation: 'world_slots'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'world_buildings_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: false
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'world_buildings_building_template_id_fkey'
            columns: ['building_template_id']
            isOneToOne: false
            referencedRelation: 'building_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'world_buildings_customization_id_fkey'
            columns: ['customization_id']
            isOneToOne: false
            referencedRelation: 'merchant_3d_customizations'
            referencedColumns: ['id']
          }
        ]
      }
      merchant_3d_customizations: {
        Row: {
          id: string
          merchant_id: string
          building_template_id: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          sign_text: string | null
          sign_asset_id: string | null
          interior_theme: WorldTheme | null
          configuration: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          building_template_id?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sign_text?: string | null
          sign_asset_id?: string | null
          interior_theme?: WorldTheme | null
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          building_template_id?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sign_text?: string | null
          sign_asset_id?: string | null
          interior_theme?: WorldTheme | null
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'merchant_3d_customizations_merchant_id_fkey'
            columns: ['merchant_id']
            isOneToOne: true
            referencedRelation: 'merchants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'merchant_3d_customizations_building_template_id_fkey'
            columns: ['building_template_id']
            isOneToOne: false
            referencedRelation: 'building_templates'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'merchant_3d_customizations_sign_asset_id_fkey'
            columns: ['sign_asset_id']
            isOneToOne: false
            referencedRelation: 'assets'
            referencedColumns: ['id']
          }
        ]
      }
      merchants: {
        Row: {
          id: string
          user_id: string
          email: string
          logo_url: string | null
          business_name: string
          business_category: string | null
          locations: string[] | null
          contact_name: string
          phone: string
          address: string | null
          short_description: string | null
          terms_accepted_at: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          logo_url?: string | null
          business_name: string
          business_category?: string | null
          locations?: string[] | null
          contact_name: string
          phone: string
          address?: string | null
          short_description?: string | null
          terms_accepted_at?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          logo_url?: string | null
          business_name?: string
          business_category?: string | null
          locations?: string[] | null
          contact_name?: string
          phone?: string
          address?: string | null
          short_description?: string | null
          terms_accepted_at?: string | null
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
          image: string | null
          original_price: number
          discounted_price: number
          cashback_percent: number
          total_slots: number
          available_slots: number
          category: string | null
          is_featured: boolean
          starts_at: string | null
          status: PromoStatus
          activity_state: PromoActivityState
          activated_at: string | null
          expires_at: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          title: string
          description: string
          image?: string | null
          original_price: number
          discounted_price: number
          cashback_percent: number
          total_slots: number
          available_slots: number
          category?: string | null
          is_featured?: boolean
          starts_at?: string | null
          status?: PromoStatus
          activity_state?: PromoActivityState
          activated_at?: string | null
          expires_at: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          title?: string
          description?: string
          image?: string | null
          original_price?: number
          discounted_price?: number
          cashback_percent?: number
          total_slots?: number
          available_slots?: number
          category?: string | null
          is_featured?: boolean
          starts_at?: string | null
          status?: PromoStatus
          activity_state?: PromoActivityState
          activated_at?: string | null
          expires_at?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: boolean
          default_cashback_percent: number
          max_promos_per_merchant: number
          default_promo_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          default_cashback_percent?: number
          max_promos_per_merchant?: number
          default_promo_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          default_cashback_percent?: number
          max_promos_per_merchant?: number
          default_promo_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      promo_change_requests: {
        Row: {
          id: string
          promo_id: string
          merchant_id: string
          requested_by: string
          action: string
          status: string
          note: string | null
          requested_changes: Json | null
          reviewed_by: string | null
          reviewed_at: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          promo_id: string
          merchant_id: string
          requested_by: string
          action: string
          status?: string
          note?: string | null
          requested_changes?: Json | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          promo_id?: string
          merchant_id?: string
          requested_by?: string
          action?: string
          status?: string
          note?: string | null
          requested_changes?: Json | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_note?: string | null
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
      city_progress_events: {
        Row: {
          id: string
          user_id: string
          world_id: string | null
          kind: CityProgressEventKind
          slot_id: string | null
          merchant_id: string | null
          promo_id: string | null
          points: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          world_id?: string | null
          kind: CityProgressEventKind
          slot_id?: string | null
          merchant_id?: string | null
          promo_id?: string | null
          points?: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          world_id?: string | null
          kind?: CityProgressEventKind
          slot_id?: string | null
          merchant_id?: string | null
          promo_id?: string | null
          points?: number
          metadata?: Json
          created_at?: string
        }
        Relationships: []
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
