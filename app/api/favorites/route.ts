import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type FavoriteBody = {
  merchantId?: string;
};

async function getAuthorizedUserId() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: userRole } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "USER")
    .maybeSingle();

  if (!userRole) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId: user.id, admin };
}

export async function GET() {
  const auth = await getAuthorizedUserId();
  if (auth.error) {
    return auth.error;
  }

  const { data, error } = await auth.admin
    .from("user_favorite_merchants")
    .select("merchant_id")
    .eq("user_id", auth.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const merchantIds = (data ?? []).map((row) => row.merchant_id);
  return NextResponse.json({ merchantIds });
}

export async function POST(request: Request) {
  const auth = await getAuthorizedUserId();
  if (auth.error) {
    return auth.error;
  }

  let body: FavoriteBody;
  try {
    body = (await request.json()) as FavoriteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.merchantId) {
    return NextResponse.json({ error: "Missing merchantId" }, { status: 400 });
  }

  const { error } = await auth.admin
    .from("user_favorite_merchants")
    .upsert({ user_id: auth.userId, merchant_id: body.merchantId }, { onConflict: "user_id,merchant_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ merchantId: body.merchantId, favorited: true });
}

export async function DELETE(request: Request) {
  const auth = await getAuthorizedUserId();
  if (auth.error) {
    return auth.error;
  }

  let body: FavoriteBody;
  try {
    body = (await request.json()) as FavoriteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.merchantId) {
    return NextResponse.json({ error: "Missing merchantId" }, { status: 400 });
  }

  const { error } = await auth.admin
    .from("user_favorite_merchants")
    .delete()
    .eq("user_id", auth.userId)
    .eq("merchant_id", body.merchantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ merchantId: body.merchantId, favorited: false });
}
