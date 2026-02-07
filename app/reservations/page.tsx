export default function AppReservationsPage() {
  const reservations = [
    {
      name: "Torreon Bistro",
      date: "Fri, Feb 7",
      time: "20:30",
      status: "Confirmed",
    },
    {
      name: "Cafe Centro",
      date: "Sat, Feb 8",
      time: "11:00",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <h1 className="text-2xl font-semibold">Your reservations</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Keep track of every table you have locked in.
        </p>
      </section>

      <section className="space-y-4">
        {reservations.map((reservation) => (
          <article
            key={reservation.name}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{reservation.name}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  {reservation.date} · {reservation.time}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  reservation.status === "Confirmed"
                    ? "bg-[#00E5A8] text-[#121212]"
                    : "bg-[#FF7A00] text-[#121212]"
                }`}
              >
                {reservation.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
