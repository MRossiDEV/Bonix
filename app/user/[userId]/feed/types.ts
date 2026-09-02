import { PromoCardData } from "@/lib/promos";

export type PromoRow = {
  id: string;
  merchant_id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  image: string | null;
  expires_at: string;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  category: string | null;
  sold_out_duration_seconds: number | null;
  activated_at: string | null;
  created_at: string;
  merchant: { business_name: string; logo_url: string | null } | null;
  is_favorited?: boolean;
};

export type FeedPromo = PromoCardData & {
  merchantId: string;
  isFavorited: boolean;
  expiresAt: string;
  activatedAt: string;
  soldOutDurationSeconds: number | null;
  createdAt: string;
  remaining: number;
  total: number;
  hot: boolean;
};

export type LiveActivity = {
  id: string;
  text: string;
};

export type StoryHighlight = {
  id: string;
  promoId: string;
  merchantName: string;
  title: string;
  imageUrl?: string;
  hot: boolean;
  expiringUnder2h: boolean;
  expiresAt: string;
  status: string;
};

export type FeedSection = {
  id: string;
  title: string;
  promos: FeedPromo[];
};

export type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const fallbackGradients = [
  "from-[#FF7A00]/40 via-[#7B61FF]/30 to-[#00E5A8]/30",
  "from-[#00E5A8]/35 via-[#FF7A00]/30 to-[#7B61FF]/30",
  "from-[#7B61FF]/35 via-[#00E5A8]/30 to-[#FF7A00]/30",
];

export const PAGE_SIZE = 12;
export const DAILY_CREDITS_CAP = 5;
export const BONUS_REDEMPTION_TARGET = 3;
export const DAILY_PROGRESS_STORAGE_KEY = "bonix:daily-progress";
export const DEFAULT_FEED_TAB_ID = "ending-soon";
