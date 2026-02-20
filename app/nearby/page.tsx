import UserAppLayout from "@/app/components/UserAppLayout";

export default function AppNearbyPage() {
  const locations = [
    { name: "La Rambla Tacos", distance: "0.4 km", tag: "Live" },
    { name: "Mercado Verde", distance: "0.8 km", tag: "New" },
    { name: "Barrio Pasta", distance: "1.1 km", tag: "Tonight" },
  ];

  return (
    <UserAppLayout basePath="" userName="Bonix Member" userEmail="member@bonix.app">
      <div className="space-y-6 px-4 pb-8">
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
          <h1 className="text-2xl font-semibold">Nearby offers</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Walkable spots with instant savings.
          </p>
        </section>

        <section className="space-y-4">
          {locations.map((location) => (
            <article
              key={location.name}
              className="flex items-center justify-between rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
            >
              <div>
                <p className="text-lg font-semibold">{location.name}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  {location.distance} away
                </p>
              </div>
              <span className="rounded-full bg-[#00E5A8] px-3 py-1 text-xs font-semibold text-[#121212]">
                {location.tag}
              </span>
            </article>
          ))}
        </section>
      </div>
    </UserAppLayout>
  );
}
