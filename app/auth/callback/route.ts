import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/feed";

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  let response = NextResponse.redirect(new URL(next, requestUrl.origin));
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const responseCookies: Array<{ name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] }> = [];
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookies) {
        nextCookies.forEach(({ name, value, options }) => {
          responseCookies.push({ name, value, options });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const currentMetadata = (data.user.user_metadata ?? {}) as {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
    const identity =
      data.user.identities?.find((entry) => entry?.provider === "google") ??
      data.user.identities?.[0];
    const identityData = (identity?.identity_data ?? {}) as {
      full_name?: string;
      name?: string;
      avatar_url?: string;
      picture?: string;
    };
    const updates: Record<string, string> = {};
    const nextName = identityData.full_name || identityData.name;
    const nextAvatar = identityData.avatar_url || identityData.picture;

    if (nextName && nextName !== currentMetadata.full_name) {
      updates.full_name = nextName;
    }

    if (nextAvatar && nextAvatar !== currentMetadata.avatar_url) {
      updates.avatar_url = nextAvatar;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.auth.updateUser({ data: updates });
    }

    response = NextResponse.redirect(
      new URL(`/user/${data.user.id}/feed`, requestUrl.origin)
    );
  }

  responseCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
