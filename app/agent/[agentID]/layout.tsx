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
