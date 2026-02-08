import Link from "next/link";

export default async function MerchantProfilePage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;

  const details = [
    { label: "Primary location", value: "Pocitos, Montevideo" },
    { label: "Default payout", value: "Weekly" },
    { label: "Team members", value: "4 active" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-lg font-semibold text-[#FFB547]">
            BM
          </div>
          <div>
            <p className="text-xl font-semibold">Bonix Merchant</p>
            <p className="text-sm text-[#A1A1AA]">merchant@bonix.app</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Switch role</p>
            <p className="text-sm text-[#A1A1AA]">
              Access other accepted workspaces.
            </p>
          </div>
          <span className="rounded-full border border-[#262626] px-3 py-1 text-xs text-[#A1A1AA]">
            Current: Merchant
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/admin/${merchantId}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>Admin</span>
            <span className="text-xs text-[#A1A1AA]">Accepted</span>
          </Link>
          <Link
            href={`/user/${merchantId}/feed`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>User</span>
            <span className="text-xs text-[#A1A1AA]">Accepted</span>
          </Link>
          <Link
            href={`/agent/${merchantId}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>Agent</span>
            <span className="text-xs text-[#A1A1AA]">Accepted</span>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        {details.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#A1A1AA]">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        {["Store hours", "Staff permissions", "Security", "Support"].map(
          (item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-3 text-sm"
            >
              {item}
              <span className="text-[#A1A1AA]">&gt;</span>
            </button>
          ),
        )}
      </section>

      <button
        type="button"
        className="w-full rounded-2xl border border-[#262626] bg-[#111111] py-3 text-sm text-[#FFB547]"
      >
        Logout
      </button>
    </div>
  );
}
