"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type TransactionType = "cashback" | "spent" | "pending" | "refund";

type WalletTransaction = {
  id: string;
  type: TransactionType;
  merchantName: string;
  description: string;
  amount: number;
  purchaseAmount?: number;
  date: string;
  status: "confirmed" | "pending";
  emoji: string;
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-1",
    type: "cashback",
    merchantName: "La Cocina Verde",
    description: "2% cashback · Purchase confirmed",
    amount: 8.4,
    purchaseAmount: 420,
    date: "Today · 12:42",
    status: "confirmed",
    emoji: "🍃",
  },
  {
    id: "tx-2",
    type: "spent",
    merchantName: "Bonix Promo",
    description: "Credits used",
    amount: -12,
    date: "Today · 09:18",
    status: "confirmed",
    emoji: "🎟️",
  },
  {
    id: "tx-3",
    type: "cashback",
    merchantName: "Montevideo Brew",
    description: "2% cashback · Purchase confirmed",
    amount: 5.2,
    purchaseAmount: 260,
    date: "Yesterday · 16:24",
    status: "confirmed",
    emoji: "☕",
  },
  {
    id: "tx-4",
    type: "pending",
    merchantName: "Casa Nómada",
    description: "Cashback pending confirmation",
    amount: 6.8,
    purchaseAmount: 340,
    date: "Yesterday · 21:05",
    status: "pending",
    emoji: "🏡",
  },
  {
    id: "tx-5",
    type: "cashback",
    merchantName: "Barrio Fitness",
    description: "2% cashback · Purchase confirmed",
    amount: 4.5,
    purchaseAmount: 225,
    date: "Aug 28 · 10:42",
    status: "confirmed",
    emoji: "🏋️",
  },
  {
    id: "tx-6",
    type: "spent",
    merchantName: "Bonix Promo",
    description: "Credits used",
    amount: -20,
    date: "Aug 27 · 19:20",
    status: "confirmed",
    emoji: "🎟️",
  },
];

const CURRENT_BALANCE = 248.6;

