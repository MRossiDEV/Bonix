type AuthUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<{
    provider?: string | null;
    identity_data?: Record<string, unknown> | null;
  }> | null;
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
  const identity =
    user?.identities?.find((entry) => entry?.provider === "google") ??
    user?.identities?.[0];
  const identityData = (identity?.identity_data ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    email?: string;
  };
  const name =
    metadata.full_name ||
    metadata.name ||
    identityData.full_name ||
    identityData.name ||
    options.fallbackName;
  const email = user?.email || identityData.email || options.fallbackEmail;
  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    identityData.avatar_url ||
    identityData.picture;
  const initials = getInitials(name, email);

  return { name, email, avatarUrl, initials };
}

export function getIdentityMetadataUpdates(user: AuthUser | null | undefined) {
  if (!user) return null;

  const currentMetadata = (user.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const identity =
    user.identities?.find((entry) => entry?.provider === "google") ??
    user.identities?.[0];
  const identityData = (identity?.identity_data ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const updates: Record<string, string> = {};
  const nextName = identityData.full_name || identityData.name;
  const currentName = currentMetadata.full_name || currentMetadata.name;
  const nextAvatar = identityData.avatar_url || identityData.picture;
  const currentAvatar = currentMetadata.avatar_url || currentMetadata.picture;

  if (nextName && nextName !== currentName) {
    updates.full_name = nextName;
  }

  if (nextAvatar && nextAvatar !== currentAvatar) {
    updates.avatar_url = nextAvatar;
  }

  return Object.keys(updates).length > 0 ? updates : null;
}
