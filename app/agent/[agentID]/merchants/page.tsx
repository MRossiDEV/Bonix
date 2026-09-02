"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  ArrowUpRight,
  AlertTriangle,
  Building2,
  Calendar,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Target,
  Plus,
} from "lucide-react";

type AgentMerchantSummary = {
  id: number;
  name: string;
  neighborhood: string;
  health: number;
  revenueImpact: number;
  growth: number;
  trafficBoost: number;
  activePrograms: number;
  status: "healthy" | "attention";
};

export default function AgentMerchantsPage() {
  const merchants: AgentMerchantSummary[] = [
    {
      id: 1,
      name: "Burger Lab",
      neighborhood: "Pocitos",
      health: 92,
      revenueImpact: 38400,
      growth: 18,
      trafficBoost: 27,
      activePrograms: 2,
      status: "healthy",
    },
    {
      id: 2,
      name: "Cafe Corner",
      neighborhood: "Centro",
      health: 63,
      revenueImpact: 11200,
      growth: -6,
      trafficBoost: 8,
      activePrograms: 1,
      status: "attention",
    },
    {
      id: 3,
      name: "Pizza House",
      neighborhood: "Cordón",
      health: 84,
      revenueImpact: 27600,
      growth: 12,
      trafficBoost: 19,
      activePrograms: 3,
      status: "healthy",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white pb-28">
      {/* HEADER */}

      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0B0B]/90 backdrop-blur-xl">
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
            Agent Portal
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">
                Smart Spending Partners
              </h1>

              <p className="mt-2 text-sm text-[#9CA3AF]">
                Businesses you help keep busy all month long.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-2xl bg-[#FF7A00] px-4 py-3 text-sm font-black text-black">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* KPI GRID */}

        <section className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Building2 className="h-5 w-5" />}
            value="10"
            label="Partner Businesses"
          />

          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            value="$420K"
            label="Revenue Influenced"
          />

          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value="+14%"
            label="Traffic Growth"
          />

          <StatCard
            icon={<Target className="h-5 w-5" />}
            value="82"
            label="Portfolio Health"
          />
        </section>

        {/* ATTENTION REQUIRED */}

        <section className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />

            <h2 className="font-black">
              Businesses Needing Attention
            </h2>
          </div>

          <p className="mt-3 text-sm text-[#9CA3AF]">
            2 partners show declining late-month traffic.
          </p>

          <button className="mt-4 flex w-full items-center justify-between rounded-2xl bg-black/30 px-4 py-4">
            Review Opportunities

            <ChevronRight className="h-5 w-5" />
          </button>
        </section>

        {/* MONTH CYCLE */}

        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#FF7A00]" />

            <h2 className="font-black">
              Monthly Spending Cycle
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            <CycleCard
              week="Week 1"
              status="Strong"
            />

            <CycleCard
              week="Week 2"
              status="Stable"
            />

            <CycleCard
              week="Week 3"
              status="Slowing"
            />

            <CycleCard
              week="Week 4"
              status="Opportunity"
              highlight
            />
          </div>
        </section>

        {/* PARTNERS */}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Partner Businesses
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

        {/* REVENUE OPPORTUNITIES */}

        <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-5">
          <h2 className="font-black">
            Revenue Opportunities
          </h2>

          <div className="mt-4 space-y-3">
            <OpportunityCard
              title="Burger Lab"
              recommendation="Launch Week 4 Lunch Booster"
              impact="+$7,200 estimated revenue"
            />

            <OpportunityCard
              title="Cafe Corner"
              recommendation="After Office Smart Spending Program"
              impact="+15% projected traffic"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
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
      whileTap={{ scale: 0.98 }}
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
  merchant: AgentMerchantSummary;
}) {
  const healthy =
    merchant.status === "healthy";

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-black">
            {merchant.name}
          </h3>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            {merchant.neighborhood}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-2 text-xs font-bold ${
            healthy
              ? "bg-[#00E5A8]/15 text-[#00E5A8]"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {healthy
            ? "Healthy"
            : "Needs Attention"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Metric
          label="Revenue Impact"
          value={`$${merchant.revenueImpact.toLocaleString()}`}
        />

        <Metric
          label="Traffic Growth"
          value={`+${merchant.trafficBoost}%`}
        />

        <Metric
          label="Growth"
          value={`${merchant.growth}%`}
        />

        <Metric
          label="Programs"
          value={`${merchant.activePrograms}`}
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#9CA3AF]">
            Business Health
          </span>

          <span className="font-black">
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

      <Link
        href={`/agent/merchants/${merchant.id}`}
        className="mt-5 flex items-center justify-between rounded-2xl bg-black/30 px-4 py-4"
      >
        <span className="font-semibold">
          Manage Business
        </span>

        <ArrowUpRight className="h-5 w-5 text-[#9CA3AF]" />
      </Link>
    </motion.div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-[#6B7280]">
        {label}
      </p>

      <p className="mt-1 font-black">
        {value}
      </p>
    </div>
  );
}

function CycleCard({
  week,
  status,
  highlight,
}: {
  week: string;
  status: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        highlight
          ? "border border-[#FF7A00]/30 bg-[#FF7A00]/10"
          : "bg-black/30"
      }`}
    >
      <p className="text-xs text-[#9CA3AF]">
        {week}
      </p>

      <p className="mt-2 text-sm font-bold">
        {status}
      </p>
    </div>
  );
}

function OpportunityCard({
  title,
  recommendation,
  impact,
}: {
  title: string;
  recommendation: string;
  impact: string;
}) {
  return (
    <div className="rounded-2xl bg-black/30 p-4">
      <p className="font-bold">
        {title}
      </p>

      <p className="mt-2 text-sm text-[#9CA3AF]">
        {recommendation}
      </p>

      <p className="mt-3 text-sm font-bold text-[#FFB067]">
        {impact}
      </p>
    </div>
  );
}