"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Flame,
  ShieldAlert,
  Store,
  Ticket,
  TrendingUp,
  Wallet,
  MapPin,
} from "lucide-react";

type ActivityItem = {
  id: string;
  type:
    | "redemption"
    | "merchant"
    | "promo"
    | "alert"
    | "fraud"
    | "cashflow";
  title: string;
  description: string;
  time: string;
  priority?: "high" | "medium" | "low";
};

const activityFeed: ActivityItem[] = [
  {
    id: "1",
    type: "redemption",
    title: "High redemption spike",
    description:
      "Burger Point reached 42 claims in the last 2 hours.",
    time: "2m ago",
    priority: "high",
  },

  {
    id: "2",
    type: "cashflow",
    title: "Late-month promo performing well",
    description:
      "Coffee Lab increased Monday revenue by 28%.",
    time: "12m ago",
    priority: "medium",
  },

  {
    id: "3",
    type: "promo",
    title: "Promo expiring soon",
    description:
      "2x1 Sushi Night ends in 3 hours.",
    time: "20m ago",
    priority: "high",
  },

  {
    id: "4",
    type: "merchant",
    title: "Merchant needs attention",
    description:
      "Pizza Roots has low traffic this week.",
    time: "35m ago",
    priority: "medium",
  },

  {
    id: "5",
    type: "fraud",
    title: "Suspicious redemption activity",
    description:
      "Multiple scans detected from same device.",
    time: "1h ago",
    priority: "high",
  },

  {
    id: "6",
    type: "redemption",
    title: "Claim volume increasing",
    description:
      "Cheap Lunch category trending in Centro.",
    time: "2h ago",
    priority: "low",
  },
];

function getIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "redemption":
      return (
        <Flame className="h-5 w-5 text-[#FF7A00]" />
      );

    case "merchant":
      return (
        <Store className="h-5 w-5 text-[#00E5A8]" />
      );

    case "promo":
      return (
        <Ticket className="h-5 w-5 text-[#7B61FF]" />
      );

    case "alert":
      return (
        <AlertTriangle className="h-5 w-5 text-[#FFB067]" />
      );

    case "fraud":
      return (
        <ShieldAlert className="h-5 w-5 text-[#FF4D4D]" />
      );

    case "cashflow":
      return (
        <Wallet className="h-5 w-5 text-[#00E5A8]" />
      );

    default:
      return (
        <Bell className="h-5 w-5 text-[#9CA3AF]" />
      );
  }
}

function getPriorityStyle(
  priority?: ActivityItem["priority"]
) {
  switch (priority) {
    case "high":
      return "border-[#FF7A00]/20 bg-[#FF7A00]/10";

    case "medium":
      return "border-white/10 bg-white/[0.03]";

    default:
      return "border-white/5 bg-[#121212]";
  }
}

export default function AgentActivityPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] pb-32 text-white">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-[#0B0B0B]/80 backdrop-blur-2xl">
        <div className="px-5 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
                BONIX AGENT
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Activity
              </h1>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#121212]">
              <Bell className="h-5 w-5 text-[#FAFAFA]" />
            </div>
          </div>

          {/* LIVE STATUS */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#00E5A8]/10 bg-[#00E5A8]/5 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-[#00E5A8]" />

            <span className="text-sm font-medium text-[#D1FAE5]">
              Live operational monitoring active
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <section className="grid grid-cols-2 gap-4 px-5 pt-5">
        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#FF7A00]/10 p-3">
              <TrendingUp className="h-5 w-5 text-[#FF7A00]" />
            </div>

            <div>
              <p className="text-xs text-[#6B7280]">
                Redemptions Today
              </p>

              <h2 className="mt-1 text-2xl font-black">
                182
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#00E5A8]/10 p-3">
              <CheckCircle2 className="h-5 w-5 text-[#00E5A8]" />
            </div>

            <div>
              <p className="text-xs text-[#6B7280]">
                Healthy Merchants
              </p>

              <h2 className="mt-1 text-2xl font-black">
                8/10
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* FEED */}
      <section className="space-y-4 px-5 pt-6">
        {activityFeed.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.04,
            }}
            whileTap={{
              scale: 0.985,
            }}
            className={`rounded-[2rem] border p-5 ${getPriorityStyle(
              item.priority
            )}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30">
                {getIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 whitespace-nowrap text-xs text-[#6B7280]">
                    <Clock3 className="h-3.5 w-3.5" />

                    {item.time}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-black text-black"
                  >
                    Review
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-[#9CA3AF]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </section>

      {/* BOTTOM NAV */}
      {/* <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0B0B0B]/90 backdrop-blur-2xl">
        <div className="grid grid-cols-5 px-2 py-3">
          {[
            {
              label: "Dashboard",
              href: "/agent/dashboard",
              icon: TrendingUp,
            },

            {
              label: "Merchants",
              href: "/agent/merchants",
              icon: Store,
            },

            {
              label: "Offers",
              href: "/agent/offers",
              icon: Ticket,
            },

            {
              label: "Activity",
              href: "/agent/activity",
              icon: Bell,
              active: true,
            },

            {
              label: "Profile",
              href: "/agent/profile",
              icon: MapPin,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 py-2"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                    item.active
                      ? "bg-[#FF7A00] text-black"
                      : "bg-transparent text-[#6B7280]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`text-[11px] font-semibold ${
                    item.active
                      ? "text-white"
                      : "text-[#6B7280]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav> */}
    </main>
  );
}