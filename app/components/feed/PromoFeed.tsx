"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Bell, Bookmark, ChevronRight, Clock3, Filter, Flame, Map, MapPin, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import getActivePromos from "@/lib/promos/get-promos";
import type { PromoCardData } from "@/types/promos";

type PromoFeedProps = {
  promos?: PromoCardData[];
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  compact?: boolean;
};

const EMPTY_PROMOS: PromoCardData[] = [];
const filters = ["All Deals", "Under $300", "Coffee", "Pizza", "Burgers"];
const navItems = [
  { label: "Feed", href: "/feed" },
  { label: "Saved", href: "/reservations" },
  { label: "Wallet", href: "/wallet" },
  { label: "Nearby", href: "/nearby" },
  { label: "Profile", href: "/profile" },
];

export function PromoFeed({
  promos: initialPromos = EMPTY_PROMOS,
  title = "Bonix Feed",
  subtitle = "Discover nearby deals",
  limit,
  showViewAll = false,
  compact = false,
}: PromoFeedProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<PromoCardData[]>(initialPromos);
  const [loading, setLoading] = useState(initialPromos.length === 0);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Deals");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPromos = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setItems(await getActivePromos());
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load promos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialPromos.length === 0) void loadPromos();
  }, [initialPromos, loadPromos]);

  const visiblePromos = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = items.filter((promo) => !term || [promo.title, promo.description, promo.merchantName].some((value) => value.toLowerCase().includes(term)));

    if (selectedFilter === "Under $300") result = result.filter((promo) => promo.discountedPrice <= 300);
    if (["Coffee", "Pizza", "Burgers"].includes(selectedFilter)) {
      result = result.filter((promo) => promo.category?.toLowerCase().includes(selectedFilter.toLowerCase()));
    }

    return typeof limit === "number" ? result.slice(0, limit) : result;
  }, [items, limit, search, selectedFilter]);

  return (
    <div className={`${compact ? "min-h-fit" : "min-h-screen"} bonix-shell text-white`}>
      {!compact ? (
        <header className="bonix-shell__header sticky top-0 z-40 border-b border-white/10 bg-[#050609]/85 backdrop-blur-2xl">
          <div className="mx-auto max-w-6xl px-4 pb-5 pt-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#DFFF00]" /><h1 className="text-2xl font-black tracking-tight">BONIX</h1></div>
                <div className="mt-1 flex items-center gap-1 text-sm text-[#DFFF00]"><MapPin className="h-4 w-4" />Montevideo, Uruguay</div>
              </div>
              <button type="button" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#11151D]"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#DFFF00]" /></button>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <div className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#949AA6]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search promos, coffee, burgers..." className="h-14 w-full rounded-2xl border border-white/10 bg-[#11151D] pl-12 pr-4 text-sm outline-none placeholder:text-[#6B7280]" /></div>
              <button type="button" aria-label="Filter promos" className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#11151D]"><Filter className="h-5 w-5" /></button>
              <button type="button" aria-label="View nearby promos" className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-[#11151D]"><Map className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">{filters.map((filter) => <button key={filter} type="button" onClick={() => setSelectedFilter(filter)} className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold ${selectedFilter === filter ? "bg-[#DFFF00] text-[#101300] shadow-[0_0_24px_rgba(223,255,0,0.18)]" : "border border-white/10 bg-[#11151D] text-[#D1D5DB]"}`}>{filter}</button>)}</div>
          </div>
        </header>
      ) : (
        <div className="px-6 pt-10"><p className="bonix-label">Live feed</p><h2 className="mt-2 text-2xl font-semibold">{title}</h2>{subtitle ? <p className="mt-2 text-sm text-[#949AA6]">{subtitle}</p> : null}{showViewAll ? <Link href="/feed" className="mt-3 inline-block text-sm font-semibold text-[#DFFF00]">View all</Link> : null}</div>
      )}

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-28 pt-6 sm:px-6">
        {loading ? [0, 1, 2].map((index) => <SkeletonCard key={index} />) : null}
        {!loading && errorMessage ? <div className="bonix-surface p-8 text-center text-[#FF9A3D]">{errorMessage}</div> : null}
        {!loading && !errorMessage && visiblePromos.length === 0 ? <div className="bonix-surface p-12 text-center"><Search className="mx-auto h-8 w-8 text-[#DFFF00]" /><h2 className="mt-4 text-2xl font-black">No deals nearby</h2><p className="mt-2 text-sm text-[#949AA6]">Try another search or filter.</p></div> : null}
        {!loading && !errorMessage ? visiblePromos.map((promo, index) => <PromoCard key={promo.id} promo={promo} priority={index < 2} />) : null}
      </main>

      {!compact ? <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#050609]/90 backdrop-blur-2xl"><div className="mx-auto grid max-w-lg grid-cols-5 px-2 py-3">{navItems.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold ${active ? "text-[#DFFF00]" : "text-[#949AA6]"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#DFFF00]" : "bg-transparent"}`} />{item.label}</Link>; })}</div></nav> : null}
    </div>
  );
}

function PromoCard({ promo, priority }: { promo: PromoCardData; priority: boolean }) {
  const saveAmount = Math.max(0, Math.round(promo.originalPrice - promo.discountedPrice));
  const expiresSoon = promo.availableSlots <= 5;

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-[#DFFF00]/35 bg-[#0C0F14] shadow-[0_25px_80px_rgba(223,255,0,0.06)] transition-transform duration-300 hover:-translate-y-1 md:grid md:grid-cols-2">
      <Link href={`/promo/${promo.slug}`} className="contents">
        <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-[#1B2110] via-[#10150B] to-[#050609] md:min-h-[455px]">
          {promo.imageUrl ? <Image src={promo.imageUrl} alt={promo.title} fill priority={priority} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover mix-blend-screen opacity-90" /> : <div className="absolute inset-0 flex items-center justify-center text-8xl text-[#DFFF00]/20">✦</div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="absolute left-5 top-5 rounded-[14px] border border-[#DFFF00]/70 bg-black/35 px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-[#DFFF00] backdrop-blur-xl">✦ {promo.discountPercent}% OFF</div>
          <div className="absolute right-5 top-5 rounded-2xl border border-white/20 bg-black/55 px-3 py-2 text-right backdrop-blur-sm"><p className="text-2xl font-black text-[#00E5A8]">${saveAmount}</p><p className="text-[9px] font-bold uppercase tracking-wide">you save</p></div>
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#080A0F]/80 px-3 py-2.5 backdrop-blur-xl"><Flame className="h-4 w-4 text-[#FF6A00]" /><p className="text-xs text-[#D7DBE0]">{promo.redemptionCount ?? 0} people<br /><span className="text-[#949AA6]">claimed this recently</span></p></div>
        </div>
        <div className="flex min-h-[360px] flex-col p-6 md:min-h-[455px] md:p-7">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-bold text-white">{promo.merchantName}</p><p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#949AA6]">{promo.category ?? "Food"}</p><h2 className="mt-6 line-clamp-2 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">{promo.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#949AA6]">{promo.description}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#6B7280]" /></div>
          <div className="mt-auto flex items-end justify-between gap-4 pt-8"><div><p className="text-sm text-[#6B7280] line-through">${promo.originalPrice}</p><div className="flex items-end gap-2"><span className="text-4xl font-black">${promo.discountedPrice}</span><span className="mb-1 text-sm font-bold text-[#00E5A8]">+{promo.cashbackPercent}%</span></div></div><span className="flex items-center gap-2 rounded-2xl bg-[#DFFF00] px-5 py-3 text-sm font-black text-[#101300] shadow-[0_0_30px_rgba(223,255,0,0.2)]">View offer <ArrowRight className="h-4 w-4" /></span></div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#949AA6]"><Clock3 className="h-4 w-4 text-[#DFFF00]" />{expiresSoon ? "Only a few left" : "Available now"}<span className="ml-auto">{promo.availableSlots} rewards left</span><Bookmark className="h-4 w-4" /></div>
        </div>
      </Link>
    </motion.article>
  );
}

function SkeletonCard() {
  return <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-[#0C0F14] md:grid-cols-2"><div className="min-h-[300px] animate-pulse bg-[#11151D] md:min-h-[455px]" /><div className="space-y-5 p-7"><div className="h-4 w-32 animate-pulse rounded-full bg-[#1B2430]" /><div className="h-16 w-3/4 animate-pulse rounded-xl bg-[#1B2430]" /><div className="h-4 w-full animate-pulse rounded-full bg-[#1B2430]" /><div className="h-14 w-full animate-pulse rounded-2xl bg-[#1B2430]" /></div></div>;
}
