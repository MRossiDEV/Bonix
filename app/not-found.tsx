import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-6 text-center text-[#FAFAFA]">
      <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-[#9CA3AF]">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-2xl bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-[#121212]"
        >
          Back to home
        </Link>
        <Link
          href="/feed"
          className="rounded-2xl border border-[#2A2A2A] px-6 py-3 text-sm text-[#FAFAFA]"
        >
          Browse the feed
        </Link>
      </div>
    </main>
  );
}
