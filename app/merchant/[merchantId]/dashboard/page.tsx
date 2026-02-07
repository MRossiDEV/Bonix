export default function MerchantDashboardPage() {
  const stats = [
    { label: "Gross sales", value: "$12,480", delta: "+8%" },
    { label: "Active promos", value: "6", delta: "2 scheduled" },
    { label: "Pending redemptions", value: "14", delta: "3 flagged" },
  ];

  const activity = [
    {
      title: "Lunch rush promo",
      time: "Today, 12:10",
      status: "Confirmed",
      amount: "$24.00",
    },
    {
      title: "Brunch special",
      time: "Today, 11:45",
      status: "Pending",
      amount: "$18.00",
    },
    {
      title: "Dinner combo",
      time: "Yesterday, 20:30",
      status: "Confirmed",
      amount: "$32.00",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">
          Merchant overview
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Your store at a glance
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Daily performance, promos, and redemption flow.
        </p>
      </section>

      <section className="grid gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#A1A1AA]">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <span className="text-xs text-[#4FD1C5]">{stat.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold">Recent redemptions</p>
        {activity.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-[#A1A1AA]">{item.time}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{item.amount}</p>
              <p
                className={`text-xs ${
                  item.status === "Confirmed"
                    ? "text-[#4FD1C5]"
                    : "text-[#F6AD55]"
                }`}
              >
                {item.status}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
