"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { CategoryChips } from "./components/CategoryChips";
import { FeedTabs } from "./components/FeedTabs";
import { LiveActivityStrip } from "./components/LiveActivityStrip";
import { PromoCard } from "./components/PromoCard";
import { PromoPreviewModal } from "./components/PromoPreviewModal";
import { StoryHighlightsStrip } from "./components/StoryHighlightsStrip";
import { StoryViewerModal } from "./components/StoryViewerModal";
import { useDailyProgress } from "./hooks/useDailyProgress";
import { useFeedPromos } from "./hooks/useFeedPromos";
import { useNow } from "./hooks/useNow";
import { DEFAULT_FEED_TAB_ID } from "./types";
import { getFeedSections, getLiveActivity, getStoryHighlights } from "./utils";

const CATEGORY_FILTER_STORAGE_KEY = "bonix:feed-category-filter";

export default function UserFeedPage() {
  const params = useParams<{ userId?: string | string[] }>();
  const userId = Array.isArray(params?.userId) ? params.userId[0] : (params?.userId ?? "");
  const nowMs = useNow();
  const [activeStoryPromoId, setActiveStoryPromoId] = useState<string | null>(null);
  const [activePreviewPromoId, setActivePreviewPromoId] = useState<string | null>(null);
  const [activeFeedTabId, setActiveFeedTabId] = useState(DEFAULT_FEED_TAB_ID);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  const {
    promos,
    loading,
    loadingMore,
    errorMessage,
    hasMore,
    loadMore,
  } = useFeedPromos();

  const todayKey = useMemo(() => new Date(nowMs).toISOString().slice(0, 10), [nowMs]);
  const { incrementDailyCreditsUsed } = useDailyProgress(todayKey);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map<string, string>();

    promos.forEach((promo) => {
      const value = promo.category?.trim();
      if (!value) return;
      const key = value.toLowerCase();
      if (!categoryMap.has(key)) {
        categoryMap.set(key, value);
      }
    });

    return [{ id: "all", label: "All" }, ...Array.from(categoryMap, ([id, label]) => ({ id, label }))];
  }, [promos]);

  const filteredPromos = useMemo(() => {
    if (activeCategoryId === "all") return promos;

    return promos.filter((promo) => promo.category?.trim().toLowerCase() === activeCategoryId);
  }, [promos, activeCategoryId]);

  const liveActivity = useMemo(() => getLiveActivity(filteredPromos, nowMs), [filteredPromos, nowMs]);
  const storyHighlights = useMemo(() => getStoryHighlights(filteredPromos, nowMs), [filteredPromos, nowMs]);
  const feedSections = useMemo(() => getFeedSections(filteredPromos, nowMs), [filteredPromos, nowMs]);
  const totalSectionPromos = useMemo(
    () => feedSections.reduce((sum, section) => sum + section.promos.length, 0),
    [feedSections],
  );
  const activeFeedSection = useMemo(
    () => feedSections.find((section) => section.id === activeFeedTabId) ?? feedSections[0],
    [feedSections, activeFeedTabId],
  );
  const activePreviewPromo = useMemo(
    () => filteredPromos.find((promo) => promo.id === activePreviewPromoId) ?? null,
    [filteredPromos, activePreviewPromoId],
  );
  const activeStory = useMemo(
    () => storyHighlights.find((story) => story.promoId === activeStoryPromoId) ?? null,
    [storyHighlights, activeStoryPromoId],
  );

  // Adjust derived selection state during render (React 19 pattern) instead
  // of using an effect, which avoids the cascading-render lint rule.
  if (!feedSections.some((section) => section.id === activeFeedTabId) && feedSections.length > 0) {
    setActiveFeedTabId(feedSections[0].id);
  }

  useEffect(() => {
    // Browser-only localStorage read on mount; effect is the right tool
    // because localStorage is unavailable during SSR.
    const savedCategoryId = window.localStorage.getItem(CATEGORY_FILTER_STORAGE_KEY);
    if (savedCategoryId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCategoryId(savedCategoryId);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CATEGORY_FILTER_STORAGE_KEY, activeCategoryId);
  }, [activeCategoryId]);

  if (!categoryOptions.some((option) => option.id === activeCategoryId)) {
    setActiveCategoryId("all");
  }

  return (
    <section className="space-y-8 pb-24">
      <div className="space-y-6">
        {!loading && !errorMessage ? (
          <StoryHighlightsStrip
            storyHighlights={storyHighlights}
            onOpenStory={(promoId) => setActiveStoryPromoId(promoId)}
          />
        ) : null}

        {/* {!loading && !errorMessage ? <LiveActivityStrip items={liveActivity} /> : null} */}

        {loading && <p className="px-4 text-sm text-gray-400">Loading promos...</p>}

        {!loading && errorMessage && <p className="px-4 text-sm text-[#FF7A00]">Unable to load promos.</p>}

        {!loading && !errorMessage && totalSectionPromos === 0 && (
          <p className="px-4 text-sm text-gray-400">No promos available right now.</p>
        )}

        {!loading && !errorMessage ? (
          <CategoryChips
            options={categoryOptions}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
          />
        ) : null}

        {!loading && !errorMessage ? (
          <FeedTabs
            sections={feedSections}
            activeTabId={activeFeedTabId}
            onSelectTab={setActiveFeedTabId}
            panelIdPrefix="feed-panel"
          />
        ) : null}

        {!loading && !errorMessage && activeFeedSection ? (
          <div
            className="space-y-4"
            role="tabpanel"
            id={`feed-panel-${activeFeedSection.id}`}
            aria-labelledby={`tab-${activeFeedSection.id}`}
          >
            <div className="px-4">
              <h3 className="text-lg font-semibold tracking-tight text-[#FAFAFA]">{activeFeedSection.title}</h3>
            </div>

            {activeFeedSection.promos.length === 0 ? (
              <p className="px-4 text-sm text-gray-400">No promos in this tab right now.</p>
            ) : (
              <div className="space-y-6">
                {activeFeedSection.promos.map((promo, index) => (
                  <PromoCard
                    key={`${activeFeedSection.id}-${promo.id}`}
                    promo={promo}
                    index={index}
                    nowMs={nowMs}
                    userId={userId}
                    onOpenPreview={setActivePreviewPromoId}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {!loading && !errorMessage && hasMore ? (
          <div className="px-4">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] py-3 text-sm font-semibold text-[#FAFAFA]"
            >
              {loadingMore ? "Loading more..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>

      <PromoPreviewModal
        promo={activePreviewPromo}
        nowMs={nowMs}
        onClose={() => setActivePreviewPromoId(null)}
        onRedeem={incrementDailyCreditsUsed}
      />

      <StoryViewerModal story={activeStory} onClose={() => setActiveStoryPromoId(null)} />
    </section>
  );
}
