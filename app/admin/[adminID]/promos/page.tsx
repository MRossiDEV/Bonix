export default function AdminPromosPage() {
  const promos = [
    {
      title: "2-for-1 Taco Tuesday",
      status: "Active",
      merchant: "La Rambla Tacos",
    },
    {
      title: "Green bowl bundle",
      status: "Paused",
      merchant: "Mercado Verde",
    },
    {
      title: "Late-night pasta",
      status: "Active",
      merchant: "Barrio Pasta",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Promos</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Review performance and enforce quality guardrails.
        </p>
      </section>

      <section className="space-y-4">
        {promos.map((promo) => (
          <article
            key={promo.title}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{promo.title}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {promo.merchant}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  promo.status === "Paused"
                    ? "bg-[#F97316] text-[#0B0F14]"
                    : "bg-[#22C55E] text-[#0B0F14]"
                }`}
              >
                {promo.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
