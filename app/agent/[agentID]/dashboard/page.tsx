import AgentDashboardClient from "./AgentDashboardClient";

type AgentDashboardPageProps = {
  params: Promise<{
    agentID: string;
  }>;
};

export default async function AgentDashboardPage({
  params,
}: AgentDashboardPageProps) {
  const { agentID } = await params;

  return (
    <AgentDashboardClient
      agentID={agentID}
    />
  );
}