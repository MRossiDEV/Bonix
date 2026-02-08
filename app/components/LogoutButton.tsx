"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
  redirectTo?: string;
  children?: ReactNode;
};

export function LogoutButton({
  className,
  redirectTo = "/login",
  children = "Logout",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Logout failed.", error);
      }
    } finally {
      router.replace(redirectTo);
      router.refresh();
      setIsSigningOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      disabled={isSigningOut}
    >
      {children}
    </button>
  );
}
