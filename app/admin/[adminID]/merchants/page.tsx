export default function AdminMerchantsPage() {
  const merchants = [
    { name: "La Rambla Tacos", status: "Verified", queue: "Live" },
    { name: "Mercado Verde", status: "Pending", queue: "Review" },
    { name: "Barrio Pasta", status: "Verified", queue: "Live" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Merchants</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Approvals, compliance, and marketplace coverage.
        </p>
      </section>

      <section className="space-y-4">
        {merchants.map((merchant) => (
          <article
            key={merchant.name}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{merchant.name}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Queue: {merchant.queue}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  merchant.status === "Pending"
                    ? "bg-[#F97316] text-[#0B0F14]"
                    : "bg-[#22C55E] text-[#0B0F14]"
                }`}
              >
                {merchant.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
