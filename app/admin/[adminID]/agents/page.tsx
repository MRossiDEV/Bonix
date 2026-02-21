import AgentRequestsSection from "./AgentRequestsSection";
import AgentStatusManager from "./AgentStatusManager";
import { requireAdmin } from "@/lib/admin";

type AgentRecord = {
  id: string;
  email: string;
  region: string;
  status: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    roles: string[];
  } | null;
};

export default async function AdminAgentsPage() {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return (
      <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 text-sm text-[#F97316]">
        {adminContext.error.message}
      </div>
    );
  }

  const { admin } = adminContext;
  const { data: agents, error: agentsError } = await admin
    .from("agents")
    .select(
      "id, email, region, status, created_at, user:users (id, name, email, phone, created_at, user_roles (role))"
    )
    .order("created_at", { ascending: false });

  if (agentsError) {
    return (
      <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 text-sm text-[#F97316]">
        {agentsError.message}
      </div>
    );
  }

  const agentRows: AgentRecord[] = (agents ?? []).map((agent) => {
    const user = Array.isArray(agent.user) ? agent.user[0] : agent.user;

    return {
      id: agent.id,
      email: agent.email,
      region: agent.region,
      status: agent.status,
      created_at: agent.created_at,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            createdAt: user.created_at,
            roles: user.user_roles?.map((role) => role.role) ?? [],
          }
        : null,
    };
  });

  const pendingRequests = agentRows
    .filter((agent) => agent.status === "PENDING")
    .map((agent) => ({
      id: agent.id,
      email: agent.email,
      region: agent.region,
      status: agent.status,
      createdAt: agent.created_at,
      user: agent.user,
    }));

  const agentSummaries = agentRows.map((agent) => ({
    id: agent.id,
    name: agent.user?.name ?? "Agent applicant",
    email: agent.email,
    region: agent.region,
    status: agent.status,
    createdAt: agent.created_at,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Track agent onboarding, regions, and approvals.
        </p>
      </section>

      <AgentRequestsSection requests={pendingRequests} />

      {agentRows.length === 0 ? (
        <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 text-sm text-[#94A3B8]">
          No agent applications yet.
        </section>
      ) : (
        <AgentStatusManager agents={agentSummaries} />
      )}
    </div>
  );
}
