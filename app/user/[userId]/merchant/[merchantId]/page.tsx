import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FavoriteMerchantButton } from "@/app/components/FavoriteMerchantButton";
import { MerchantProfileInteractions } from "./MerchantProfileInteractions";
import { mapPromoRowToCard } from "@/lib/promos";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type MerchantRow = {
  id: string;
  business_name: string | null;
  business_category: string | null;
  category: string | null;
  address: string | null;
  status: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  is_verified: boolean | null;
  rating: number | null;
  review_count: number | null;
  short_description: string | null;
};

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  image: string | null;
  status: string;
  is_featured: boolean;
  category: string | null;
  total_slots: number | string;
  available_slots: number | string;
  expires_at: string;
};

type PromoRowRaw = PromoRow;

type SimilarMerchantRow = {
  id: string;
  business_name: string | null;
  business_category: string | null;
  category: string | null;
  neighborhood: string | null;
  logo_url: string | null;
};

const merchantSelectColumns = [
  "id",
  "business_name",
  "business_category",
  "category",
  "address",
  "status",
  "logo_url",
  "cover_image_url",
  "description",
  "phone",
  "website",
  "neighborhood",
  "latitude",
  "longitude",
  "is_verified",
  "rating",
  "review_count",
  "short_description",
] as const;

const promoSelectColumns = [
  "id",
  "title",
  "description",
  "original_price",
  "discounted_price",
  "cashback_percent",
  "image",
  "status",
  "is_featured",
  "category",
  "total_slots",
  "available_slots",
  "expires_at",
] as const;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStatus(status: string | null | undefined): string {
  return String(status ?? "").trim().toUpperCase();
}

function isSuspendedStatus(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status);
  return normalized === "SUSPENDED" || normalized === "DISABLED" || normalized === "BANNED";
}

function getMapLink({ latitude, longitude, address }: { latitude: number | null; longitude: number | null; address: string | null }): string | null {
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude != null && longitude != null) {
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }
  if (address?.trim()) {
    return `https://maps.google.com/?q=${encodeURIComponent(address.trim())}`;
  }
  return null;
}

function formatTimeLeft(expiresAt: string): string {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs)) {
    return "Ends soon";
  }

  const diffMs = expiresAtMs - Date.now();
  if (diffMs <= 0) {
    return "Expired";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  if (totalMinutes < 60) {
    return `${Math.max(totalMinutes, 1)}m left`;
  }

  const totalHours = Math.floor(diffMs / 3600000);
  if (totalHours < 24) {
    return `${totalHours}h left`;
  }

  const totalDays = Math.floor(diffMs / 86400000);
  return `${totalDays}d left`;
}

function isExpiringSoon(expiresAt: string): boolean {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs)) {
    return false;
  }
  const diffMs = expiresAtMs - Date.now();
  return diffMs > 0 && diffMs <= 6 * 3600000;
}

function isHotPromo(availableSlots: number, totalSlots: number): boolean {
  if (totalSlots <= 0) {
    return false;
  }
  return availableSlots <= 3 || availableSlots / totalSlots <= 0.2;
}

function normalizeWebsite(website: string | null): string | null {
  if (!website?.trim()) {
    return null;
  }
  const value = website.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `https://${value}`;
}

function isMissingColumnError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("schema cache");
}

function getMissingColumnFromError(message: string): string | null {
  const pgMatch = message.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (pgMatch?.[1]) {
    const raw = pgMatch[1].replaceAll('"', "");
    const parts = raw.split(".");
    return parts[parts.length - 1] || null;
  }

  const schemaCacheMatch = message.match(
    /could not find the '([^']+)' column of '[^']+' in the schema cache/i,
  );
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  return null;
}

