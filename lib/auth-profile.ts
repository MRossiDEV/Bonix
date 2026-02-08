type AuthUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

type AuthProfileOptions = {
  fallbackName: string;
  fallbackEmail: string;
};

export function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function getAuthProfile(user: AuthUser | null | undefined, options: AuthProfileOptions) {
  const metadata = (user?.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const name = metadata.full_name || metadata.name || options.fallbackName;
  const email = user?.email || options.fallbackEmail;
  const avatarUrl = metadata.avatar_url || metadata.picture;
  const initials = getInitials(name, email);

  return { name, email, avatarUrl, initials };
}
