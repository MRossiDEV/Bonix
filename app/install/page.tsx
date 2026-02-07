"use client";

import Link from "next/link";
import { useState } from "react";

import { usePwaInstallPrompt } from "@/app/components/usePwaInstallPrompt";

export default function InstallPage() {
  const { promptInstall } = usePwaInstallPrompt();
  const [requested, setRequested] = useState(false);

  const handleInstall = async () => {
    const prompted = await promptInstall();
    setRequested(true);
    if (!prompted) {
      window.location.href = "/install#manual";
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-20 pt-12 text-[#FAFAFA]">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">Install</p>
        <h1 className="mt-4 text-3xl font-semibold">Get Bonix on your home screen</h1>
        <p className="mt-3 text-sm text-[#9CA3AF]">
          Unlock real promos, reserve tables, and start saving instantly.
        </p>

        <button
          type="button"
          className="mt-8 w-full rounded-2xl bg-[#FF7A00] py-4 text-base font-semibold text-[#121212]"
          onClick={handleInstall}
        >
          Install Bonix
        </button>

        <div className="mt-6 rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-5 text-left">
          <p className="text-sm font-semibold">No prompt?</p>
          <ol className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
            <li id="manual">1. Open your browser menu.</li>
            <li>2. Tap "Add to Home Screen" or "Install App".</li>
            <li>3. Confirm to finish.</li>
          </ol>
          {requested ? (
            <p className="mt-3 text-xs text-[#9CA3AF]">
              If you dismissed the prompt, you can reopen it from the menu.
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/feed"
            className="rounded-2xl border border-[#2A2A2A] py-3 text-sm text-[#FAFAFA]"
          >
            Continue browsing
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] text-[#00E5A8]"
          >
            Back to landing
          </Link>
        </div>
      </div>
    </main>
  );
}
