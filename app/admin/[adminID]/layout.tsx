import AdminAppLayout from "@/app/components/AdminAppLayout";

function getAdminInitials(adminId?: string) {
  const safeId = typeof adminId === "string" ? adminId : "";
  const cleaned = safeId.replace(/[^a-zA-Z0-9]/g, " ").trim();
  if (!cleaned) return "BA";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ adminID: string }>;
}>) {
  const { adminID } = await params;
  const initials = getAdminInitials(adminID);

  return (
    <AdminAppLayout
      basePath={`/admin/${adminID}`}
      adminName="Bonix Admin"
      adminEmail={`${adminID}@bonix.app`}
      adminInitials={initials}
    >
      {children}
    </AdminAppLayout>
  );
}
