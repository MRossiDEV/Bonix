"use client";

import {
  AlertCircle,
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Headphones,
  MessageCircle,
  QrCode,
  User,
} from "lucide-react";

export default function MerchantSupportPage() {
  const quickHelp = [
    {
      icon: QrCode,
      title: "QR Scanner Issues",
      description:
        "Problems validating Smart Plan redemptions",
      priority: true,
    },

    {
      icon: CreditCard,
      title: "Payments & Settlements",
      description:
        "Questions about payouts and balances",
    },

    {
      icon: User,
      title: "Staff Access",
      description:
        "Employees, permissions and scanners",
    },

    {
      icon: Building2,
      title: "Business Profile",
      description:
        "Update public business information",
    },

    {
      icon: Bell,
      title: "Notifications",
      description:
        "Alerts, reminders and activity updates",
    },

    {
      icon: AlertCircle,
      title: "Report a Problem",
      description:
        "Something isn't working correctly",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/90 backdrop-blur-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6B7280]">
            Merchant Support
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Support Center
          </h1>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Get help and keep your business running smoothly.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        {/* AGENT CARD */}

        <div className="overflow-hidden rounded-[2rem] border border-[#FF7A00]/20 bg-gradient-to-br from-[#FF7A00]/10 to-transparent">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A00] text-xl font-black text-black">
                A
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#FFB067]">
                  Assigned Agent
                </p>

                <h2 className="text-xl font-black">
                  Ana Rodríguez
                </h2>

                <p className="text-sm text-[#D1D5DB]">
                  Merchant Success Specialist
                </p>
              </div>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF7A00] px-4 py-4 font-black text-black">
              <MessageCircle className="h-5 w-5" />
              Contact My Agent
            </button>
          </div>
        </div>

        {/* PRIORITY SUPPORT */}

        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="font-black">
              Quick Help
            </h2>
          </div>

          <div>
            {quickHelp.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        item.priority
                          ? "bg-[#FF7A00]/15"
                          : "bg-[#1A1A1A]"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          item.priority
                            ? "text-[#FF7A00]"
                            : "text-[#9CA3AF]"
                        }`}
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        {item.title}
                      </p>

                      <p className="text-xs text-[#9CA3AF]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                </button>
              );
            })}
          </div>
        </div>

        {/* KNOWLEDGE BASE */}

        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
          <div className="px-5 py-4">
            <h2 className="font-black">
              BONIX Guides
            </h2>

            <p className="mt-1 text-sm text-[#9CA3AF]">
              Learn how to maximize Smart Spending results.
            </p>
          </div>

          <div className="space-y-3 px-5 pb-5">
            {[
              "How QR redemption works",
              "Creating better Smart Plans",
              "Increasing weekday traffic",
              "Understanding BONIX reports",
            ].map((guide) => (
              <button
                key={guide}
                className="flex w-full items-center justify-between rounded-2xl bg-[#1A1A1A] px-4 py-4 text-left"
              >
                <span>{guide}</span>

                <ChevronRight className="h-5 w-5 text-[#6B7280]" />
              </button>
            ))}
          </div>
        </div>

        {/* EMERGENCY */}

        <div className="rounded-[2rem] border border-red-500/10 bg-red-500/5 p-5">
          <div className="flex items-center gap-3">
            <Headphones className="h-6 w-6 text-red-400" />

            <div>
              <h3 className="font-black text-red-400">
                Urgent Business Issue
              </h3>

              <p className="text-sm text-[#9CA3AF]">
                QR system unavailable or critical operational problem.
              </p>
            </div>
          </div>

          <button className="mt-4 w-full rounded-2xl border border-red-500/20 py-4 font-bold text-red-400">
            Request Priority Support
          </button>
        </div>
      </div>
    </div>
  );
}