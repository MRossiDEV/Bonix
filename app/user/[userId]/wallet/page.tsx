export default function UserWalletPage() {
  const activity = [
    { label: "Pocitos Grill", amount: "+ $2.40", time: "Today" },
    { label: "Cafe Centro", amount: "+ $1.60", time: "Yesterday" },
    { label: "Marina Sushi", amount: "+ $3.20", time: "Thu" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
          Bonix wallet
        </p>
        <p className="mt-3 text-3xl font-semibold">$248.60</p>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Cashback ready for your next visit.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-[#FF7A00] py-3 text-sm font-semibold text-[#121212]"
        >
          Withdraw balance
        </button>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold">Recent activity</p>
        {activity.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-[#9CA3AF]">{item.time}</p>
            </div>
            <span className="text-sm text-[#00E5A8]">{item.amount}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
