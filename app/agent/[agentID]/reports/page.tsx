"use client";

import { motion } from "framer-motion";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Store,
  AlertTriangle,
  Target,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function AgentReportsPage() {
  const merchants = [
    {
      id: 1,
      name: "Burger Lab",
      revenue: "$24,500",
      growth: "+18%",
      health: 92,
    },
    {
      id: 2,
      name: "Cafe Corner",
      revenue: "$13,200",
      growth: "-7%",
      health: 61,
    },
    {
      id: 3,
      name: "Pizza House",
      revenue: "$18,900",
      growth: "+11%",
      health: 81,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-28 text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0B0B]/90 px-5 py-4 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
          Agent Analytics
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Reports & Stats
        </h1>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* KPI SECTION */}

        <section className="grid grid-cols-2 gap-4">
          <KpiCard
            icon={<DollarSign />}
            value="$56,600"
            label="Merchant Revenue"
          />

          <KpiCard
            icon={<Target />}
            value="432"
            label="Redemptions"
          />

          <KpiCard
            icon={<TrendingUp />}
            value="+12%"
            label="Growth"
          />

          <KpiCard
            icon={<Store />}
            value="10"
            label="Managed Merchants"
          />
        </section>

        {/* ATTENTION SECTION */}

        <section className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />

            <h2 className="font-black">
              Needs Attention
            </h2>
          </div>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            2 merchants are underperforming this week.
          </p>

          <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-black/30 px-4 py-4">
            View Opportunities

            <ChevronRight className="h-5 w-5" />
          </button>
        </section>

        {/* SALES IMPACT */}

        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h2 className="text-lg font-black">
            BONIX Revenue Impact
          </h2>

          <div className="mt-5 space-y-5">
            <MetricRow
              label="Revenue Generated"
              value="$56,600"
            />

            <MetricRow
              label="Estimated Lost Revenue Prevented"
              value="$9,800"
            />

            <MetricRow
              label="Offers Created"
              value="43"
            />

            <MetricRow
              label="Offer Success Rate"
              value="78%"
            />
          </div>
        </section>

        {/* MERCHANT PERFORMANCE */}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">
              Merchant Performance
            </h2>

            <button className="text-sm text-[#9CA3AF]">
              View All
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
              />
            ))}
          </div>
        </section>

        {/* LATE MONTH SECTION */}

        <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#FF7A00]" />

            <h2 className="font-black">
              End-of-Month Forecast
            </h2>
          </div>

          <p className="mt-3 text-sm text-[#9CA3AF]">
            Sales are projected to drop
            16% during the last week of
            the month.
          </p>

          <div className="mt-4 rounded-2xl bg-black/30 p-4">
            <p className="text-sm font-bold text-[#FFB067]">
              Recommended Action
            </p>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              Launch 3 Lunch Rescue Offers
              and 2 Happy Hour campaigns.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-4"
    >
      <div className="text-[#FF7A00]">
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#9CA3AF]">
        {label}
      </p>
    </motion.div>
  );
}

function MerchantCard({
  merchant,
}: {
  merchant: {
    name: string;
    revenue: string;
    growth: string;
    health: number;
  };
}) {
  const positive =
    merchant.growth.includes("+");

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black">
            {merchant.name}
          </h3>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Revenue {merchant.revenue}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${
            positive
              ? "bg-[#00E5A8]/15 text-[#00E5A8]"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {positive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}

          {merchant.growth}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#9CA3AF]">
            Health Score
          </span>

          <span className="font-bold">
            {merchant.health}/100
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full rounded-full bg-[#FF7A00]"
            style={{
              width: `${merchant.health}%`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#9CA3AF]">
        {label}
      </span>

      <span className="font-black">
        {value}
      </span>
    </div>
  );
}