import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing Supabase config." }, { status: 500 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { access_token?: string; refresh_token?: string }
    | null;

  if (!payload?.access_token || !payload?.refresh_token) {
    return NextResponse.json({ error: "Missing session tokens." }, { status: 400 });
  }

  const cookiesToSet: Array<{ name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }> = [];
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookies) {
        nextCookies.forEach(({ name, value, options }) => {
          cookiesToSet.push({ name, value, options });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.setSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    userId: data.user?.id ?? null,
  });

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
