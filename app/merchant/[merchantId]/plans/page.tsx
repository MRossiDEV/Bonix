"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Plus,
  TrendingUp,
  Users,
  ArrowRight,
  Flame,
} from "lucide-react";

import { useParams } from "next/navigation";

export default function SmartPlansPage() {
  const params = useParams();

  const merchantID = params.id as string;
  
  const plans = [
    {
      id: 1,
      name: "End Of Month Booster",
      status: "Active",
      savings: "30%",
      visits: 126,
      revenue: "$14,320",
      schedule: "Days 21-30",
      goal: "Increase month-end traffic",
    },
    {
      id: 2,
      name: "Lunch Recovery Plan",
      status: "Active",
      savings: "15%",
      visits: 84,
      revenue: "$8,450",
      schedule: "Mon-Fri • 12:00 - 15:00",
      goal: "Fill lunch tables",
    },
    {
      id: 3,
      name: "Happy Hour Accelerator",
      status: "Draft",
      savings: "20%",
      visits: 0,
      revenue: "$0",
      schedule: "18:00 - 20:00",
      goal: "Increase beverage sales",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
              Revenue Optimization
            </p>

            <h1 className="mt-3 text-3xl font-black text-white">
              Smart Spending Plans
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-[#9CA3AF]">
              Create pricing windows that attract customers during
              slow periods while maintaining healthy revenue.
            </p>
          </div>

          <Link
            href="plans/new"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF7A00] px-5 py-3 text-sm font-black text-black"
          >
            <Plus size={18} />
            New Smart Plan
          </Link>
        </div>
      </section>

      {/* QUICK STATS */}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <TrendingUp className="h-6 w-6 text-[#FF7A00]" />

          <p className="mt-4 text-3xl font-black">3</p>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Active Plans
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <Users className="h-6 w-6 text-[#FF7A00]" />

          <p className="mt-4 text-3xl font-black">210</p>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Visits Generated
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <Flame className="h-6 w-6 text-[#FF7A00]" />

          <p className="mt-4 text-3xl font-black">$22K</p>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Revenue Generated
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <CalendarDays className="h-6 w-6 text-[#FF7A00]" />

          <p className="mt-4 text-3xl font-black">12</p>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Slow Days Recovered
          </p>
        </div>
      </section>

      {/* PERFORMANCE INSIGHT */}

      <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-1 h-5 w-5 text-[#FF7A00]" />

          <div>
            <h2 className="font-bold text-white">
              BONIX Insight
            </h2>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              Thursday traffic drops 28% after 18:00.
              A Smart Spending Plan during those hours could
              generate an estimated additional revenue of
              <span className="font-bold text-white">
                {" "}
                $8,400/month
              </span>.
            </p>
          </div>
        </div>
      </section>

      {/* ACTIVE PLANS */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-white">
            Active Plans
          </h2>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Revenue-generating plans currently running.
          </p>
        </div>

        {plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-[2rem] border border-white/5 bg-[#121212] p-6"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-white">
                    {plan.name}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      plan.status === "Active"
                        ? "bg-[#00E5A8]/10 text-[#00E5A8]"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#9CA3AF]">
                  {plan.goal}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-[#9CA3AF]">
                    <Clock3 size={14} />
                    {plan.schedule}
                  </div>

                  <div className="font-semibold text-[#FF7A00]">
                    Savings {plan.savings}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xs text-[#6B7280]">
                    Visits
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {plan.visits}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6B7280]">
                    Revenue
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {plan.revenue}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6B7280]">
                    Savings
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {plan.savings}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold">
                Edit Plan
              </button>

              <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold">
                View Analytics
              </button>

              <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold">
                Pause
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* SMART PLAN TEMPLATES */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">
              Recommended Templates
            </h2>

            <p className="mt-1 text-sm text-[#9CA3AF]">
              Fast-launch plans used by top-performing merchants.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "End Of Month Booster",
            "Lunch Recovery",
            "Happy Hour Accelerator",
          ].map((template) => (
            <div
              key={template}
              className="rounded-2xl border border-white/5 bg-black/30 p-5"
            >
              <h3 className="font-bold">{template}</h3>

              <p className="mt-2 text-sm text-[#9CA3AF]">
                Proven to increase traffic during low-demand periods.
              </p>

              <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#FF7A00]">
                Use Template
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}