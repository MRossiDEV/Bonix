export default function MerchantLandingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">
          Merchant console
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Track promos, verify redemptions, and manage payouts in one place.
        </p>
      </section>

      <section className="grid gap-4">
        {[
          {
            title: "Review todays performance",
            detail: "See revenue, redemptions, and promo lift.",
          },
          {
            title: "Launch a new promo",
            detail: "Draft, schedule, and publish in minutes.",
          },
          {
            title: "Verify QR redemptions",
            detail: "Approve redemptions at the counter.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-5"
          >
            <p className="text-lg font-semibold">{card.title}</p>
            <p className="mt-2 text-sm text-[#A1A1AA]">{card.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
