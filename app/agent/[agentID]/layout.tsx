import AgentAppLayout from "@/app/components/AgentAppLayout";
import { getAuthProfile } from "@/lib/auth-profile";
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
