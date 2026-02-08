export default function AgentQueuePage() {
  const queueItems = [
    {
      title: "Redemption validation",
      detail: "12 scans pending review",
      priority: "High",
    },
    {
      title: "Merchant onboarding",
      detail: "5 applications waiting",
      priority: "Medium",
    },
    {
      title: "Chargeback dispute",
      detail: "3 escalations open",
      priority: "High",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h1 className="text-2xl font-semibold">Agent queue</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Triage the tasks that keep promos running smoothly.
        </p>
      </section>

      <section className="space-y-4">
        {queueItems.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{item.detail}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  item.priority === "High"
                    ? "bg-[#FF7A00] text-[#121212]"
                    : "bg-[#00E5A8] text-[#121212]"
                }`}
              >
                {item.priority}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
