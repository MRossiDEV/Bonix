import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userProfile } = await admin
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!userProfile || userProfile.role !== "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { promoId?: string };
  try {
    body = (await request.json()) as { promoId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.promoId) {
    return NextResponse.json({ error: "Missing promoId" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("reserve_promo", {
    p_user_id: user.id,
    p_promo_id: body.promoId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reservationId: data, userId: user.id });
}
