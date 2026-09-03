"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ReservationStatus = "upcoming" | "ready" | "used" | "expired";

type Reservation = {
  id: string;
  merchantName: string;
  category: string;
  promoTitle: string;
  promoDescription: string;
  discount: string;
  date: string;
  time: string;
  reservedAt: string;
  expiresAt: string;
  status: ReservationStatus;
  emoji: string;
  address: string;
  reservationCode: string;
  color: string;
};

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "reservation-1",
    merchantName: "La Cocina Verde",
    category: "Restaurant",
    promoTitle: "20% Off Your Dinner",
    promoDescription: "20% off your total bill for dine-in.",
    discount: "20% OFF",
    date: "Today",
    time: "19:30",
    reservedAt: "Today · 11:42",
    expiresAt: "Today · 22:00",
    status: "ready",
    emoji: "🍃",
    address: "Av. Rivera 2145",
    reservationCode: "BNX-4821",
    color: "from-emerald-500/30 to-[#0F172A]",
  },
  {
    id: "reservation-2",
    merchantName: "Montevideo Brew",
    category: "Café",
    promoTitle: "2x Bonix Credits",
    promoDescription: "Earn double Bonix credits with your purchase.",
    discount: "2x CREDITS",
    date: "Tomorrow",
    time: "15:00",
    reservedAt: "Yesterday · 18:20",
    expiresAt: "Tomorrow · 18:00",
    status: "upcoming",
    emoji: "☕",
    address: "18 de Julio 1542",
    reservationCode: "BNX-7359",
    color: "from-amber-500/25 to-[#0F172A]",
  },
  {
    id: "reservation-3",
    merchantName: "Casa Nómada",
    category: "Restaurant",
    promoTitle: "Free Dessert",
    promoDescription: "Receive one complimentary dessert with your meal.",
    discount: "FREE DESSERT",
    date: "Sep 5",
    time: "20:00",
    reservedAt: "Aug 31 · 14:10",
    expiresAt: "Sep 5 · 23:00",
    status: "upcoming",
    emoji: "🏡",
    address: "Bulevar España 1128",
    reservationCode: "BNX-1934",
    color: "from-violet-500/25 to-[#0F172A]",
  },
  {
    id: "reservation-4",
    merchantName: "Barrio Fitness",
    category: "Fitness",
    promoTitle: "30% Off Day Pass",
    promoDescription: "One day pass with 30% discount.",
    discount: "30% OFF",
    date: "Aug 28",
    time: "10:00",
    reservedAt: "Aug 27 · 09:12",
    expiresAt: "Aug 28 · 23:00",
    status: "used",
    emoji: "🏋️",
    address: "Constituyente 1821",
    reservationCode: "BNX-8210",
    color: "from-sky-500/20 to-[#0F172A]",
  },
];

type Filter = "active" | "used";

export default function UserReservationsPage() {
  const params = useParams<{ userId?: string | string[] }>();

  const userId = Array.isArray(params?.userId)
    ? params.userId[0]
    : params?.userId ?? "";

  const [reservations] = useState(INITIAL_RESERVATIONS);
  const [filter, setFilter] = useState<Filter>("active");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          reservation.status === "ready" ||
          reservation.status === "upcoming",
      ),
    [reservations],
  );

  const usedReservations = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          reservation.status === "used" ||
          reservation.status === "expired",
      ),
    [reservations],
  );

  const visibleReservations =
    filter === "active" ? activeReservations : usedReservations;

  const readyCount = activeReservations.filter(
    (reservation) => reservation.status === "ready",
  ).length;

  return (
    <section className="space-y-6 pb-8">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="px-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Your reservations
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F8FAFC]">
              Reservations
            </h1>

            <p className="mt-1 text-xs text-[#64748B]">
              Your reserved promos, ready when you are.
            </p>
          </div>

          {readyCount > 0 ? (
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.7)]" />

              <span className="text-[9px] font-black text-[#22C55E]">
                {readyCount} READY
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          QUICK INFO
      ============================================================ */}

      {readyCount > 0 ? (
        <div className="mx-4 overflow-hidden rounded-3xl border border-[#22C55E]/20 bg-gradient-to-br from-[#102219] to-[#0F172A]">
          <div className="relative p-5">
            <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-[#22C55E]/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-xl">
                🎟️
              </div>

              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">
                  You have a promo ready
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  Select your reservation when you arrive and show the
                  redemption screen to the restaurant.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ============================================================
          FILTER
      ============================================================ */}

      <div className="px-4">
        <div className="flex rounded-2xl border border-[#1F2937] bg-[#0F172A] p-1">
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              filter === "active"
                ? "bg-[#22C55E] text-[#041007]"
                : "text-[#64748B]"
            }`}
          >
            Active
            <span
              className={`ml-1.5 ${
                filter === "active"
                  ? "text-[#041007]/60"
                  : "text-[#475569]"
              }`}
            >
              {activeReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("used")}
            className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
              filter === "used"
                ? "bg-[#22C55E] text-[#041007]"
                : "text-[#64748B]"
            }`}
          >
            History
            <span
              className={`ml-1.5 ${
                filter === "used"
                  ? "text-[#041007]/60"
                  : "text-[#475569]"
              }`}
            >
              {usedReservations.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================
          RESERVATION LIST
      ============================================================ */}

      <div className="space-y-4 px-4">
        <AnimatePresence mode="popLayout">
          {visibleReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onSelect={() => setSelectedReservation(reservation)}
            />
          ))}
        </AnimatePresence>

        {visibleReservations.length === 0 ? (
          <EmptyReservations filter={filter} />
        ) : null}
      </div>

      {/* ============================================================
          HOW IT WORKS
      ============================================================ */}

      {filter === "active" && activeReservations.length > 0 ? (
        <div className="mx-4 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            How to use
          </p>

          <div className="mt-4 space-y-4">
            <Instruction
              number="1"
              title="Go to the place"
              description="Visit the restaurant or business during the promo period."
            />

            <Instruction
              number="2"
              title="Open your reservation"
              description="Select the reserved promo from this page."
            />

            <Instruction
              number="3"
              title="Show the redemption screen"
              description="The staff verifies your Bonix reservation and applies the promo."
            />
          </div>
        </div>
      ) : null}

      {/* ============================================================
          REDEMPTION MODAL
      ============================================================ */}

      <RedemptionModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
      />
    </section>
  );
}

