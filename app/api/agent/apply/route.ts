import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    userId?: string;
    email?: string;
    region?: string;
    experience?: string | null;
    channels?: string[];
  } = {};

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    payload = {};
  }

  if (!payload.userId || payload.userId !== data.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 403 });
  }

  if (!payload.region || !payload.region.trim().length) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const normalizedChannels = payload.channels?.filter(Boolean) ?? [];

  const { data: existing } = await supabase
    .from("agents")
    .select("id, status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (existing && existing.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Agent application already exists" },
      { status: 409 }
    );
  }

  if (existing && existing.status === "REJECTED") {
    const { error: updateError } = await supabase
      .from("agents")
      .update({
        region: payload.region.trim(),
        experience: payload.experience ?? null,
        channels: normalizedChannels,
        status: "PENDING",
      })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await logAudit({
      action: "AGENT_REAPPLIED",
      entityType: "agent",
      entityId: existing.id,
      userId: data.user.id,
    });

    return NextResponse.json({ status: "PENDING", agentId: existing.id });
  }

  const { data: agent, error } = await supabase
    .from("agents")
    .insert({
      user_id: data.user.id,
      email: payload.email ?? data.user.email ?? "",
      region: payload.region.trim(),
      experience: payload.experience ?? null,
      channels: normalizedChannels,
      status: "PENDING",
    })
    .select("id")
    .maybeSingle();

  if (error || !agent) {
    return NextResponse.json(
      { error: error?.message ?? "Insert failed" },
      { status: 400 }
    );
  }

  await logAudit({
    action: "AGENT_APPLIED",
    entityType: "agent",
    entityId: agent.id,
    userId: data.user.id,
  });

  return NextResponse.json({ status: "PENDING", agentId: agent.id });
}
