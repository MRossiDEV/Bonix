export default function MerchantRedemptionsPage() {
  const redemptions = [
    {
      guest: "A. Rivera",
      promo: "Lunch rush menu",
      time: "Today, 12:18",
      status: "Pending",
      amount: "$18.00",
    },
    {
      guest: "J. Torres",
      promo: "Lunch rush menu",
      time: "Today, 12:02",
      status: "Confirmed",
      amount: "$22.00",
    },
    {
      guest: "M. Lee",
      promo: "Dinner combo",
      time: "Yesterday, 20:41",
      status: "Refunded",
      amount: "$24.00",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#A1A1AA]">
          Redemption queue
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Verify redemptions</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Review guest check-ins and confirm payouts.
        </p>
      </section>

      <section className="space-y-3">
        {redemptions.map((item) => (
          <div
            key={`${item.guest}-${item.time}`}
            className="rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.guest}</p>
                <p className="text-xs text-[#A1A1AA]">{item.promo}</p>
              </div>
              <span className="text-sm font-semibold">{item.amount}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>{item.time}</span>
              <span
                className={`rounded-full px-3 py-1 ${
                  item.status === "Confirmed"
                    ? "bg-[#4FD1C5]/20 text-[#4FD1C5]"
                    : item.status === "Refunded"
                    ? "bg-[#F56565]/20 text-[#F56565]"
                    : "bg-[#F6AD55]/20 text-[#F6AD55]"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
