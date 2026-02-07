import UserAppLayout from "@/app/components/UserAppLayout";

function getUserInitials(userId?: string) {
  const safeId = typeof userId === "string" ? userId : "";
  const cleaned = safeId.replace(/[^a-zA-Z0-9]/g, " ").trim();
  if (!cleaned) return "BM";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

export default async function UserLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const initials = getUserInitials(userId);

  return (
    <UserAppLayout
      basePath={`/user/${userId}`}
      userName="Bonix Member"
      userEmail={`${userId}@bonix.app`}
      userInitials={initials}
    >
      {children}
    </UserAppLayout>
  );
}
