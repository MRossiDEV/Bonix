export default function AgentDashboardPage({
  params,
}: Readonly<{ params: { agentID: string } }>) {
  const { agentID } = params;

  const tools = [
    {
      title: "Validate redemptions",
      description: "Review scans and approve payouts.",
      status: "12 pending",
    },
    {
      title: "Merchant onboarding",
      description: "Check new merchant applications.",
      status: "5 reviews",
    },
    {
      title: "Dispute queue",
      description: "Handle customer resolution cases.",
      status: "3 open",
    },
    {
      title: "Live promotions",
      description: "Monitor active campaign health.",
      status: "28 active",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
          Agent dashboard
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Welcome back, Agent {agentID}
        </h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Triage, validate, and keep promos running smoothly.
        </p>
      </section>

      <section className="grid gap-4">
        {tools.map((tool) => (
          <article
            key={tool.title}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{tool.title}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">
                  {tool.description}
                </p>
              </div>
              <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1 text-xs text-[#FF7A00]">
                {tool.status}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <h2 className="text-lg font-semibold">Agent shortcuts</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Scan QR validation",
            "Weekly performance",
            "Escalation contacts",
            "Audit trail",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
            >
              {item}
              <span className="text-[#9CA3AF]">›</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
