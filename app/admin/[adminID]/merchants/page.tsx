import MerchantRequestsSection from "./MerchantRequestsSection";
import MerchantStatusManager from "./MerchantStatusManager";
import { requireAdmin } from "@/lib/admin";

type MerchantRequest = {
  id: string;
  email: string;
  businessName: string;
  contactName: string;
  phone: string;
  address: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    roles: string[];
  } | null;
};

type MerchantSummary = {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
};

export default async function AdminMerchantsPage() {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return (
      <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 text-sm text-[#F97316]">
        {adminContext.error.message}
      </div>
    );
  }

  const { admin } = adminContext;
  const { data: merchants, error: merchantsError } = await admin
    .from("merchants")
    .select(
      "id, email, business_name, contact_name, phone, address, status, created_at, user:users (id, name, email, phone, created_at, user_roles (role))"
    )
    .order("created_at", { ascending: false });

  if (merchantsError) {
    return (
      <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6 text-sm text-[#F97316]">
        {merchantsError.message}
      </div>
    );
  }

  const pendingRequests: MerchantRequest[] = (merchants ?? [])
    .filter((merchant) => merchant.status === "PENDING")
    .map((merchant) => ({
      id: merchant.id,
      email: merchant.email,
      businessName: merchant.business_name,
      contactName: merchant.contact_name,
      phone: merchant.phone,
      address: merchant.address,
      status: merchant.status,
      createdAt: merchant.created_at,
      user: merchant.user
        ? {
            id: merchant.user.id,
            name: merchant.user.name,
            email: merchant.user.email,
            phone: merchant.user.phone,
            createdAt: merchant.user.created_at,
            roles: merchant.user.user_roles?.map((role) => role.role) ?? [],
          }
        : null,
    }));

  const merchantSummaries: MerchantSummary[] = (merchants ?? []).map(
    (merchant) => ({
      id: merchant.id,
      businessName: merchant.business_name,
      status: merchant.status,
      createdAt: merchant.created_at,
    })
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">Merchants</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Approvals, compliance, and marketplace coverage.
        </p>
      </section>

      <MerchantRequestsSection requests={pendingRequests} />

      <MerchantStatusManager merchants={merchantSummaries} />
    </div>
  );
}
