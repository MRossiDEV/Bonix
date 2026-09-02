"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import {
  Plus,
  Clock3,
  Flame,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Store,
} from "lucide-react";

type Offer = {
  id: string;
  title: string;
  merchant: string;
  discount: number;
  claims: number;
  expiresIn: string;
  status: "ACTIVE" | "LOW_PERFORMING" | "EXPIRING";
};

export default function AgentOffersPage() {
  const offers: Offer[] = [
    {
      id: "1",
      title: "2x1 Smash Burgers",
      merchant: "Burger Lab",
      discount: 30,
      claims: 42,
      expiresIn: "2 days",
      status: "ACTIVE",
    },
    {
      id: "2",
      title: "Late Month Lunch",
      merchant: "Bistro 21",
      discount: 25,
      claims: 8,
      expiresIn: "5 days",
      status: "LOW_PERFORMING",
    },
    {
      id: "3",
      title: "Coffee + Croissant",
      merchant: "Cafe Corner",
      discount: 20,
      claims: 17,
      expiresIn: "6h",
      status: "EXPIRING",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] pb-28 text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-20 border-b border-white/5 bg-[#0B0B0B]/90 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#6B7280]">
              Agent
            </p>

            <h1 className="mt-1 text-2xl font-black">
              Offers
            </h1>
          </div>

          <Link
            href="/agent/offers/new"
            className="flex items-center gap-2 rounded-2xl bg-[#FF7A00] px-4 py-3 text-sm font-black text-black"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5">
        {/* KPI CARDS */}

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            value="28"
            label="Active"
          />

          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            value="146"
            label="Claims"
          />

          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            value="3"
            label="Need Attention"
          />

          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            value="4"
            label="Expiring"
          />
        </div>

        {/* SECTION */}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">
            Active Offers
          </h2>

          <button className="text-sm text-[#9CA3AF]">
            Filter
          </button>
        </div>

        {/* OFFERS */}

        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
            />
          ))}
        </div>

        {/* QUICK ACTIONS */}

        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <h3 className="text-lg font-black">
            Quick Actions
          </h3>

          <div className="mt-4 space-y-3">
            <ActionButton
              title="Create Late-Month Offer"
            />

            <ActionButton
              title="Duplicate Top Performer"
            />

            <ActionButton
              title="Review Expiring Offers"
            />

            <ActionButton
              title="Merchant Suggestions"
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
    <div className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-4">
      <div className="text-[#FF7A00]">
        {icon}
      </div>

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#9CA3AF]">
        {label}
      </p>
    </div>
  );
}

function OfferCard({
  offer,
}: {
  offer: Offer;
}) {
  const statusColor =
    offer.status === "LOW_PERFORMING"
      ? "bg-yellow-500/15 text-yellow-400"
      : offer.status === "EXPIRING"
      ? "bg-red-500/15 text-red-400"
      : "bg-[#00E5A8]/15 text-[#00E5A8]";

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#6B7280]" />

            <span className="text-xs text-[#9CA3AF]">
              {offer.merchant}
            </span>
          </div>

          <h3 className="mt-2 text-xl font-black">
            {offer.title}
          </h3>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}
        >
          {offer.status.replace("_", " ")}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Metric
          label="Discount"
          value={`${offer.discount}%`}
        />

        <Metric
          label="Claims"
          value={offer.claims.toString()}
        />

        <Metric
          label="Expires"
          value={offer.expiresIn}
        />
      </div>

      <Link
        href={`/agent/offers/${offer.id}`}
        className="mt-5 flex items-center justify-between rounded-2xl bg-black/40 px-4 py-3"
      >
        <span className="font-semibold">
          Manage Offer
        </span>

        <ChevronRight className="h-5 w-5 text-[#9CA3AF]" />
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

function ActionButton({
  title,
}: {
  title: string;
}) {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-black/30 px-4 py-4">
      <span className="font-semibold">
        {title}
      </span>

      <ChevronRight className="h-5 w-5 text-[#6B7280]" />
    </button>
  );
}