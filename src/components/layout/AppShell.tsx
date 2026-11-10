"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TopNavigation } from "./TopNavigation";
import { BottomTabBar } from "./BottomTabBar";
import { useAuthStore } from "@/lib/auth/authStore";

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    hasInitialized,
    isLoading,
    touchSession,
    checkSessionExpiry,
  } = useAuthStore();

  useEffect(() => {
    // Non-blocking background session check & activity heartbeat
    touchSession();
    checkSessionExpiry();

    if (requireAuth && hasInitialized && !isLoading && !isAuthenticated) {
      router.replace(
        `/login?returnUrl=${encodeURIComponent(pathname || "/app")}`
      );
    }
  }, [
    requireAuth,
    hasInitialized,
    isLoading,
    isAuthenticated,
    pathname,
    router,
    touchSession,
    checkSessionExpiry,
  ]);

  if (requireAuth && hasInitialized && !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-base text-text-primary items-center justify-center p-6">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-text-secondary">
          Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary">
      <TopNavigation />
      <main className="flex-1 pb-20 md:pb-12 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 animate-in fade-in duration-150">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
