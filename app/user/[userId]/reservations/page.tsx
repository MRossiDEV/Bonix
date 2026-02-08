import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type ReservationRow = {
  id: string;
  status: string;
  expires_at: string;
  created_at: string;
  promo: {
    title: string;
    merchant: { business_name: string } | null;
  } | null;
};

type ReservationRowRaw = Omit<ReservationRow, "promo"> & {
  promo:
    | {
        title: string;
        merchant: { business_name: string }[] | { business_name: string } | null;
      }
    | {
        title: string;
        merchant: { business_name: string }[] | { business_name: string } | null;
      }[]
    | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return { label: "Active", className: "bg-[#00E5A8] text-[#121212]" };
    case "REDEEMED":
      return { label: "Redeemed", className: "bg-[#7B61FF] text-[#121212]" };
    case "CANCELLED":
      return { label: "Cancelled", className: "bg-[#FF7A00] text-[#121212]" };
    case "EXPIRED":
      return { label: "Expired", className: "bg-[#FF7A00] text-[#121212]" };
    default:
      return { label: status, className: "bg-[#FF7A00] text-[#121212]" };
  }
};

export default async function UserReservationsPage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    redirect(`/user/${user.id}/reservations`);
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, expires_at, created_at, promo:promos!left (title, merchant:merchants!left (business_name))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reservations = (data ?? []).map((row) => {
    const raw = row as ReservationRowRaw;
    const promo = Array.isArray(raw.promo) ? raw.promo[0] ?? null : raw.promo;
    const merchant = promo?.merchant
      ? Array.isArray(promo.merchant)
        ? promo.merchant[0] ?? null
        : promo.merchant
      : null;
    const normalizedPromo = promo ? { ...promo, merchant } : null;

    return { ...raw, promo: normalizedPromo } satisfies ReservationRow;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5">
        <h1 className="text-2xl font-semibold">Your reservations</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Keep track of every table you have locked in.
        </p>
      </section>

      <section className="space-y-4">
        {error && (
          <p className="text-sm text-[#FF7A00]">
            We could not load your reservations right now. {error.message}
          </p>
        )}

        {!error && reservations.length === 0 && (
          <p className="text-sm text-[#9CA3AF]">No reservations yet.</p>
        )}

        {reservations.map((reservation) => {
          const badge = getStatusBadge(reservation.status);
          const name =
            reservation.promo?.merchant?.business_name ||
            reservation.promo?.title ||
            "Reservation";
          const when = reservation.expires_at || reservation.created_at;
          const isActive =
            reservation.status === "ACTIVE" &&
            new Date(reservation.expires_at) > new Date();

          return (
            <article
              key={reservation.id}
              className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{name}</p>
                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    {formatDate(when)} · {formatTime(when)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              {isActive && (
                <Link
                  href={`/user/${userId}/reservations/${reservation.id}/claim`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:border-[#FF7A00]"
                >
                  Claim promo
                </Link>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
