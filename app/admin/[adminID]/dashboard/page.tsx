export default function AdminDashboardPage({
  params,
}: Readonly<{ params: { adminID: string } }>) {
  const { adminID } = params;

  const highlights = [
    { label: "Active promos", value: "184" },
    { label: "Merchant approvals", value: "12" },
    { label: "User reports", value: "7" },
  ];

  const alerts = [
    "Cashback spike detected in downtown cluster",
    "3 merchants pending compliance review",
    "Promo redemptions trending +14% this week",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
          Admin overview
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Welcome back, Admin {adminID}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Monitor growth, compliance, and marketplace health.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Live alerts</h2>
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert}
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#94A3B8]"
            >
              {alert}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
