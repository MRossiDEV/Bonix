export default function MerchantPromosPage() {
  const promos = [
    {
      title: "Lunch rush menu",
      status: "Active",
      timeframe: "Today, 12:00 - 15:00",
      redemptions: "32 of 40",
    },
    {
      title: "Weekend brunch",
      status: "Scheduled",
      timeframe: "Sat, 10:00 - 13:00",
      redemptions: "0 of 60",
    },
    {
      title: "Late night bites",
      status: "Paused",
      timeframe: "Daily, 22:00 - 00:00",
      redemptions: "14 of 30",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">
              Promo manager
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Your promos</h1>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Create, schedule, and monitor live offers.
            </p>
          </div>
          <button
            type="button"
            className="rounded-2xl bg-[#FFB547] px-4 py-2 text-xs font-semibold text-[#111111]"
          >
            New promo
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {promos.map((promo) => (
          <div
            key={promo.title}
            className="rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{promo.title}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  promo.status === "Active"
                    ? "bg-[#4FD1C5]/20 text-[#4FD1C5]"
                    : promo.status === "Scheduled"
                    ? "bg-[#63B3ED]/20 text-[#63B3ED]"
                    : "bg-[#F6AD55]/20 text-[#F6AD55]"
                }`}
              >
                {promo.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#A1A1AA]">
              {promo.timeframe}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Redemptions</span>
              <span className="text-[#FAFAFA]">{promo.redemptions}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