export default async function UserMerchantPromosPage({
  params,
}: Readonly<{ params: Promise<{ userId: string; merchantId: string }> }>) {
  const { merchantId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedUserId = user.id;

  const missingMerchantColumns = new Set<string>();
  let merchant: MerchantRow | null = null;
  let merchantQueryFailed = false;

  for (let attempt = 0; attempt < merchantSelectColumns.length; attempt += 1) {
    const selectColumns = merchantSelectColumns.filter((column) => !missingMerchantColumns.has(column));
    const selectClause = selectColumns.join(", ");

    const result = await admin
      .from("merchants")
      .select(selectClause)
      .eq("id", merchantId)
      .maybeSingle();

    if (!result.error) {
      const row = (result.data ?? null) as Record<string, unknown> | null;
      merchant = row
        ? {
            id: String(row.id ?? ""),
            business_name: (row.business_name as string | null | undefined) ?? null,
            business_category: (row.business_category as string | null | undefined) ?? null,
            category: (row.category as string | null | undefined) ?? null,
            address: (row.address as string | null | undefined) ?? null,
            status: (row.status as string | null | undefined) ?? null,
            logo_url: (row.logo_url as string | null | undefined) ?? null,
            cover_image_url: (row.cover_image_url as string | null | undefined) ?? null,
            description: (row.description as string | null | undefined) ?? null,
            phone: (row.phone as string | null | undefined) ?? null,
            website: (row.website as string | null | undefined) ?? null,
            neighborhood: (row.neighborhood as string | null | undefined) ?? null,
            latitude: toNumber(row.latitude),
            longitude: toNumber(row.longitude),
            is_verified: (row.is_verified as boolean | null | undefined) ?? null,
            rating: toNumber(row.rating),
            review_count: toNumber(row.review_count),
            short_description: (row.short_description as string | null | undefined) ?? null,
          }
        : null;
      merchantQueryFailed = false;
      break;
    }

    if (!isMissingColumnError(result.error.message)) {
      merchantQueryFailed = true;
      break;
    }

    const missingColumn = getMissingColumnFromError(result.error.message);
    if (!missingColumn || !merchantSelectColumns.includes(missingColumn as (typeof merchantSelectColumns)[number])) {
      merchantQueryFailed = true;
      break;
    }

    missingMerchantColumns.add(missingColumn);
  }

  if (merchantQueryFailed) {
    return (
      <div className="space-y-6 pb-10">
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/user/${resolvedUserId}/feed`} className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
              Back to feed
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#9CA3AF]">Unable to load business profile right now.</p>
        </section>
      </div>
    );
  }

  const { data: favoriteData } = await admin
    .from("user_favorite_merchants")
    .select("merchant_id")
    .eq("user_id", resolvedUserId)
    .eq("merchant_id", merchantId)
    .maybeSingle();

  const initialIsFavorited = Boolean(favoriteData);

  let promoRows: PromoRowRaw[] = [];
  const missingPromoColumns = new Set<string>();

  for (let attempt = 0; attempt < promoSelectColumns.length; attempt += 1) {
    const selectColumns = promoSelectColumns.filter((column) => !missingPromoColumns.has(column));
    const selectClause = selectColumns.join(", ");
    const result = await admin
      .from("promos")
      .select(selectClause)
      .eq("merchant_id", merchantId)
      .in("status", ["ACTIVE", "SOLD_OUT", "EXPIRED", "PAUSED", "DRAFT", "DISABLED"])
      .order("created_at", { ascending: false });

    if (!result.error) {
      promoRows = ((result.data ?? []) as unknown) as PromoRowRaw[];
      break;
    }

    if (!isMissingColumnError(result.error.message)) {
      break;
    }

    const missingColumn = getMissingColumnFromError(result.error.message);
    if (!missingColumn || !promoSelectColumns.includes(missingColumn as (typeof promoSelectColumns)[number])) {
      break;
    }

    missingPromoColumns.add(missingColumn);
  }

  const merchantName = merchant?.business_name?.trim() || "Business profile";
  const merchantLogo = merchant?.logo_url ?? null;
  const promos = promoRows.map((row) =>
    mapPromoRowToCard({
      ...row,
      merchant_id: merchantId,
      slug: row.id,
      merchant: {
        business_name: merchantName,
        logo_url: merchantLogo,
        neighborhood: merchant?.neighborhood ?? null,
      },
      neighborhood: merchant?.neighborhood ?? null,
    }),
  );

  const promoWithExpiry = promos.map((promo) => {
    const source = promoRows.find((row) => row.id === promo.id) ?? null;
    const expiresAt = source?.expires_at ?? "";
    const expiresAtMs = new Date(expiresAt).getTime();
    const hot = isHotPromo(promo.availableSlots, promo.totalSlots);

    return {
      ...promo,
      expiresAt,
      expiresAtMs,
      hot,
    };
  });

  const activePromos = promoWithExpiry
    .filter((promo) => promo.status === "ACTIVE")
    .sort((a, b) => {
      const aEnds = Number.isFinite(a.expiresAtMs) ? a.expiresAtMs : Number.MAX_SAFE_INTEGER;
      const bEnds = Number.isFinite(b.expiresAtMs) ? b.expiresAtMs : Number.MAX_SAFE_INTEGER;

      if (aEnds !== bEnds) {
        return aEnds - bEnds;
      }
      if (a.isFeatured !== b.isFeatured) {
        return Number(b.isFeatured) - Number(a.isFeatured);
      }
      if (a.hot !== b.hot) {
        return Number(b.hot) - Number(a.hot);
      }
      return a.availableSlots - b.availableSlots;
    });

  const featuredPromos = promoWithExpiry.filter((promo) => promo.isFeatured).length;
  const soldOutPromos = promoWithExpiry.filter((promo) => promo.status === "SOLD_OUT").length;
  const totalPromosLaunched = promoWithExpiry.length;

  const { data: redemptions } = await admin
    .from("redemptions")
    .select("user_id, created_at")
    .eq("merchant_id", merchantId)
    .limit(2000);

  const redemptionRows = redemptions ?? [];
  const totalRedemptions = redemptionRows.length;
  const trustedUsers = new Set(redemptionRows.map((row) => row.user_id)).size;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const unlockedToday = redemptionRows.filter((row) => new Date(row.created_at).getTime() >= todayStart.getTime()).length;

  let similarMerchantsRaw: SimilarMerchantRow[] = [];
  {
    const selectFields = "id, business_name, business_category, category, neighborhood, logo_url, status";
    const { data: similarRows } = await admin
      .from("merchants")
      .select(selectFields)
      .neq("id", merchantId)
      .in("status", ["ACTIVE", "APPROVED"])
      .limit(12);

    const allSimilar = ((similarRows ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id ?? ""),
      business_name: (row.business_name as string | null | undefined) ?? null,
      business_category: (row.business_category as string | null | undefined) ?? null,
      category: (row.category as string | null | undefined) ?? null,
      neighborhood: (row.neighborhood as string | null | undefined) ?? null,
      logo_url: (row.logo_url as string | null | undefined) ?? null,
    }));

    const merchantNeighborhood = merchant?.neighborhood?.trim().toLowerCase() ?? "";
    const merchantCategory = (merchant?.category ?? merchant?.business_category ?? "").trim().toLowerCase();

    similarMerchantsRaw = allSimilar
      .filter((item) => {
        const neighborhood = item.neighborhood?.trim().toLowerCase() ?? "";
        const category = (item.category ?? item.business_category ?? "").trim().toLowerCase();
        if (merchantNeighborhood && neighborhood && neighborhood === merchantNeighborhood) {
          return true;
        }
        if (merchantCategory && category && category === merchantCategory) {
          return true;
        }
        return false;
      })
      .slice(0, 4);

    if (similarMerchantsRaw.length < 4) {
      const seen = new Set(similarMerchantsRaw.map((item) => item.id));
      const backfill = allSimilar.filter((item) => !seen.has(item.id)).slice(0, 4 - similarMerchantsRaw.length);
      similarMerchantsRaw = [...similarMerchantsRaw, ...backfill];
    }
  }

  const merchantDescription =
    merchant?.description?.trim() || merchant?.short_description?.trim() || "Discover all promos from this business.";
  const shortTagline = merchantDescription.length > 120 ? `${merchantDescription.slice(0, 117)}...` : merchantDescription;
  const aboutDescription = merchantDescription.length > 500 ? `${merchantDescription.slice(0, 497)}...` : merchantDescription;
  const merchantInitials = merchantName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("") || "BM";
  const merchantCategory = merchant?.category?.trim() || merchant?.business_category?.trim() || null;
  const merchantAddress = merchant?.address?.trim() || null;
  const merchantStatus = merchant?.status?.trim() || null;
  const merchantNeighborhood = merchant?.neighborhood?.trim() || "Neighborhood unavailable";
  const merchantPhone = merchant?.phone?.trim() || null;
  const merchantWebsite = normalizeWebsite(merchant?.website ?? null);
  const merchantMapUrl = getMapLink({
    latitude: merchant?.latitude ?? null,
    longitude: merchant?.longitude ?? null,
    address: merchantAddress,
  });

  const galleryImages = Array.from(new Set(promoWithExpiry.map((promo) => promo.imageUrl).filter(Boolean) as string[])).slice(0, 6);

  const ratingLabel = merchant?.rating && merchant.rating > 0 ? merchant.rating.toFixed(1) : null;
  const reviewCount = merchant?.review_count && merchant.review_count > 0 ? merchant.review_count : null;

  if (!merchant) {
    return (
      <div className="space-y-6 pb-10">
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/user/${resolvedUserId}/feed`} className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
              Back to feed
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#9CA3AF]">This business profile is not available.</p>
        </section>
      </div>
    );
  }

  if (isSuspendedStatus(merchantStatus)) {
    return (
      <div className="space-y-6 pb-10">
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/user/${resolvedUserId}/feed`} className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
              Back to feed
            </Link>
          </div>
          <h1 className="mt-3 text-xl font-semibold">Merchant currently unavailable</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">This profile is temporarily unavailable.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-20">
      <section className="overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E]">
        <div className="relative">
          <div className="relative h-36 w-full bg-gradient-to-r from-[#121212] via-[#1E1E1E] to-[#121212] sm:h-44">
            {merchant.cover_image_url ? (
              <Image src={merchant.cover_image_url} alt="Merchant cover" fill className="object-cover" sizes="100vw" priority />
            ) : null}
          </div>

          <div className="relative px-5 pb-5">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#1E1E1E] bg-[#121212] sm:h-24 sm:w-24">
                  {merchant.logo_url ? (
                    <Image src={merchant.logo_url} alt="Business logo" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold uppercase text-[#FAFAFA]">
                      {merchantInitials}
                    </div>
                  )}
                </div>

                <div className="min-w-0 pb-1">
                  <h1 className="truncate text-2xl font-semibold sm:text-3xl">{merchantName}</h1>
                  <p className="mt-1 max-w-xl text-sm text-[#D1D5DB]">{shortTagline}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <FavoriteMerchantButton merchantId={merchant.id} initialIsFavorited={initialIsFavorited} />
 
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#D1D5DB]">
              {merchantCategory ? (
                <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1">{merchantCategory}</span>
              ) : null}
              <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1">📍 {merchantNeighborhood}</span>
              <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1">🔥 {activePromos.length} Active Promos</span>
              {merchant.is_verified ? (
                <span className="rounded-full bg-[#00E5A8] px-3 py-1 font-semibold text-[#121212]">Verified</span>
              ) : null}
              {ratingLabel ? (
                <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1">
                  ⭐ {ratingLabel}
                  {reviewCount ? ` (${reviewCount})` : ""}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-sm text-[#9CA3AF]">{aboutDescription}</p>
            <div className="mt-4 space-y-2 text-sm text-[#D1D5DB]">
              <p>
                <span className="text-[#9CA3AF]">Business hours:</span> Hours available in-store
              </p>
              <p>
                <span className="text-[#9CA3AF]">Address:</span>{" "}
                {merchantMapUrl && merchantAddress ? (
                  <a href={merchantMapUrl} target="_blank" rel="noreferrer" className="text-[#00E5A8] underline-offset-2 hover:underline">
                    {merchantAddress}
                  </a>
                ) : (
                  merchantAddress ?? "Address not available"
                )}
              </p>
              <p>
                <span className="text-[#9CA3AF]">Contact:</span> {merchantPhone ? <a href={`tel:${merchantPhone}`}>{merchantPhone}</a> : "Not available"}
              </p>
              <p>
                <span className="text-[#9CA3AF]">Website:</span>{" "}
                {merchantWebsite ? (
                  <a href={merchantWebsite} target="_blank" rel="noreferrer" className="text-[#00E5A8] underline-offset-2 hover:underline">
                    {merchantWebsite.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  "Not available"
                )}
              </p>
            </div>
          </section>

          <MerchantProfileInteractions
            merchantId={merchant.id}
            userId={resolvedUserId}
            phone={merchantPhone}
            website={merchantWebsite}
            mapsUrl={merchantMapUrl}
          />


          {galleryImages.length > 0 ? (
            <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
              <h2 className="text-lg font-semibold">Photo gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryImages.map((imageUrl, index) => (
                  <div key={imageUrl} className="relative aspect-square overflow-hidden rounded-2xl border border-[#2A2A2A]">
                    <Image
                      src={imageUrl}
                      alt={`Merchant gallery ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
            <h2 className="text-lg font-semibold">Map preview</h2>
            <div className="mt-4 rounded-2xl border border-[#2A2A2A] bg-[#121212] p-4">
              <p className="text-sm text-[#9CA3AF]">{merchantAddress ?? "Location details will appear here."}</p>
              {merchantMapUrl ? (
                <a
                  href={merchantMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-xl bg-[#FF7A00] px-3 py-2 text-xs font-semibold text-[#121212]"
                >
                  Open in maps
                </a>
              ) : null}
            </div>
          </section>

          {similarMerchantsRaw.length > 0 ? (
            <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
              <h2 className="text-lg font-semibold">Nearby places you might like</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {similarMerchantsRaw.slice(0, 4).map((item) => {
                  const initials =
                    item.business_name
                      ?.split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((chunk: string) => chunk[0]?.toUpperCase() ?? "")
                      .join("") ?? "MP";

                  return (
                    <Link
                      key={item.id}
                      href={`/user/${resolvedUserId}/merchant/${item.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#121212] p-3 transition hover:border-[#3A3A3A]"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#2A2A2A] bg-[#1E1E1E]">
                        {item.logo_url ? (
                          <Image src={item.logo_url} alt="Merchant logo" fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold">{initials}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.business_name ?? "Merchant"}</p>
                        <p className="truncate text-xs text-[#9CA3AF]">
                          {(item.neighborhood ?? "Nearby") + " • " + (item.category ?? item.business_category ?? "General")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-4" id="live-promos">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">🔥 Live Deals</h2>
            <span className="text-xs text-[#9CA3AF]">Ending soon first</span>
          </div>

          {activePromos.length === 0 ? (
            <article className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
              <p className="text-sm text-[#9CA3AF]">Currently no live deals. Check back soon.</p>
              <p className="mt-3 text-xs text-[#9CA3AF]">Follow for next drop.</p>
            </article>
          ) : (
            activePromos.map((promo) => {
              const promoHot = promo.hot;
              const promoExpiringSoon = isExpiringSoon(promo.expiresAt);

              return (
                <article
                  key={promo.id}
                  className={`overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] transition hover:border-[#3A3A3A] ${
                    promoExpiringSoon ? "animate-[pulse_2.2s_ease-in-out_infinite]" : ""
                  }`}
                >
                  {promo.imageUrl ? (
                    <div className="relative aspect-[16/8] w-full">
                      <Image src={promo.imageUrl} alt={promo.title} fill sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" loading="lazy" />
                    </div>
                  ) : null}

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-[#121212] px-3 py-1 text-[#9CA3AF]">{promo.category ?? "General"}</span>
                      {promo.isFeatured ? (
                        <span className="rounded-full bg-[#FF7A00] px-3 py-1 font-semibold text-[#121212]">Featured</span>
                      ) : null}
                      {promoHot ? (
                        <span className="rounded-full border border-[#FF7A00] px-3 py-1 text-[#FF7A00]">Hot deal</span>
                      ) : null}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{promo.title}</h3>
                      <p className="mt-1 text-sm text-[#9CA3AF]">{promo.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-2 py-2">
                        <p className="text-[#9CA3AF]">Expires</p>
                        <p className="mt-1 font-semibold">{formatTimeLeft(promo.expiresAt)}</p>
                      </div>
                      <div className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-2 py-2">
                        <p className="text-[#9CA3AF]">Slots left</p>
                        <p className="mt-1 font-semibold">{promo.availableSlots}</p>
                      </div>
                      <div className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-2 py-2">
                        <p className="text-[#9CA3AF]">Cashback</p>
                        <p className="mt-1 font-semibold">{promo.cashbackPercent}%</p>
                      </div>
                      <div className="rounded-xl border border-[#2A2A2A] bg-[#121212] px-2 py-2 sm:block hidden">
                        <p className="text-[#9CA3AF]">Price</p>
                        <p className="mt-1 font-semibold">${promo.discountedPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">${promo.discountedPrice}</p>
                        <p className="text-sm text-[#9CA3AF] line-through">${promo.originalPrice}</p>
                      </div>
                      <Link
                        href={`/promo/${promo.id}`}
                        data-promo-link="true"
                        data-promo-id={promo.id}
                        className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212]"
                      >
                        View promo
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
