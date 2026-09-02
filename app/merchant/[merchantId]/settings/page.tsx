"use client";

import {
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Globe,
  Lock,
  LogOut,
  Shield,
  Smartphone,
  Users,
} from "lucide-react";

export default function MerchantSettingsPage() {
  const sections = [
    {
      title: "Business",
      items: [
        {
          icon: Building2,
          label: "Business Information",
          description:
            "Name, logo, address and public profile",
        },
        {
          icon: Globe,
          label: "Public BONIX Profile",
          description:
            "How customers see your business",
        },
      ],
    },

    {
      title: "Operations",
      items: [
        {
          icon: Users,
          label: "Staff Permissions",
          description:
            "Control employee QR access",
        },
        {
          icon: Smartphone,
          label: "Scanner Devices",
          description:
            "Manage authorized QR scanners",
        },
      ],
    },

    {
      title: "Payments",
      items: [
        {
          icon: CreditCard,
          label: "Payout Account",
          description:
            "Bank account and settlements",
        },
      ],
    },

    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Notification Preferences",
          description:
            "Critical alerts and activity updates",
        },
      ],
    },

    {
      title: "Security",
      items: [
        {
          icon: Shield,
          label: "Security Settings",
          description:
            "Login protection and sessions",
        },
        {
          icon: Lock,
          label: "Password",
          description:
            "Update account password",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/90 backdrop-blur-xl">
        <div className="px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6B7280]">
            Merchant Settings
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Settings
          </h1>

          <p className="mt-1 text-sm text-[#9CA3AF]">
            Manage your BONIX business account.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]"
          >
            <div className="border-b border-white/5 px-5 py-4">
              <h2 className="font-black">
                {section.title}
              </h2>
            </div>

            <div>
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A1A1A]">
                        <Icon className="h-5 w-5 text-[#FF7A00]" />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {item.label}
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
        ))}

        {/* ACCOUNT */}

        <div className="overflow-hidden rounded-[2rem] border border-red-500/10 bg-[#121212]">
          <button className="flex w-full items-center justify-between px-5 py-5 text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>

              <div>
                <p className="font-semibold text-red-400">
                  Sign Out
                </p>

                <p className="text-xs text-[#9CA3AF]">
                  Exit merchant account
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-[#6B7280]" />
          </button>
        </div>
      </div>
    </div>
  );
}