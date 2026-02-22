import Link from "next/link";

type AtAGlanceMetric = {
  label: string;
  value: string;
  hint: string;
  tone?: "alert" | "warn" | "ok";
};

type WidgetLink = {
  label: string;
  value: string;
  href: string;
  helper: string;
};

export default async function AdminDashboardPage({
  params,
}: Readonly<{ params: Promise<{ adminID: string }> }>) {
  const { adminID } = await params;
  const basePath = `/admin/${adminID}`;

  const atAGlance: AtAGlanceMetric[] = [
    {
      label: "Pending approvals",
      value: "14",
      hint: "5 users, 7 merchants, 2 agents",
      tone: "alert",
    },
    {
      label: "Active promos right now",
      value: "184",
      hint: "73 in peak hours",
      tone: "ok",
    },
    {
      label: "Promos expiring soon",
      value: "9",
      hint: "Next 72 hours",
      tone: "warn",
    },
    {
      label: "Reported promos or users",
      value: "3",
      hint: "Needs review",
      tone: "alert",
    },
    {
      label: "Claims today",
      value: "128",
      hint: "+8% vs yesterday",
      tone: "ok",
    },
    {
      label: "Claims last 7 days",
      value: "824",
      hint: "Stable week",
      tone: "ok",
    },
  ];

  const widgetLinks: WidgetLink[] = [
    {
      label: "Merchants waiting approval",
      value: "5",
      href: `${basePath}/merchants`,
      helper: "Review KYC and activate",
    },
    {
      label: "Promos flagged",
      value: "3",
      href: `${basePath}/promos`,
      helper: "Resolve safety checks",
    },
    {
      label: "Top performing promo today",
      value: "City Bites 2-for-1",
      href: `${basePath}/promos`,
      helper: "32 claims in 4 hours",
    },
    {
      label: "System health",
      value: "OK",
      href: `${basePath}/system`,
      helper: "All services green",
    },
  ];

  const approvalQueue = [
    { label: "Users", count: "5", href: `${basePath}/users` },
    { label: "Merchants", count: "7", href: `${basePath}/merchants` },
    { label: "Agents", count: "2", href: `${basePath}/agents` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
          Operational dashboard
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Welcome back, Admin {adminID}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Keep the marketplace moving. Approve, resolve, and act fast.
        </p>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">At a glance</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
            Live
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {atAGlance.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                {item.label}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-semibold">{item.value}</p>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    item.tone === "alert"
                      ? "border-[#F97316]/40 text-[#F97316]"
                      : item.tone === "warn"
                        ? "border-[#FACC15]/40 text-[#FACC15]"
                        : "border-[#22C55E]/40 text-[#22C55E]"
                  }`}
                >
                  {item.tone === "alert"
                    ? "Action"
                    : item.tone === "warn"
                      ? "Soon"
                      : "Stable"}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#94A3B8]">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-lg font-semibold">Approval queue</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Pending approvals by role
          </p>
          <div className="mt-4 space-y-3">
            {approvalQueue.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
              >
                <span className="text-[#94A3B8]">{item.label}</span>
                <span className="text-lg font-semibold text-[#F8FAFC]">
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-lg font-semibold">Claims pulse</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Today vs last 7 days
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                Claims today
              </p>
              <p className="mt-2 text-2xl font-semibold">128</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Peak: 12:00 - 2:00</p>
            </div>
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                Last 7 days
              </p>
              <p className="mt-2 text-2xl font-semibold">824</p>
              <p className="mt-1 text-sm text-[#94A3B8]">+3% week over week</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Actionable widgets</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
            Tap to open
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {widgetLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col gap-2 rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                  {item.label}
                </p>
                <span className="text-base font-semibold text-[#F8FAFC]">
                  {item.value}
                </span>
              </div>
              <p className="text-sm text-[#94A3B8]">{item.helper}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
