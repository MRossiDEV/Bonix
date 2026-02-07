export default function AppFeedPage() {
  const promos = [
    {
      name: "Pocitos Grill",
      title: "2x1 lunch bowls",
      time: "Today, 12:00 - 15:00",
    },
    {
      name: "Cafe Centro",
      title: "20% off brunch",
      time: "Today, 09:00 - 12:00",
    },
    {
      name: "Marina Sushi",
      title: "Free dessert with menu",
      time: "Tonight, 19:00 - 22:00",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
          Tonight in Pocitos
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Your Bonix feed</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Curated offers ready to reserve in two taps.
        </p>
      </section>

      <section className="grid gap-4">
        {promos.map((promo) => (
          <article
            key={promo.title}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                {promo.name}
              </p>
              <span className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-semibold text-[#121212]">
                Reserve
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold">{promo.title}</p>
            <p className="mt-2 text-sm text-[#9CA3AF]">{promo.time}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
