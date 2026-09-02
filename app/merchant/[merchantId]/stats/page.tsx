"use client";

import {
  TrendingUp,
  Wallet,
  Users,
  Sparkles,
  ArrowUpRight,
  Target,
  Lightbulb,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function MerchantInsightsPage() {
  const smartPlans = [
    {
      name: "Lunch Smart Plan",
      redemptions: 124,
      revenue: "$48,200",
      status: "Top Performer",
    },
    {
      name: "Coffee Break",
      redemptions: 76,
      revenue: "$18,900",
      status: "Growing",
    },
    {
      name: "Burger Night",
      redemptions: 42,
      revenue: "$13,400",
      status: "Needs Attention",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-black">
          Growth Insights
        </h1>

        <p className="mt-1 text-sm text-[#9CA3AF]">
          Understand what drives traffic,
          redemptions and revenue.
        </p>
      </div>

      {/* HERO */}

      <section className="px-5 pt-5">
        <div className="rounded-[2rem] border border-[#00E5A8]/20 bg-[#00E5A8]/10 p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-[#00E5A8]" />

            <div>
              <p className="text-sm text-[#D1D5DB]">
                This Month
              </p>

              <h2 className="text-2xl font-black">
                +18% Customer Traffic
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* KPI CARDS */}

      <section className="grid grid-cols-2 gap-4 px-5 pt-5">
        <div className="rounded-[2rem] bg-[#121212] p-5">
          <Wallet className="mb-3 h-6 w-6 text-[#FF7A00]" />

          <p className="text-xs text-[#9CA3AF]">
            Revenue Generated
          </p>

          <p className="mt-2 text-2xl font-black">
            $81,500
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#121212] p-5">
          <Users className="mb-3 h-6 w-6 text-[#7B61FF]" />

          <p className="text-xs text-[#9CA3AF]">
            Customers Reached
          </p>

          <p className="mt-2 text-2xl font-black">
            242
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#121212] p-5">
          <Sparkles className="mb-3 h-6 w-6 text-[#00E5A8]" />

          <p className="text-xs text-[#9CA3AF]">
            Smart Plan Uses
          </p>

          <p className="mt-2 text-2xl font-black">
            318
          </p>
        </div>

        <div className="rounded-[2rem] bg-[#121212] p-5">
          <Target className="mb-3 h-6 w-6 text-[#FFD166]" />

          <p className="text-xs text-[#9CA3AF]">
            Conversion Rate
          </p>

          <p className="mt-2 text-2xl font-black">
            67%
          </p>
        </div>
      </section>

      {/* BEST SMART PLANS */}

      <section className="px-5 pt-6">
        <h2 className="mb-4 text-lg font-bold">
          Smart Plan Performance
        </h2>

        <div className="space-y-4">
          {smartPlans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[2rem] bg-[#121212] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">
                    {plan.name}
                  </h3>

                  <p className="mt-2 text-sm text-[#9CA3AF]">
                    {plan.redemptions} redemptions
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-[#6B7280]" />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-black">
                  {plan.revenue}
                </span>

                <span className="rounded-full bg-[#1A1A1A] px-3 py-1 text-xs">
                  {plan.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BONIX RECOMMENDATIONS */}

      <section className="px-5 pt-6">
        <h2 className="mb-4 text-lg font-bold">
          BONIX Recommendations
        </h2>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/10 p-5">
            <div className="flex gap-3">
              <Lightbulb className="mt-1 h-5 w-5 text-[#FFB067]" />

              <div>
                <h3 className="font-bold">
                  Increase Tuesday traffic
                </h3>

                <p className="mt-2 text-sm text-[#D1D5DB]">
                  Your Tuesday visits are
                  34% lower than average.
                  Consider a Week 4 Smart
                  Plan.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#7B61FF]/20 bg-[#7B61FF]/10 p-5">
            <div className="flex gap-3">
              <ArrowUpRight className="mt-1 h-5 w-5 text-[#B5A6FF]" />

              <div>
                <h3 className="font-bold">
                  Expand your best seller
                </h3>

                <p className="mt-2 text-sm text-[#D1D5DB]">
                  Lunch Smart Plan is
                  outperforming all other
                  campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MONTH TIMELINE */}

      <section className="px-5 py-6">
        <h2 className="mb-4 text-lg font-bold">
          Month Progress
        </h2>

        <div className="rounded-[2rem] bg-[#121212] p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#FF7A00]" />

            <span className="font-semibold">
              Week 3 of current cycle
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#1A1A1A]">
            <div className="h-full w-[72%] rounded-full bg-[#FF7A00]" />
          </div>

          <p className="mt-3 text-sm text-[#9CA3AF]">
            Historically this is when
            Smart-Spending demand begins
            increasing.
          </p>
        </div>
      </section>
    </div>
  );
}