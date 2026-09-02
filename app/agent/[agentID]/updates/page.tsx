"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";

export default function AgentUpdatesPage() {
  const requiredActions = [
    {
      title: "Updated Merchant Approval Policy",
      due: "Required before June 30",
    },
    {
      title: "New Fraud Prevention Guidelines",
      due: "Required this week",
    },
  ];

  const updates = [
    {
      title: "Family Weekend Smart Plan Released",
      description:
        "New traffic recovery plan designed for family-oriented businesses.",
    },
    {
      title: "QR Validation Flow Updated",
      description:
        "Faster redemption process with fewer merchant steps.",
    },
    {
      title: "Merchant Profile Improvements",
      description:
        "Businesses can now upload multiple storefront images.",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">
          BONIX Updates
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Platform Updates
        </h1>

        <p className="mt-3 text-sm text-[#9CA3AF]">
          Important announcements, required actions,
          new features and platform communications.
        </p>
      </section>

      {/* Required Actions */}

      <section className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-400" />

          <h2 className="text-xl font-black">
            Required Actions
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {requiredActions.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl bg-[#121212] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    {item.due}
                  </p>
                </div>

                <button className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black">
                  Review
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Platform News */}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Latest News
          </h2>
        </div>

        {updates.map((update) => (
          <article
            key={update.title}
            className="rounded-[2rem] border border-white/5 bg-[#121212] p-5"
          >
            <h3 className="font-bold">
              {update.title}
            </h3>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              {update.description}
            </p>

            <button className="mt-4 flex items-center gap-2 text-sm font-bold text-[#FF7A00]">
              Read More
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </section>

      {/* New Smart Plans */}

      <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            New Smart Plans
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-[#121212] p-4">
            <h3 className="font-bold">
              Family Weekend Plan
            </h3>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              Designed to increase family traffic on
              weekends.
            </p>
          </div>

          <div className="rounded-2xl bg-[#121212] p-4">
            <h3 className="font-bold">
              End Of Month Booster 2.0
            </h3>

            <p className="mt-2 text-sm text-[#9CA3AF]">
              Improved recommendations for late-month
              spending.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance */}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            Compliance Center
          </h2>
        </div>

        {[
          "Terms & Conditions Update",
          "Privacy Policy Update",
          "Merchant Data Guidelines",
        ].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#121212] p-4"
          >
            <span>{item}</span>

            <CheckCircle2 className="text-[#00E5A8]" />
          </div>
        ))}
      </section>

      {/* System Status */}

      <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-6">
        <div className="flex items-center gap-3">
          <Wrench className="text-[#FF7A00]" />

          <h2 className="text-xl font-black">
            System Status
          </h2>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span>Platform Health</span>

          <span className="font-black text-[#00E5A8]">
            Operational
          </span>
        </div>
      </section>
    </div>
  );
}