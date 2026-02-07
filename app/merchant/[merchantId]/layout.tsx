import MerchantAppLayout from "@/app/components/MerchantAppLayout";

function getMerchantInitials(merchantId?: string) {
  const safeId = typeof merchantId === "string" ? merchantId : "";
  const cleaned = safeId.replace(/[^a-zA-Z0-9]/g, " ").trim();
  if (!cleaned) return "BM";
  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

export default async function MerchantLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;
  const initials = getMerchantInitials(merchantId);

  return (
    <MerchantAppLayout
      basePath={`/merchant/${merchantId}`}
      merchantName="Bonix Merchant"
      merchantEmail={`${merchantId}@bonix.app`}
      merchantInitials={initials}
    >
      {children}
    </MerchantAppLayout>
  );
}
