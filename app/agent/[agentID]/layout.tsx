import { redirect } from "next/navigation";

import AgentAppLayout from "@/app/components/AgentAppLayout";
import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AgentLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ agentID: string }>;
}>) {
  const { agentID } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  const { data: agentRecord, error: agentError } = await supabase
    .from("agents")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (agentError || !agentRecord || agentRecord.status !== "ACTIVE") {
    redirect(`/user/${data.user.id}/agent/apply`);
  }

  if (data.user.id !== agentID) {
    redirect(`/agent/${data.user.id}/dashboard`);
  }
  const updates = getIdentityMetadataUpdates(data.user);
  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Agent",
    fallbackEmail: `${agentID}@bonix.app`,
  });

  return (
    <AgentAppLayout
      basePath={`/agent/${agentID}`}
      agentName={profile.name}
      agentEmail={profile.email}
      agentInitials={profile.initials}
      agentAvatarUrl={profile.avatarUrl}
    >
      {children}
    </AgentAppLayout>
  );
}
