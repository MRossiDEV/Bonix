"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PromoFeed } from "@/app/components/PromoFeed";

const steps = [
  { id: 1, label: "Discover promos", detail: "Local spots, live today" },
  { id: 2, label: "Reserve on Bonix", detail: "Hold your table fast" },
  { id: 3, label: "Scan QR and save", detail: "Pay, scan, done" },
];

const trustPoints = [
  "You only pay for redeemed promos",
  "No subscriptions",
  "No fake numbers",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#FAFAFA] overflow-x-hidden pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#FF7A00]/20 blur-[120px]" />
        <div className="absolute top-[35%] -left-24 h-[320px] w-[320px] rounded-full bg-[#7B61FF]/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[280px] w-[280px] rounded-full bg-[#00E5A8]/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_55%)]" />
      </div>

      <section className="relative flex h-screen flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-sm uppercase tracking-[0.4em] text-[#9CA3AF]"
        >
          montevideo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-6xl font-semibold lowercase text-[#FF7A00]"
        >
          bonix
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-3xl font-semibold"
        >
          Save money where you already eat
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-3 text-base text-[#9CA3AF]"
        >
          Exclusive promos. Scan. Eat. Save.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 w-full max-w-sm space-y-4"
        >
          <Link
            href="/install"
            className="block w-full rounded-2xl bg-[#FF7A00] py-4 text-lg font-semibold text-[#121212]"
          >
            Get Bonix
          </Link>
          <Link
            href="/install"
            className="block w-full rounded-2xl border border-[#2A2A2A] py-4 text-center text-[#FAFAFA]"
          >
            I'm a business
          </Link>
        </motion.div>
      </section>

      <PromoFeed
        title="Preview the feed"
        subtitle="Real promos, read-only preview mode"
        limit={5}
        showViewAll
        compact
      />

      <section className="relative px-6 py-16">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF7A00] text-sm font-semibold text-[#121212]">
                  {step.id}
                </span>
                <p className="text-lg font-semibold">{step.label}</p>
              </div>
              <p className="mt-3 text-sm text-[#9CA3AF]">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="text-6xl font-semibold text-[#00E5A8]"
        >
          2%
        </motion.p>
        <p className="mt-3 text-base text-[#9CA3AF]">
          Cashback on every cash payment
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                Bonix wallet
              </p>
              <p className="mt-2 text-2xl font-semibold">$1,480</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#7B61FF]/30" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[#121212] px-4 py-3">
              <span className="text-sm text-[#9CA3AF]">Pocitos Grill</span>
              <span className="text-sm text-[#00E5A8]">+ $2.40</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#121212] px-4 py-3">
              <span className="text-sm text-[#9CA3AF]">Cafe Centro</span>
              <span className="text-sm text-[#00E5A8]">+ $1.60</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16">
        <h2 className="text-xl font-semibold">Built for merchants</h2>
        <div className="mt-6 space-y-3">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-5 py-4"
            >
              <span className="text-sm text-[#FAFAFA]">{point}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-12">
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6 text-center">
          <p className="text-lg font-semibold">Ready to save tonight?</p>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Install Bonix in seconds.
          </p>
          <Link
            href="/install"
            className="mt-6 block w-full rounded-2xl bg-[#FF7A00] py-4 text-lg font-semibold text-[#121212]"
          >
            Get Bonix
          </Link>
        </div>
      </section>

      <section className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#2A2A2A] bg-[#121212]/95 p-4 backdrop-blur">
        <Link
          href="/install"
          className="block w-full rounded-2xl bg-[#FF7A00] py-4 text-base font-semibold text-[#121212]"
        >
          Install Bonix
        </Link>
      </section>
    </main>
  );
}