/* ================================================================
   RESERVATION CARD
================================================================ */

function ReservationCard({
  reservation,
  onSelect,
}: {
  reservation: Reservation;
  onSelect: () => void;
}) {
  const isReady = reservation.status === "ready";
  const isUsed =
    reservation.status === "used" || reservation.status === "expired";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileTap={{ scale: 0.985 }}
      type="button"
      onClick={onSelect}
      className={`group w-full overflow-hidden rounded-3xl border text-left transition ${
        isReady
          ? "border-[#22C55E]/30 bg-[#0F172A]"
          : "border-[#1F2937] bg-[#0F172A]"
      }`}
    >
      {/* Promo header */}

      <div
        className={`relative h-28 overflow-hidden bg-gradient-to-br ${reservation.color}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_35%)]" />

        {/* Decorative city/building silhouette */}

        <div className="absolute bottom-0 left-[10%] h-12 w-10 rounded-t-lg bg-black/20" />
        <div className="absolute bottom-0 left-[24%] h-16 w-12 rounded-t-lg bg-black/15" />
        <div className="absolute bottom-0 right-[18%] h-14 w-11 rounded-t-lg bg-black/20" />
        <div className="absolute bottom-0 right-[7%] h-20 w-14 rounded-t-lg bg-black/15" />

        <div className="absolute left-4 top-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F14]/70 text-2xl backdrop-blur-md">
            {reservation.emoji}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/50">
              {reservation.category}
            </p>

            <p className="mt-0.5 text-sm font-black text-white">
              {reservation.merchantName}
            </p>
          </div>
        </div>

        {/* Discount */}

        <div className="absolute bottom-3 right-3 rounded-xl border border-white/10 bg-[#0B0F14]/75 px-2.5 py-1.5 backdrop-blur-md">
          <span className="text-[9px] font-black text-[#22C55E]">
            {reservation.discount}
          </span>
        </div>
      </div>

      {/* Main content */}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#F8FAFC]">
              {reservation.promoTitle}
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
              {reservation.promoDescription}
            </p>
          </div>

          <StatusBadge status={reservation.status} />
        </div>

        {/* Date / location */}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <InfoBox
            icon={<CalendarIcon />}
            label="When"
            value={`${reservation.date} · ${reservation.time}`}
          />

          <InfoBox
            icon={<LocationIcon />}
            label="Location"
            value={reservation.address}
          />
        </div>

        {/* Action */}

        <div className="mt-3 flex items-center justify-between border-t border-[#1F2937] pt-3">
          <span className="text-[9px] font-medium text-[#475569]">
            Code {reservation.reservationCode}
          </span>

          <span
            className={`flex items-center gap-1 text-[10px] font-black ${
              isUsed
                ? "text-[#64748B]"
                : isReady
                  ? "text-[#22C55E]"
                  : "text-[#94A3B8]"
            }`}
          >
            {isUsed ? "View details" : "Open reservation"}
            <ArrowIcon />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ================================================================
   REDEMPTION MODAL
================================================================ */

function RedemptionModal({
  reservation,
  onClose,
}: {
  reservation: Reservation | null;
  onClose: () => void;
}) {
  if (!reservation) return null;

  const isRedeemable = reservation.status === "ready";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#1F2937] bg-[#0F172A] shadow-2xl"
        >
          {/* Modal header */}

          <div className="relative overflow-hidden bg-gradient-to-br from-[#13271B] to-[#0F172A] px-5 pb-6 pt-5">
            <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-[#22C55E]/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                  Bonix reservation
                </p>

                <h2 className="mt-1 text-lg font-black text-[#F8FAFC]">
                  {reservation.merchantName}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111827] text-[#64748B]"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-2xl">
                {reservation.emoji}
              </div>

              <div>
                <p className="text-sm font-bold text-[#F8FAFC]">
                  {reservation.promoTitle}
                </p>

                <p className="mt-1 text-[10px] text-[#64748B]">
                  {reservation.promoDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket */}

          <div className="px-5 py-5">
            <div className="relative overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0B0F14]">
              {/* Ticket notches */}

              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0F172A]" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#0F172A]" />

              <div className="p-5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
                  Reservation code
                </p>

                <p className="mt-2 font-mono text-2xl font-black tracking-[0.18em] text-[#F8FAFC]">
                  {reservation.reservationCode}
                </p>

                <div className="my-5 border-t border-dashed border-[#334155]" />

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#475569]">
                      Date
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#CBD5E1]">
                      {reservation.date}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#475569]">
                      Time
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#CBD5E1]">
                      {reservation.time}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#475569]">
                      Location
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#CBD5E1]">
                      {reservation.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Redemption area */}

            {isRedeemable ? (
              <div className="mt-4">
                <div className="rounded-2xl border border-[#22C55E]/15 bg-[#22C55E]/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10 text-sm">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#F8FAFC]">
                        Ready to redeem
                      </p>

                      <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                        Show this screen to the restaurant staff. They will
                        verify your reservation and apply the promo.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Replace this with the real redemption flow.
                    // Do NOT mark the promo as redeemed from the client
                    // without server-side validation.
                    console.log(
                      "Start redemption:",
                      reservation.reservationCode,
                    );
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-4 text-sm font-black text-[#041007] transition hover:bg-[#4ADE80]"
                >
                  <ScanIcon />
                  Redeem this promo
                </button>

                <p className="mt-3 text-center text-[9px] leading-4 text-[#475569]">
                  Only redeem when you are at the restaurant and ready to use
                  the offer.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
                <p className="text-xs font-bold text-[#94A3B8]">
                  {reservation.status === "used"
                    ? "Promo already redeemed"
                    : "This reservation is no longer active"}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#475569]">
                  This reservation is kept in your history for reference.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ================================================================
   SUPPORTING COMPONENTS
================================================================ */

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config = {
    ready: {
      label: "READY",
      className:
        "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
    },
    upcoming: {
      label: "UPCOMING",
      className:
        "bg-[#94A3B8]/10 text-[#94A3B8] border-[#1F2937]",
    },
    used: {
      label: "USED",
      className: "bg-[#64748B]/10 text-[#64748B] border-[#1F2937]",
    },
    expired: {
      label: "EXPIRED",
      className: "bg-red-500/5 text-red-400 border-red-500/10",
    },
  };

  const item = config[status];

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black tracking-[0.08em] ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-3">
      <div className="flex items-center gap-1.5 text-[#475569]">
        {icon}

        <span className="text-[8px] font-bold uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-[10px] font-bold text-[#CBD5E1]">
        {value}
      </p>
    </div>
  );
}

function Instruction({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-[10px] font-black text-[#22C55E]">
        {number}
      </div>

      <div>
        <p className="text-xs font-bold text-[#CBD5E1]">{title}</p>

        <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
          {description}
        </p>
      </div>
    </div>
  );
}

function EmptyReservations({ filter }: { filter: Filter }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#263241] bg-[#0F172A] px-5 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-2xl">
        {filter === "active" ? "🎟️" : "🗂️"}
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#F8FAFC]">
        {filter === "active"
          ? "No active reservations"
          : "No reservation history"}
      </h3>

      <p className="mx-auto mt-1.5 max-w-xs text-[10px] leading-5 text-[#64748B]">
        {filter === "active"
          ? "Discover a place and reserve one of its promos to see it here."
          : "Promos you use will appear here."}
      </p>
    </div>
  );
}

/* ================================================================
   ICONS
================================================================ */

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 9h18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 7V5a1 1 0 0 1 1-1h2" />
      <path d="M17 4h2a1 1 0 0 1 1 1v2" />
      <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
      <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
      <path d="M7 12h10" />
      <path d="M7 9h4" />
      <path d="M13 15h4" />
    </svg>
  );
}