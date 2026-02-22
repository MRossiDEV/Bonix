import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/app/components/LogoutButton";
import { MerchantBusinessesManager } from "@/app/merchant/[merchantId]/profile/MerchantBusinessesManager";
import { MerchantProfileEditor } from "@/app/merchant/[merchantId]/profile/MerchantProfileEditor";
import { MerchantLogoUploader } from "@/app/merchant/[merchantId]/profile/MerchantLogoUploader";

import { createClient } from "@/lib/supabase/server";

type MerchantProfileRow = {
  id: string;
  status: string;
  business_name: string | null;
  email: string | null;
  business_category: string | null;
  contact_name: string | null;
  phone: string | null;
  locations: string[] | null;
  address: string | null;
  short_description: string | null;
  logo_url: string | null;
};

const merchantSelectColumns = [
  "id",
  "business_name",
  "email",
  "business_category",
  "contact_name",
  "phone",
  "locations",
  "address",
  "short_description",
  "description",
  "logo_url",
  "status",
  "created_at",
] as const;

function isMissingLogoColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("logo_url") && normalized.includes("does not exist");
}

function isMissingBusinessCategoryColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("business_category") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

function isMissingColumnError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("does not exist") || normalized.includes("schema cache");
}

function getMissingColumnFromError(message: string): string | null {
  const pgMatch = message.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (pgMatch?.[1]) {
    const raw = pgMatch[1].replaceAll('"', "");
    const parts = raw.split(".");
    return parts[parts.length - 1] || null;
  }

  const schemaCacheMatch = message.match(
    /could not find the '([^']+)' column of '[^']+' in the schema cache/i,
  );
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  return null;
}

export default async function MerchantProfilePage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const missingColumns = new Set<string>();
  let rawBusinesses: Record<string, unknown>[] = [];
  let lastErrorMessage: string | null = null;

  for (let attempt = 0; attempt < merchantSelectColumns.length; attempt += 1) {
    const selectColumns = merchantSelectColumns.filter(
      (column) => !missingColumns.has(column),
    );
    const selectClause = selectColumns.join(", ");

    const result = await supabase
      .from("merchants")
      .select(selectClause)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!result.error) {
      rawBusinesses = (result.data ?? []) as unknown as Record<string, unknown>[];
      lastErrorMessage = null;
      break;
    }

    lastErrorMessage = result.error.message;

    const canFallback =
      isMissingLogoColumn(lastErrorMessage) ||
      isMissingBusinessCategoryColumn(lastErrorMessage) ||
      isMissingColumnError(lastErrorMessage);

    if (!canFallback) {
      throw new Error(lastErrorMessage);
    }

    const missingColumn = getMissingColumnFromError(lastErrorMessage);
    if (!missingColumn || !merchantSelectColumns.includes(missingColumn as (typeof merchantSelectColumns)[number])) {
      break;
    }

    missingColumns.add(missingColumn);
  }

  if (lastErrorMessage && !rawBusinesses.length) {
    throw new Error(lastErrorMessage);
  }

  const businesses: MerchantProfileRow[] = rawBusinesses.map((business) => ({
    id: String(business.id ?? ""),
    status: String(business.status ?? ""),
    business_name: (business.business_name as string | null | undefined) ?? null,
    email: (business.email as string | null | undefined) ?? null,
    business_category: (business.business_category as string | null | undefined) ?? null,
    contact_name: (business.contact_name as string | null | undefined) ?? null,
    phone: (business.phone as string | null | undefined) ?? null,
    locations: (business.locations as string[] | null | undefined) ?? null,
    address: (business.address as string | null | undefined) ?? null,
    short_description:
      (business.short_description as string | null | undefined) ??
      (business.description as string | null | undefined) ??
      null,
    logo_url: (business.logo_url as string | null | undefined) ?? null,
  }));

  if (!businesses.length) {
    redirect(`/merchant/${user.id}/list`);
  }

  const merchant = businesses.find((business) => business.id === merchantId) ?? null;

  if (!merchant) {
    redirect(`/merchant/${user.id}/list`);
  }

  const merchantLogoUrl = merchant?.logo_url ?? null;

  const displayName = merchant?.business_name?.trim() || "Bonix Merchant";
  const displayEmail = merchant?.email?.trim() || "merchant@bonix.app";
  const displayInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "BM";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#111111] text-lg font-semibold text-[#FFB547]">
            {merchantLogoUrl ? (
              <Image
                src={merchantLogoUrl}
                alt="Merchant avatar"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              displayInitials
            )}
          </div>
          <div>
            <p className="text-xl font-semibold">{displayName}</p>
            <p className="text-sm text-[#A1A1AA]">{displayEmail}</p>
          </div>
        </div>
      </section>

      <MerchantLogoUploader
        initialLogoUrl={merchantLogoUrl}
        merchantId={merchant.id}
      />

      <MerchantProfileEditor merchant={merchant} />

      {/* <MerchantBusinessesManager initialBusinesses={businesses} /> */}

      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Switch role</p>
            <p className="text-sm text-[#A1A1AA]">
              Access other accepted workspaces.
            </p>
          </div>
          <span className="rounded-full border border-[#262626] px-3 py-1 text-xs text-[#A1A1AA]">
            Current: Merchant
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/merchant/${user.id}/list`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>Merchant</span>
            <span className="text-xs text-[#A1A1AA]">
              {businesses.length} {businesses.length === 1 ? "account" : "accounts"}
            </span>
          </Link>
          <Link
            href={`/user/${user.id}/feed`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>User</span>
            <span className="text-xs text-[#A1A1AA]">Accepted</span>
          </Link>
          <Link
            href={`/agent/${user.id}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] px-4 py-3 text-sm"
          >
            <span>Agent</span>
            <span className="text-xs text-[#A1A1AA]">Accepted</span>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        {["Store hours", "Staff permissions", "Security", "Support"].map(
          (item) => (
            <div
              key={item}
              className="flex w-full items-center justify-between rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-3 text-sm"
            >
              {item}
              <span className="text-[#A1A1AA]">&gt;</span>
            </div>
          ),
        )}
      </section>

      <LogoutButton className="w-full rounded-2xl border border-[#262626] bg-[#111111] py-3 text-sm text-[#FFB547]">
        Logout
      </LogoutButton>
    </div>
  );
}
