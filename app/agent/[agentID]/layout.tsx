import AgentAppLayout from "@/app/components/AgentAppLayout";

function getAgentInitials(agentId?: string) {
  const safeId = typeof agentId === "string" ? agentId : "";
  const cleaned = safeId.replace(/[^a-zA-Z0-9]/g, " ").trim();
  if (!cleaned) return "BA";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

export default async function AgentLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ agentID: string }>;
}>) {
  const { agentID } = await params;
  const initials = getAgentInitials(agentID);

  return (
    <AgentAppLayout
      basePath={`/agent/${agentID}`}
      agentName="Bonix Agent"
      agentEmail={`${agentID}@bonix.app`}
      agentInitials={initials}
    >
      {children}
    </AgentAppLayout>
  );
}
