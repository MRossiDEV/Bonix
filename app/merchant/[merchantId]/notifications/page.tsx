"use client";

import {
  Bell,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "plan",
    title: "Smart Plan reaching full capacity",
    description:
      "Lunch Combo has only 4 redemptions remaining.",
    time: "10 min ago",
    priority: "high",
  },
  {
    id: 2,
    type: "agent",
    title: "Agent recommendation available",
    description:
      "Increase Week 4 savings to improve month-end traffic.",
    time: "1 hour ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "performance",
    title: "Traffic increased today",
    description:
      "You received 28% more visits than yesterday.",
    time: "3 hours ago",
    priority: "low",
  },
  {
    id: 4,
    type: "success",
    title: "Smart Plan performing above average",
    description:
      "Burger Night generated 19 redemptions this week.",
    time: "Yesterday",
    priority: "low",
  },
  {
    id: 5,
    type: "warning",
    title: "Plan expires soon",
    description:
      "Coffee Break Smart Plan ends in 2 days.",
    time: "Yesterday",
    priority: "high",
  },
];

function getNotificationStyle(type: string) {
  switch (type) {
    case "warning":
      return {
        icon: AlertTriangle,
        iconColor: "text-[#FF7A00]",
        bg: "bg-[#FF7A00]/10",
      };

    case "success":
      return {
        icon: CheckCircle2,
        iconColor: "text-[#00E5A8]",
        bg: "bg-[#00E5A8]/10",
      };

    case "performance":
      return {
        icon: TrendingUp,
        iconColor: "text-[#7B61FF]",
        bg: "bg-[#7B61FF]/10",
      };

    case "agent":
      return {
        icon: Sparkles,
        iconColor: "text-[#FFD166]",
        bg: "bg-[#FFD166]/10",
      };

    default:
      return {
        icon: Bell,
        iconColor: "text-[#9CA3AF]",
        bg: "bg-[#2A2A2A]",
      };
  }
}

export default function MerchantNotificationsPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* HEADER */}

      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0B0B]/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-black">
          Alerts & Notifications
        </h1>

        <p className="mt-1 text-sm text-[#9CA3AF]">
          Important updates about your business.
        </p>
      </div>

      {/* PRIORITY CARD */}

      <div className="px-5 pt-5">
        <div className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/10 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-[#FF7A00]" />

            <div>
              <p className="font-bold">
                Immediate attention needed
              </p>

              <p className="text-sm text-[#D1D5DB]">
                2 Smart Plans require action.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}

      <div className="space-y-4 px-5 py-5">
        {notifications.map((item) => {
          const style =
            getNotificationStyle(item.type);

          const Icon = style.icon;

          return (
            <button
              key={item.id}
              className="w-full rounded-[2rem] border border-white/5 bg-[#121212] p-5 text-left transition-all hover:border-[#FF7A00]/20"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg}`}
                >
                  <Icon
                    className={`h-5 w-5 ${style.iconColor}`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#9CA3AF]">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-[#6B7280]" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-[#6B7280]">
                      {item.time}
                    </span>

                    {item.priority === "high" && (
                      <span className="rounded-full bg-[#FF7A00]/15 px-3 py-1 text-xs font-bold text-[#FFB067]">
                        Action Required
                      </span>
                    )}

                    {item.priority === "medium" && (
                      <span className="rounded-full bg-[#FFD166]/15 px-3 py-1 text-xs font-bold text-[#FFD166]">
                        Recommendation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* EMPTY STATE EXAMPLE */}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <Bell className="h-12 w-12 text-[#374151]" />

          <h2 className="mt-5 text-lg font-bold">
            You&apos;re all caught up
          </h2>

          <p className="mt-2 max-w-xs text-sm text-[#9CA3AF]">
            No important alerts right now.
            We&apos;ll notify you when action is needed.
          </p>
        </div>
      )}
    </div>
  );
}