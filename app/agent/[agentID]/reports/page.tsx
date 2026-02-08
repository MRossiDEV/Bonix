export default function AgentReportsPage() {
  const reports = [
    {
      title: "Weekly redemption volume",
      detail: "+18% vs last week",
      metric: "4,218",
    },
    {
      title: "Merchant response time",
      detail: "Average review window",
      metric: "2h 14m",
    },
    {
      title: "Escalation resolution",
      detail: "Cases resolved this week",
      metric: "96%",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Performance snapshots and operational metrics.
        </p>
      </section>

      <section className="space-y-4">
        {reports.map((report) => (
          <article
            key={report.title}
            className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
              {report.title}
            </p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold">{report.metric}</p>
                <p className="mt-1 text-sm text-[#9CA3AF]">{report.detail}</p>
              </div>
              <span className="rounded-full border border-[#2A2A2A] bg-[#121212] px-3 py-1 text-xs text-[#00E5A8]">
                Updated
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
