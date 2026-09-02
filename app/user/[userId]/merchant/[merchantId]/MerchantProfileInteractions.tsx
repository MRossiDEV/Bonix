"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MerchantProfileInteractionsProps = {
  merchantId: string;
  userId: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
};

type EventType = "PROFILE_VIEW" | "PROMO_CLICK" | "PROFILE_SESSION";

type TrackPayload = {
  merchantId: string;
  userId: string;
  eventType: EventType;
  promoId?: string;
  timeOnPageMs?: number;
  scrollDepth?: number;
};

function sendEvent(payload: TrackPayload, useBeacon = false): void {
  const body = JSON.stringify(payload);

  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/merchant-profile", blob);
    return;
  }

  void fetch("/api/analytics/merchant-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

export function MerchantProfileInteractions({
  merchantId,
  userId,
  phone,
  website,
  mapsUrl,
}: MerchantProfileInteractionsProps) {
  const [showSticky, setShowSticky] = useState(false);
  const maxScrollDepth = useRef(0);
  const mountedAt = useRef(0);
  const finalized = useRef(false);

  useEffect(() => {
    mountedAt.current = Date.now();

    sendEvent({
      merchantId,
      userId,
      eventType: "PROFILE_VIEW",
    });

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const height = Math.max(document.documentElement.scrollHeight, 1);
      const depth = Math.min(100, Math.round(((scrollTop + viewport) / height) * 100));

      if (depth > maxScrollDepth.current) {
        maxScrollDepth.current = depth;
      }

      setShowSticky(scrollTop > 200);
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      const promoLink = target.closest("[data-promo-link='true']") as HTMLElement | null;
      if (!promoLink) {
        return;
      }
      const promoId = promoLink.getAttribute("data-promo-id") ?? undefined;
      sendEvent({
        merchantId,
        userId,
        eventType: "PROMO_CLICK",
        promoId,
      });
    };

    const finalizeSession = () => {
      if (finalized.current) {
        return;
      }
      finalized.current = true;

      sendEvent(
        {
          merchantId,
          userId,
          eventType: "PROFILE_SESSION",
          timeOnPageMs: Date.now() - mountedAt.current,
          scrollDepth: maxScrollDepth.current,
        },
        true,
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        finalizeSession();
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", finalizeSession);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", finalizeSession);
      finalizeSession();
    };
  }, [merchantId, userId]);

  const actions = useMemo(
    () => [
      { label: "🔥 View Promos", href: "#live-promos", enabled: true },
      { label: "📍 Maps", href: mapsUrl, enabled: Boolean(mapsUrl), external: true },
      { label: "📞 Call", href: phone ? `tel:${phone}` : null, enabled: Boolean(phone), external: true },
      { label: "🌐 Website", href: website, enabled: Boolean(website), external: true },
    ],
    [mapsUrl, phone, website],
  );

  return (
    <section
      className={`sticky top-2 z-30 rounded-2xl border border-[#2A2A2A] bg-[#121212]/95 p-2 backdrop-blur transition duration-300 ${
        showSticky ? "opacity-100 translate-y-0" : "opacity-95"
      }`}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          if (!action.enabled || !action.href) {
            return (
              <span
                key={action.label}
                className="rounded-xl border border-[#2A2A2A] px-3 py-2 text-center text-xs text-[#6B7280]"
              >
                {action.label}
              </span>
            );
          }

          return (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
              className="rounded-xl border border-[#2A2A2A] px-3 py-2 text-center text-xs font-semibold text-[#FAFAFA] transition hover:border-[#3A3A3A]"
            >
              {action.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
