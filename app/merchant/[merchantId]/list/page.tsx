import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type MerchantRow = {
  id: string;
  business_name: string | null;
  business_category: string | null;
  status: string;
  logo_url: string | null;
};

function isMissingLogoColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("logo_url") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

function isMissingBusinessCategoryColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("business_category") &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

function isAcceptedStatus(status: string | null | undefined): boolean {
  const normalized = String(status ?? "").toUpperCase();
  return normalized === "ACTIVE" || normalized === "APPROVED";
}

export default async function MerchantAccountsListPage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string }> }>) {
  const { merchantId: userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (userId !== user.id) {
    redirect(`/merchant/${user.id}/list`);
  }

  const primaryMerchants = await supabase
    .from("merchants")
    .select("id, business_name, business_category, status, logo_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  let merchants: MerchantRow[] = [];

  if (primaryMerchants.error) {
    const canUseLegacyFallback =
      isMissingLogoColumn(primaryMerchants.error.message) ||
      isMissingBusinessCategoryColumn(primaryMerchants.error.message);

    if (!canUseLegacyFallback) {
      throw new Error(primaryMerchants.error.message);
    }

    const legacyMerchants = await supabase
      .from("merchants")
      .select("id, business_name, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (legacyMerchants.error) {
      throw new Error(legacyMerchants.error.message);
    }

    merchants = ((legacyMerchants.data ?? []) as Array<
      Pick<MerchantRow, "id" | "business_name" | "status">
    >).map(
      (merchant) => ({ ...merchant, business_category: null, logo_url: null }),
    );
  } else {
    merchants = (primaryMerchants.data ?? []) as MerchantRow[];
  }

  const acceptedCount = merchants.filter((merchant) => isAcceptedStatus(merchant.status)).length;
  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6">
      <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[#A1A1AA]">Merchant role</p>
        <h1 className="mt-3 text-2xl font-semibold">Select your business</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Choose one of your merchant business accounts to continue.
        </p>
        <p className="mt-3 text-xs text-[#A1A1AA]">
          {acceptedCount} accepted {acceptedCount === 1 ? "business" : "businesses"}
        </p>
      </section>

      {merchants.length === 0 ? (
        <section className="rounded-3xl border border-[#262626] bg-[#1A1A1A] p-6">
          <p className="text-sm text-[#A1A1AA]">No merchant business profiles found.</p>
          <Link
            href={`/user/${user.id}/apply`}
            className="mt-4 inline-flex rounded-2xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111]"
          >
            Apply as merchant
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          {merchants.map((merchant) => {
            const accepted = isAcceptedStatus(merchant.status);
            const statusLabel = String(merchant.status ?? "").toUpperCase();

            const cardBody = (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#262626] bg-[#1A1A1A] px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#262626] bg-[#111111] text-xs font-semibold text-[#FFB547]">
                    {merchant.logo_url ? (
                      <Image
                        src={merchant.logo_url}
                        alt="Business logo"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      merchant.business_name?.trim().slice(0, 2).toUpperCase() || "MB"
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {merchant.business_name?.trim() || "Merchant business"}
                    </p>
                    <p className="truncate text-xs text-[#A1A1AA]">
                      {merchant.business_category?.trim() || "No category"}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    accepted
                      ? "bg-green-500/20 text-green-300"
                      : statusLabel === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-zinc-500/20 text-zinc-300"
                  }`}
                >
                  {accepted ? "ACCEPTED" : statusLabel || "INACTIVE"}
                </span>
              </div>
            );

            if (!accepted) {
              return <div key={merchant.id}>{cardBody}</div>;
            }

            return (
              <Link key={merchant.id} href={`/merchant/${merchant.id}/dashboard`}>
                {cardBody}
              </Link>
            );
          })}
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/merchant/${user.id}/list/new`}
          className="inline-flex rounded-2xl bg-[#FFB547] px-4 py-2 text-sm font-semibold text-[#111111]"
        >
          Create new business
        </Link>

        <Link
          href={`/user/${user.id}/profile`}
          className="inline-flex rounded-2xl border border-[#262626] bg-[#111111] px-4 py-2 text-sm"
        >
          Back to user profile
        </Link>
      </div>
    </main>
  );
}
