"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-6 text-center text-[#FAFAFA]">
      <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
        Something went wrong
      </p>
      <h1 className="mt-4 text-3xl font-semibold">We hit an unexpected error</h1>
      <p className="mt-3 max-w-md text-sm text-[#9CA3AF]">
        The page failed to load. You can try again, or head back to the feed.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-[#6B7280]">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-[#121212]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-[#2A2A2A] px-6 py-3 text-sm text-[#FAFAFA]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
