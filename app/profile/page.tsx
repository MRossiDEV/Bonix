import { LogoutButton } from "@/app/components/LogoutButton";

export default function AppProfilePage() {
  const preferences = [
    "Payment methods",
    "Saved promos",
    "Notifications",
    "Privacy",
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        {preferences.map((item) => (
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

      <LogoutButton className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#FF7A00]">
        Logout
      </LogoutButton>
    </div>
  );
}
