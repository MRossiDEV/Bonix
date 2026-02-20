import { redirect } from "next/navigation";

import AgentApplyWizard from "./AgentApplyWizard";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/auth-profile";

export default async function AgentApplyPage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  if (data.user.id !== userId) {
    redirect(`/user/${data.user.id}/agent/apply`);
  }

  const { data: agentRecord } = await supabase
    .from("agents")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: `${userId}@bonix.app`,
  });

  if (agentRecord && agentRecord.status === "ACTIVE") {
    redirect(`/agent/${userId}/dashboard`);
  }

  if (agentRecord && agentRecord.status === "PENDING") {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <h1 className="text-2xl font-semibold">Application pending</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Your agent application is under review. You will receive access
            once approved.
          </p>
        </div>
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">Agent workspace</p>
              <p className="text-sm text-[#9CA3AF]">
                Preview what you can access once approved.
              </p>
            </div>
            <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
              Locked
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Assigned promos",
                detail: "Access the promos you are responsible for distributing.",
              },
              {
                title: "Referral links",
                detail: "Share tracked links or codes with your audience.",
              },
              {
                title: "Performance metrics",
                detail: "Track reach, conversions, and promo engagement.",
              },
              {
                title: "Earnings view",
                detail: "Commissions dashboard coming in a future phase.",
              },
            ].map((item) => (
              <div
                key={item.title}
                title="Unlocks when your application is approved."
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-4 text-sm text-[#9CA3AF]"
              >
                <p className="text-[#FAFAFA]">{item.title}</p>
                <p className="mt-2 text-xs text-[#9CA3AF]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (agentRecord && agentRecord.status !== "REJECTED") {
    return (
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h1 className="text-2xl font-semibold">Agent access unavailable</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Your agent access is not active. Please contact support.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <AgentApplyWizard
        userId={userId}
        defaultEmail={profile.email}
        existingStatus={agentRecord?.status ?? null}
      />
    </div>
  );
}
