"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Clock3,
  Plus,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { useParams } from "next/navigation";



export default function MerchantDashboardPage() {

  const merchantId = useParams().merchantId as string;
  const metrics = [
    {
      title: "Extra Revenue This Month",
      value: "$18,450",
      icon: Wallet,
      change: "+18%",
    },
    {
      title: "BONIX Customers",
      value: "312",
      icon: Users,
      change: "+26%",
    },
    {
      title: "Recovered Slow Days",
      value: "11",
      icon: CalendarDays,
      change: "+4",
    },
    {
      title: "Smart Spending Visits",
      value: "642",
      icon: TrendingUp,
      change: "+31%",
    },
  ];

  const activePlans = [
    {
      title: "Lunch Smart Spending",
      schedule: "Mon-Fri • 12:00 - 15:00",
      discount: "15%",
      visits: 142,
      revenue: "$8,900",
      status: "Performing Well",
    },
    {
      title: "End Of Month Booster",
      schedule: "Days 21-30",
      discount: "30%",
      visits: 91,
      revenue: "$5,120",
      status: "High Demand",
    },
    {
      title: "Happy Hour Accelerator",
      schedule: "18:00 - 20:00",
      discount: "20%",
      visits: 79,
      revenue: "$4,430",
      status: "Growing",
    },
  ];

  const insights = [
    {
      title: "Thursday has unused capacity",
      description:
        "Traffic drops 27% after 18:00. Create a Smart Spending Plan to fill tables.",
    },
    {
      title: "Customers spend more than expected",
      description:
        "BONIX users spend 23% above discounted value on average.",
    },
    {
      title: "Month-end demand opportunity",
      description:
        "Traffic increases significantly when savings reach 25%+ after day 20.",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#6B7280]">
              BONIX Revenue Center
            </p>

            <h1 className="mt-3 text-3xl font-black text-white">
              Smart Spending Dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm text-[#9CA3AF]">
              Increase customer visits throughout the month while
              maintaining healthy cashflow and occupancy.
            </p>
          </div>

          <Link
            href={`/merchant/${merchantId}/plans/new`}
            className="flex items-center gap-2 rounded-2xl bg-[#FF7A00] px-5 py-3 text-sm font-black text-black"
          >
            <Plus size={18} />
            New Plan
          </Link>
        </div>
      </section>

      {/* METRICS */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-6 w-6 text-[#FF7A00]" />

                <span className="text-sm font-bold text-[#00E5A8]">
                  {metric.change}
                </span>
              </div>

              <p className="mt-4 text-3xl font-black text-white">
                {metric.value}
              </p>

              <p className="mt-1 text-sm text-[#9CA3AF]">
                {metric.title}
              </p>
            </div>
          );
        })}
      </section>

      {/* ACTIVE PLANS */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">
              Active Smart Spending Plans
            </h2>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              Revenue-driving campaigns managed by your BONIX Agent.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {activePlans.map((plan) => (
            <div
              key={plan.title}
              className="rounded-2xl border border-white/5 bg-black/30 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {plan.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    {plan.schedule}
                  </p>
                </div>

                <span className="rounded-full bg-[#00E5A8]/10 px-3 py-1 text-xs font-bold text-[#00E5A8]">
                  {plan.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280]">
                    Savings
                  </p>

                  <p className="mt-1 font-black">
                    {plan.discount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6B7280]">
                    Visits
                  </p>

                  <p className="mt-1 font-black">
                    {plan.visits}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6B7280]">
                    Revenue
                  </p>

                  <p className="mt-1 font-black">
                    {plan.revenue}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI INSIGHTS */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Smart Spending Insights
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-2xl border border-white/5 bg-black/30 p-5"
            >
              <h3 className="font-bold">
                {insight.title}
              </h3>

              <p className="mt-2 text-sm text-[#9CA3AF]">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS */}

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/merchant/plans"
          className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
        >
          <Clock3 className="h-6 w-6 text-[#FF7A00]" />

          <h3 className="mt-4 font-bold">
            Manage Plans
          </h3>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Control schedules, savings levels and traffic goals.
          </p>
        </Link>

        <Link
          href="/merchant/customers"
          className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
        >
          <Users className="h-6 w-6 text-[#FF7A00]" />

          <h3 className="mt-4 font-bold">
            Customer Insights
          </h3>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Understand spending behavior and retention.
          </p>
        </Link>

        <Link
          href="/merchant/reports"
          className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
        >
          <Banknote className="h-6 w-6 text-[#FF7A00]" />

          <h3 className="mt-4 font-bold">
            Revenue Reports
          </h3>

          <p className="mt-2 text-sm text-[#9CA3AF]">
            Track recovered revenue and cashflow growth.
          </p>
        </Link>
      </section>
    </div>
  );
}