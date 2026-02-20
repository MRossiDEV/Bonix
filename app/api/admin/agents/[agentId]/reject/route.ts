import { NextRequest, NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status }
    );
  }

  const { admin, user } = adminContext;

  let body: { reason?: string } = {};
  try {
    body = (await request.json()) as { reason?: string };
  } catch {
    body = {};
  }

  const { data: agent, error: agentError } = await admin
    .from("agents")
    .update({ status: "REJECTED" })
    .eq("id", agentId)
    .select("id, status, user_id")
    .maybeSingle();

  if (agentError) {
    return NextResponse.json({ error: agentError.message }, { status: 400 });
  }

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  await logAudit({
    action: "AGENT_REJECTED",
    entityType: "agent",
    entityId: agent.id,
    userId: user.id,
    metadata: {
      reason: body.reason ?? null,
      user_id: agent.user_id,
    },
  });

  return NextResponse.json({ status: agent.status, agentId: agent.id });
}
