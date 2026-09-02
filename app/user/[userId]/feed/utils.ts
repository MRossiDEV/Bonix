import { FeedPromo, FeedSection, LiveActivity, StoryHighlight, CountdownParts } from "./types";

export function getCountdownParts(expiresAt: string, nowMs: number): CountdownParts {
  const end = new Date(expiresAt).getTime();
  const safeEnd = Number.isFinite(end) ? end : 0;
  const diffMs = Math.max(0, safeEnd - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs: diffMs, days, hours, minutes, seconds };
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDuration(totalSecondsRaw: number | null | undefined): string {
  const totalSeconds =
    typeof totalSecondsRaw === "number" && Number.isFinite(totalSecondsRaw)
      ? Math.max(0, Math.floor(totalSecondsRaw))
      : 0;

  if (totalSeconds === 0) return "under 1m";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getLiveActivity(promos: FeedPromo[], nowMs: number): LiveActivity[] {
  if (promos.length === 0) return [];

  const minuteBucket = Math.floor(nowMs / 60000);
  const activePromos = promos.filter((promo) => promo.status === "ACTIVE");
  const nearSellOutPromos = activePromos.filter(
    (promo) => promo.remaining > 0 && promo.remaining <= Math.max(3, Math.floor(promo.total * 0.2)),
  );
  const expiringSoonPromos = activePromos.filter((promo) => {
    const msToExpire = new Date(promo.expiresAt).getTime() - nowMs;
    return msToExpire > 0 && msToExpire <= 1000 * 60 * 60 * 3;
  });

  const baseUnlocked = activePromos.reduce(
    (sum, promo) => sum + Math.max(0, promo.total - promo.remaining),
    0,
  );
  const simulatedUnlocked = Math.max(4, Math.min(99, baseUnlocked + 8 + (minuteBucket % 7)));

  const pickedMerchant =
    activePromos.length > 0
      ? activePromos[(minuteBucket + promos.length) % activePromos.length].merchantName
      : promos[0]?.merchantName;

  const activity: LiveActivity[] = [
    {
      id: `unlock-${minuteBucket}`,
      text: `🔴 ${simulatedUnlocked} people just unlocked deals in Roma`,
    },
  ];

  if (nearSellOutPromos.length > 0) {
    activity.push({
      id: `slots-${nearSellOutPromos.length}`,
      text: `🔥 ${nearSellOutPromos.length} promos almost sold out`,
    });
  }

  if (expiringSoonPromos.length > 0) {
    activity.push({
      id: `expiry-${expiringSoonPromos.length}`,
      text: `⏳ ${expiringSoonPromos.length} promos ending in under 3h`,
    });
  }

  const soldOutCount = promos.filter((promo) => promo.status === "SOLD_OUT").length;
  if (soldOutCount > 0) {
    activity.push({
      id: `soldout-${soldOutCount}`,
      text: `⚡ ${soldOutCount} deals sold out fast today`,
    });
  }

  if (pickedMerchant) {
    activity.push({
      id: `drop-${hashString(pickedMerchant)}`,
      text: `🎉 New drop from ${pickedMerchant}`,
    });
  }

  return activity.slice(0, 6);
}

export function getStoryHighlights(promos: FeedPromo[], nowMs: number): StoryHighlight[] {
  const active = promos.filter((promo) => promo.status === "ACTIVE");
  const sorted = [...active].sort((first, second) => {
    const firstScore = (first.hot ? 3 : 0) + (first.isFeatured ? 2 : 0) + Math.max(0, 8 - first.remaining);
    const secondScore =
      (second.hot ? 3 : 0) + (second.isFeatured ? 2 : 0) + Math.max(0, 8 - second.remaining);
    return secondScore - firstScore;
  });

  return sorted.slice(0, 12).map((promo) => {
    const msToExpire = new Date(promo.expiresAt).getTime() - nowMs;
    return {
      id: `story-${promo.id}`,
      promoId: promo.id,
      merchantName: promo.merchantName,
      title: promo.title,
      imageUrl: promo.imageUrl,
      hot: promo.hot,
      expiringUnder2h: msToExpire > 0 && msToExpire <= 1000 * 60 * 60 * 2,
      expiresAt: promo.expiresAt,
      status: promo.status,
    } satisfies StoryHighlight;
  });
}

function getTimestamp(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getPromoActivityScore(promo: FeedPromo): number {
  if (promo.total <= 0) return promo.hot ? 0.2 : 0;
  const sold = Math.max(0, promo.total - promo.remaining);
  const soldRatio = sold / promo.total;
  const scarcityRatio = 1 - Math.max(0, promo.remaining) / promo.total;
  return soldRatio * 0.6 + scarcityRatio * 0.4 + (promo.hot ? 0.2 : 0);
}

export function getFeedSections(promos: FeedPromo[], nowMs: number): FeedSection[] {
  const activePromos = promos.filter((promo) => promo.status === "ACTIVE");
  const allVisiblePromos = promos.filter((promo) => promo.status !== "EXPIRED");

  const endingSoon = activePromos
    .filter((promo) => {
      const msToExpire = getTimestamp(promo.expiresAt) - nowMs;
      return msToExpire > 0 && msToExpire <= 1000 * 60 * 60 * 3;
    })
    .sort((first, second) => getTimestamp(first.expiresAt) - getTimestamp(second.expiresAt));

  const usedPromoIds = new Set(endingSoon.map((promo) => promo.id));

  const hotRightNow = activePromos
    .filter((promo) => !usedPromoIds.has(promo.id))
    .filter((promo) => promo.remaining <= 5 || getPromoActivityScore(promo) >= 0.65)
    .sort((first, second) => getPromoActivityScore(second) - getPromoActivityScore(first));

  hotRightNow.forEach((promo) => usedPromoIds.add(promo.id));

  const featured = allVisiblePromos
    .filter((promo) => !usedPromoIds.has(promo.id) && promo.isFeatured)
    .sort((first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt));

  featured.forEach((promo) => usedPromoIds.add(promo.id));

  const newDrops = allVisiblePromos
    .filter((promo) => !usedPromoIds.has(promo.id))
    .sort((first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt));

  return [
    { id: "ending-soon", title: "⌛", promos: endingSoon },
    { id: "hot-right-now", title: "🔥", promos: hotRightNow },
    { id: "featured", title: "⭐", promos: featured },
    { id: "new-drops", title: "🆕", promos: newDrops },
  ];
}

export function getPromoSocialProofText(promo: FeedPromo, nowMs: number): string {
  const msToExpire = getTimestamp(promo.expiresAt) - nowMs;
  const unlockedCount = Math.max(1, promo.total - promo.remaining);

  if (promo.status === "ACTIVE" && promo.remaining > 0 && promo.remaining < 3) {
    return `Only ${promo.remaining} left · Almost gone`;
  }

  if (msToExpire > 0 && msToExpire <= 1000 * 60 * 60 * 2) {
    return "High demand · Ending in under 2h";
  }

  if (promo.hot) {
    return "Trending right now · People are unlocking this fast";
  }

  if (promo.isFeatured) {
    return "Featured drop · Strategic merchant spotlight";
  }

  return `${unlockedCount} people already unlocked this deal`;
}
