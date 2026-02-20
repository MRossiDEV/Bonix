import Link from "next/link";

import UserAppLayout from "@/app/components/UserAppLayout";

export default function AppFeedPage() {
  const promos = [
    {
      id: "pocitos-grill-2x1",
      name: "Pocitos Grill",
      title: "2x1 lunch bowls",
      time: "Today · 12:00 - 15:00",
      neighborhood: "Pocitos",
      distance: "0.4 km",
      tag: "Popular",
      cashback: "+4% cashback",
    },
    {
      id: "cafe-centro-20-brunch",
      name: "Cafe Centro",
      title: "20% off brunch",
      time: "Today · 09:00 - 12:00",
      neighborhood: "Centro",
      distance: "0.8 km",
      tag: "New",
      cashback: "+3% cashback",
    },
    {
      id: "marina-sushi-dessert",
      name: "Marina Sushi",
      title: "Free dessert with menu",
      time: "Tonight · 19:00 - 22:00",
      neighborhood: "Punta Carretas",
      distance: "1.1 km",
      tag: "Tonight",
      cashback: "+5% cashback",
    },
  ];

  return (
    <UserAppLayout basePath="" userName="Bonix Member" userEmail="member@bonix.app">
      <div className="space-y-6 px-4 pb-8">
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-[#9CA3AF]">
            Discover offers
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Your Bonix feed</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Pick a deal, reserve fast, and save at places near you.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-[#FF7A00] px-3 py-1.5 text-xs font-semibold text-[#121212]"
            >
              Trending now
            </button>
            <button
              type="button"
              className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1.5 text-xs font-semibold text-[#FAFAFA]"
            >
              Nearby
            </button>
            <button
              type="button"
              className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1.5 text-xs font-semibold text-[#FAFAFA]"
            >
              Tonight
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          {promos.map((promo) => (
            <article
              key={promo.id}
              className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                    {promo.name}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{promo.title}</p>
                </div>
                <span className="rounded-full bg-[#121212] px-3 py-1 text-xs font-semibold text-[#00E5A8]">
                  {promo.tag}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
                <span>{promo.time}</span>
                <span>•</span>
                <span>
                  {promo.neighborhood} · {promo.distance}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[#00E5A8]">
                  {promo.cashback}
                </p>
                <Link
                  href={`/promo/${promo.id}`}
                  className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212]"
                >
                  Reserve
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </UserAppLayout>
  );
}
