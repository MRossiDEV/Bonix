export default function AdminUsersPage() {
  const users = [
    { name: "Aurelia Brooks", status: "Active", activity: "2 mins ago" },
    { name: "Mateo Diaz", status: "Flagged", activity: "1 hour ago" },
    { name: "Naomi Clarke", status: "Active", activity: "Yesterday" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Monitor user activity and account health.
        </p>
      </section>

      <section className="space-y-4">
        {users.map((user) => (
          <article
            key={user.name}
            className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Last activity {user.activity}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.status === "Flagged"
                    ? "bg-[#F97316] text-[#0B0F14]"
                    : "bg-[#22C55E] text-[#0B0F14]"
                }`}
              >
                {user.status}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
