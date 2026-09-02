export type PromoRow = {
  id: string;
  merchant_id: string;
  slug: string | null;

  title: string;
  description: string;

  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;

  image?: string | null;
  gallery?: string[] | null;

  expires_at: string;

  total_slots: number | string;
  available_slots: number | string;

  status: string;
  activity_state?: string;

  is_featured: boolean;

  category: string | null;

  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  saves_count?: number;
  shares_count?: number;
  redemption_count?: number;

  neighborhood?: string | null;
  address?: string | null;

  rating?: number | string | null;
  reviews_count?: number;

  tags?: string[] | null;

  created_at?: string;

  merchant:
    | {
        business_name: string;
        logo_url?: string | null;
        neighborhood?: string | null;
      }
    | {
        business_name: string;
        logo_url?: string | null;
        neighborhood?: string | null;
      }[]
    | null;
};


export type PromoCardData = {
  id: string;
  slug: string;
  merchantName: string;
  merchantLogoUrl?: string | null;
  title: string;
  description: string;
  discountPercent: number;
  imageUrl?: string;
  neighborhood: string;
  distanceLabel: string;
  priceLabel: string;
  originalPrice: number;
  discountedPrice: number;
  cashbackPercent: number;
  totalSlots: number;
  availableSlots: number;
  status: string;
  isFeatured: boolean;
  category: string | null;
  likesCount?: number;
  commentsCount?: number;
  savesCount?: number;
  sharesCount?: number;
  rating?: number;
  reviewsCount?: number;
  gallery?: string[];
  tags?: string[];
  address?: string | null;
  viewsCount?: number;
  redemptionCount?: number;
  max_per_user?: number;
};