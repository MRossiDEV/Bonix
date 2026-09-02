"use client";

import { Map } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
    ArrowRight,
    BarChart3,
    Bell,
    Briefcase,
    CalendarDays,
    ChevronRight,
    Clock3,
    Flame,
    MapPin,
    Megaphone,
    Plus,
    Store,
    TrendingDown,
    TrendingUp,
    Wallet,
    Zap,
} from "lucide-react";

type AgentDashboardClientProps = {
  agentID: string;
};

export default function AgentDashboardClient({
  agentID,
}: AgentDashboardClientProps) {
  const merchants = [
    {
      name: "Cafe Central",
      category: "Coffee",
      area: "Centro",
      revenue: "+18%",
      health: "good",
      alert: "Traffic spike after 7PM",
    },
    {
      name: "Smash Factory",
      category: "Burgers",
      area: "Cordón",
      revenue: "-12%",
      health: "warning",
      alert: "Weak Tuesday performance",
    },
    {
      name: "Pizza Lab",
      category: "Pizza",
      area: "Pocitos",
      revenue: "+32%",
      health: "good",
      alert: "2x1 offer trending",
    },
  ];

  const insights = [
    {
      title: "Late-month demand increasing",
      description:
        "Cheap lunch offers are converting 24% better this week.",
      icon: TrendingUp,
    },
    {
      title: "Weak occupancy detected",
      description:
        "3 merchants need traffic boosts tonight.",
      icon: AlertTriangle,
    },
    {
      title: "Burger promos outperforming",
      description:
        "Burger deals have the highest redemption rate after the 20th.",
      icon: Flame,
    },
  ];

  const quickActions = [
    {
      title: "Create smart offer",
      icon: Plus,
    },
    {
      title: "Boost weak merchant",
      icon: Zap,
    },
    {
      title: "View city insights",
      icon: BarChart3,
    },
    {
      title: "Launch urgency promo",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* TOP HEADER */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              BONIX Agent
            </p>

            <h1 className="mt-1 text-2xl font-black">
              Operations Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF7A00] text-lg font-black text-black">
              {agentID.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <main className="space-y-6 px-4 pb-32 pt-5">
        {/* HERO */}
        <section className="overflow-hidden rounded-[2rem] border border-[#FF7A00]/10 bg-gradient-to-br from-[#FF7A00]/20 via-[#121212] to-[#121212] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#FFB067]">
                Smart Spending Operations
              </p>

              <h2 className="mt-3 text-4xl font-black leading-tight">
                Welcome back,
                <br />
                Agent {agentID}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#D1D5DB]">
                Help local businesses stay active all month long through smart demand balancing.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-xl">
              <Wallet className="h-7 w-7 text-[#00E5A8]" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <MetricCard
              label="Revenue Generated"
              value="$124K"
              positive
            />

            <MetricCard
              label="Active Merchants"
              value="12"
            />

            <MetricCard
              label="Promo Redemption"
              value="28%"
              positive
            />

            <MetricCard
              label="Weak Businesses"
              value="3"
              warning
            />
          </div>
        </section>

        {/* PRIORITIES */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Today&apos;s Priorities
            </h2>

            <button className="text-sm font-semibold text-[#FF7A00]">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {insights.map((item) => (
              <motion.div
                whileTap={{ scale: 0.985 }}
                key={item.title}
                className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A00]/10">
                    <item.icon className="h-6 w-6 text-[#FF7A00]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                      {item.description}
                    </p>

                    <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#FF7A00]">
                      Take Action
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <motion.button
                whileTap={{ scale: 0.97 }}
                key={action.title}
                className="rounded-[2rem] border border-white/5 bg-[#121212] p-5 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1A1A]">
                  <action.icon className="h-5 w-5 text-[#FF7A00]" />
                </div>

                <p className="mt-4 text-sm font-bold leading-snug">
                  {action.title}
                </p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* MERCHANTS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Merchant Portfolio
            </h2>

            <button className="text-sm font-semibold text-[#FF7A00]">
              Manage
            </button>
          </div>

          <div className="space-y-4">
            {merchants.map((merchant) => (
              <motion.div
                whileTap={{ scale: 0.985 }}
                key={merchant.name}
                className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-[#FF7A00]" />

                      <p className="text-lg font-black">
                        {merchant.name}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <span>{merchant.category}</span>

                      <span>•</span>

                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />

                        <span>{merchant.area}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      merchant.health === "good"
                        ? "bg-[#00E5A8]/10 text-[#00E5A8]"
                        : "bg-[#FF7A00]/10 text-[#FFB067]"
                    }`}
                  >
                    {merchant.revenue}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#1A1A1A] p-4">
                  <div className="flex items-center gap-2">
                    {merchant.health === "good" ? (
                      <TrendingUp className="h-4 w-4 text-[#00E5A8]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[#FF7A00]" />
                    )}

                    <p className="text-sm font-semibold">
                      {merchant.alert}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button className="flex-1 rounded-2xl bg-[#FF7A00] py-3 text-sm font-black text-black">
                    Create Offer
                  </button>

                  <button className="flex items-center justify-center rounded-2xl border border-white/10 bg-[#1A1A1A] px-5">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIVE OPS */}
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-[#FF7A00]" />

            <h2 className="text-2xl font-black">
              Live Operations
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            {[
              "12 reservations in the last hour",
              "Burger Factory promo almost sold out",
              "Pocitos Coffee traffic increasing",
              "2 merchants need occupancy boost",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl bg-[#1A1A1A] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#00E5A8]" />

                  <p className="text-sm font-medium">
                    {item}
                  </p>
                </div>

                <span className="text-xs text-[#6B7280]">
                  now
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CITY INSIGHTS */}
        <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
          <div className="border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-[#FF7A00]" />

              <h2 className="text-2xl font-black">
                City Spending Intelligence
              </h2>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <InsightRow
              area="Pocitos"
              growth="+24%"
              status="Strong dinner traffic"
            />

            <InsightRow
              area="Centro"
              growth="+18%"
              status="Lunch deals trending"
            />

            <InsightRow
              area="Cordón"
              growth="-8%"
              status="Weak Thursday occupancy"
            />
          </div>
        </section>
      </main>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/90 backdrop-blur-2xl">
        <div className="grid grid-cols-5 px-2 py-3">
          {[
            {
              label: "Dashboard",
              icon: BarChart3,
              active: true,
            },
            {
              label: "Merchants",
              icon: Briefcase,
            },
            {
              label: "Offers",
              icon: Megaphone,
            },
            {
              label: "Insights",
              icon: CalendarDays,
            },
            {
              label: "Profile",
              icon: Store,
            },
          ].map((item) => (
            <Link
              href="#"
              key={item.label}
              className="flex flex-col items-center gap-1 py-2"
            >
              <item.icon
                className={`h-5 w-5 ${
                  item.active
                    ? "text-[#FF7A00]"
                    : "text-[#6B7280]"
                }`}
              />

              <span
                className={`text-[11px] ${
                  item.active
                    ? "font-bold text-white"
                    : "text-[#6B7280]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  positive,
  warning,
}: {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/5 bg-black/30 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black ${
          positive
            ? "text-[#00E5A8]"
            : warning
            ? "text-[#FFB067]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InsightRow({
  area,
  growth,
  status,
}: {
  area: string;
  growth: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#1A1A1A] p-4">
      <div>
        <p className="font-bold">{area}</p>

        <p className="mt-1 text-sm text-[#9CA3AF]">
          {status}
        </p>
      </div>

      <div className="rounded-full bg-[#00E5A8]/10 px-3 py-1 text-sm font-bold text-[#00E5A8]">
        {growth}
      </div>
    </div>
  );
}