export default function UserWalletPage() {
  const params = useParams<{ userId?: string | string[] }>();

  const userId = Array.isArray(params?.userId)
    ? params.userId[0]
    : params?.userId ?? "";

  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [showAll, setShowAll] = useState(false);

  const pendingCashback = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "pending")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions],
  );

  const totalEarned = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "cashback")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions],
  );

  const totalSpent = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "spent")
        .reduce((total, transaction) => total + Math.abs(transaction.amount), 0),
    [transactions],
  );

  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, 4);

  return (
    <section className="space-y-6 pb-8">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="px-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
            Bonix credits
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#F8FAFC]">
          Wallet
        </h1>

        <p className="mt-1 text-xs text-[#64748B]">
          Earn 2% back every time a Bonix purchase is confirmed.
        </p>
      </div>

      {/* ============================================================
          MAIN BALANCE CARD
      ============================================================ */}

      <div className="mx-4 overflow-hidden rounded-[32px] border border-[#22C55E]/20 bg-gradient-to-br from-[#12291B] via-[#0F172A] to-[#0B0F14]">
        <div className="relative p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22C55E]/10 blur-[60px]" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
                Available balance
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight text-[#F8FAFC]">
                  ${CURRENT_BALANCE.toFixed(2)}
                </span>

                <span className="text-xs font-bold text-[#22C55E]">
                  BONIX
                </span>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-xl">
              ◈
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2">
            <MiniBalance
              label="Pending"
              value={`$${pendingCashback.toFixed(2)}`}
              description="Awaiting confirmation"
            />

            <MiniBalance
              label="Earned"
              value={`$${totalEarned.toFixed(2)}`}
              description="Cashback received"
            />
          </div>
        </div>

        <div className="border-t border-[#22C55E]/10 bg-[#0B0F14]/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/10 text-[9px] text-[#22C55E]">
              %
            </span>

            <p className="text-[10px] text-[#64748B]">
              You earn <strong className="text-[#CBD5E1]">2%</strong> of every
              confirmed purchase made through Bonix.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          SPENDABLE BALANCE
      ============================================================ */}

      <div className="mx-4 grid grid-cols-2 gap-3">
        <StatCard
          icon="💰"
          label="Available"
          value={`$${CURRENT_BALANCE.toFixed(2)}`}
          description="Ready to use"
        />

        <StatCard
          icon="↗"
          label="Total spent"
          value={`$${totalSpent.toFixed(2)}`}
          description="Bonix credits"
        />
      </div>

      {/* ============================================================
          HOW CASHBACK WORKS
      ============================================================ */}

      <div className="mx-4 overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-lg">
              ✨
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">
                How your 2% works
              </h2>

              <p className="mt-1 text-[10px] leading-5 text-[#64748B]">
                Every confirmed purchase made through a Bonix promo gives you
                2% back as Bonix Credit.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <CashbackStep
              number="01"
              title="Reserve a promo"
              description="Choose an offer from a Bonix merchant."
            />

            <CashbackStep
              number="02"
              title="Make your purchase"
              description="Use the promo at the restaurant or business."
            />

            <CashbackStep
              number="03"
              title="Purchase gets confirmed"
              description="The merchant confirms the transaction."
            />

            <CashbackStep
              number="04"
              title="Get 2% back"
              description="Your Bonix Credit is added to your wallet."
            />
          </div>
        </div>
      </div>

      {/* ============================================================
          TRANSACTION HISTORY
      ============================================================ */}

      <div className="space-y-3 px-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Activity
            </p>

            <h2 className="mt-1 text-base font-bold text-[#F8FAFC]">
              Spending history
            </h2>
          </div>

          <span className="text-[9px] text-[#475569]">
            {transactions.length} transactions
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
          <AnimatePresence initial={false}>
            {visibleTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <TransactionRow transaction={transaction} />

                {index < visibleTransactions.length - 1 ? (
                  <div className="mx-4 border-t border-[#1F2937]" />
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>

          {transactions.length > 4 ? (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="w-full border-t border-[#1F2937] px-4 py-3.5 text-center text-[10px] font-bold text-[#22C55E] transition hover:bg-[#111827]"
            >
              {showAll ? "Show less" : "View all transactions"}
            </button>
          ) : null}
        </div>
      </div>

      {/* ============================================================
          USE CREDITS CTA
      ============================================================ */}

      <div className="mx-4 rounded-3xl border border-[#1F2937] bg-gradient-to-br from-[#111827] to-[#0F172A] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-lg">
            🏙️
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-[#F8FAFC]">
              Put your credits to work
            </p>

            <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
              Use your Bonix Credit when reserving eligible promos.
            </p>
          </div>
        </div>

        <Link
          href={`${userId ? `/user/${userId}` : ""}/feed`}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-3.5 text-xs font-black text-[#041007] transition hover:bg-[#4ADE80]"
        >
          Discover promos
          <ArrowIcon />
        </Link>
      </div>

      {/* ============================================================
          FOOTNOTE
      ============================================================ */}

      <p className="px-6 text-center text-[9px] leading-4 text-[#475569]">
        Bonix Credit is a platform reward balance. Cashback is issued after
        eligible purchases are confirmed by the merchant.
      </p>
    </section>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function MiniBalance({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14]/50 p-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#475569]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#CBD5E1]">{value}</p>

      <p className="mt-0.5 text-[8px] text-[#475569]">{description}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>

        <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#475569]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-lg font-black text-[#F8FAFC]">{value}</p>

      <p className="mt-0.5 text-[9px] text-[#64748B]">{description}</p>
    </div>
  );
}

function CashbackStep({
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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[8px] font-black text-[#22C55E]">
        {number}
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-bold text-[#CBD5E1]">{title}</p>

        <p className="mt-0.5 text-[9px] leading-4 text-[#64748B]">
          {description}
        </p>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: WalletTransaction;
}) {
  const isPositive =
    transaction.type === "cashback" || transaction.type === "refund";

  const isPending = transaction.status === "pending";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          isPending
            ? "bg-amber-500/10"
            : isPositive
              ? "bg-[#22C55E]/10"
              : "bg-[#111827]"
        }`}
      >
        <span className="text-lg">{transaction.emoji}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-bold text-[#CBD5E1]">
            {transaction.merchantName}
          </p>

          {isPending ? (
            <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[7px] font-bold text-amber-400">
              PENDING
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-[9px] text-[#64748B]">
          {transaction.description}
        </p>

        <p className="mt-0.5 text-[8px] text-[#475569]">
          {transaction.date}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-xs font-black ${
            isPending
              ? "text-amber-400"
              : isPositive
                ? "text-[#22C55E]"
                : "text-[#CBD5E1]"
          }`}
        >
          {isPositive ? "+" : ""}
          ${Math.abs(transaction.amount).toFixed(2)}
        </p>

        {transaction.purchaseAmount ? (
          <p className="mt-0.5 text-[8px] text-[#475569]">
            from ${transaction.purchaseAmount.toFixed(2)}
          </p>
        ) : null}
      </div>
    </div>
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