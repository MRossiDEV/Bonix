export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#121212] text-lg font-semibold text-[#FF7A00]">
            AB
          </div>
          <div>
            <p className="text-xl font-semibold">Bonix Member</p>
            <p className="text-sm text-[#9CA3AF]">member@bonix.app</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {[
          "Payment methods",
          "Saved promos",
          "Notifications",
          "Privacy",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-3 text-sm"
          >
            {item}
            <span className="text-[#9CA3AF]">›</span>
          </button>
        ))}
      </section>

      <button
        type="button"
        className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#FF7A00]"
      >
        Logout
      </button>
    </div>
  );
}
