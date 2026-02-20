import { NextRequest, NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";

const allowedStatuses = [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "INACTIVE",
  "PAUSED",
];

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

  let body: { status?: string } = {};
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    body = {};
  }

  const nextStatus = body.status?.toUpperCase();
  if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: agent, error: agentError } = await admin
    .from("agents")
    .update({ status: nextStatus })
    .eq("id", agentId)
    .select("id, status, user_id")
    .maybeSingle();

  if (agentError) {
    return NextResponse.json({ error: agentError.message }, { status: 400 });
  }

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (nextStatus === "ACTIVE") {
    const { error: roleError } = await admin
      .from("user_roles")
      .upsert(
        { user_id: agent.user_id, role: "AGENT" },
        { onConflict: "user_id,role" }
      );

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 400 });
    }
  }

  await logAudit({
    action: "AGENT_STATUS_UPDATED",
    entityType: "agent",
    entityId: agent.id,
    userId: user.id,
    metadata: {
      status: nextStatus,
      user_id: agent.user_id,
    },
  });

  return NextResponse.json({ status: agent.status, agentId: agent.id });
}
