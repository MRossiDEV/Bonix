export default function AgentAuditsPage() {
  const audits = [
    {
      title: "Promo redemption audit",
      detail: "7 merchants flagged for manual review",
      status: "In progress",
    },
    {
      title: "Wallet balance checks",
      detail: "Completed weekly reconciliation",
      status: "Complete",
    },
    {
      title: "Agent activity log",
      detail: "Last updated 10 minutes ago",
      status: "Live",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h1 className="text-2xl font-semibold">Audits</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Maintain compliance and review platform events.
        </p>
      </section>

      <section className="space-y-4">
        {audits.map((audit) => (
          <article
            key={audit.title}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{audit.title}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{audit.detail}</p>
              </div>
              <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1 text-xs text-[#9CA3AF]">
                {audit.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
