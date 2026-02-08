import { LogoutButton } from "@/app/components/LogoutButton";

export default function AppProfilePage() {
        [
          "Payment methods",
          "Saved promos",
          "Notifications",
          "Privacy",
        ].map((item) => (
          <div
            key={item}
            className="flex w-full items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-3 text-sm"
          >
            {item}
            <span className="text-[#9CA3AF]">›</span>
          </div>
        ))}
        {[
          "Payment methods",
      <LogoutButton className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#FF7A00]">
        Logout
      </LogoutButton>
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
