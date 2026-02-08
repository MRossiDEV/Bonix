"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const userId = data.user?.id;
      router.push(userId ? `/user/${userId}/feed` : "/feed");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set("next", "/feed");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo.toString(),
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#121212] px-6 py-16 text-[#FAFAFA]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[#FF7A00]/20 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-[260px] w-[260px] rounded-full bg-[#00E5A8]/15 blur-[120px]" />
      </div>

      <section className="relative mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold">Log in to Bonix</h1>
          <p className="text-sm text-[#9CA3AF]">
            Access your wallet, promos, and nearby deals.
          </p>
        </header>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm font-semibold text-[#FAFAFA] transition hover:border-[#FF7A00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="text-base">G</span>
          {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#FF7A00] focus:outline-none"
                placeholder="you@bonix.app"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FAFAFA] focus:border-[#FF7A00] focus:outline-none"
                placeholder="••••••••"
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-[#7B61FF]/40 bg-[#7B61FF]/15 px-4 py-3 text-xs text-[#FAFAFA]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#FF7A00] py-3 text-base font-semibold text-[#121212] transition hover:bg-[#ff8a22] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          <p className="mt-6 text-center text-xs text-[#9CA3AF]">
            New to Bonix?{" "}
            <Link href="/register" className="text-[#FF7A00]">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
