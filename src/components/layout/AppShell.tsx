"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";
import { TopNavigation } from "./TopNavigation";
import { BottomTabBar } from "./BottomTabBar";
import { ShieldCheck } from "lucide-react";

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, initAuth, touchSession, checkSessionExpiry } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    initAuth().then(() => {
      if (isMounted) {
        touchSession();
        checkSessionExpiry();
        setHasInitialized(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [initAuth, touchSession, checkSessionExpiry]);

  // Mandatory Authentication Guard
  useEffect(() => {
    if (!hasInitialized || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [hasInitialized, isLoading, requireAuth, isAuthenticated, pathname, router]);

  // Loading state while verifying cryptographic session
  if (requireAuth && (!hasInitialized || isLoading || !isAuthenticated)) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-base text-text-primary items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-accent-subtle/80 text-accent flex items-center justify-center shadow-xs border border-accent/20 animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-semibold text-sm text-text-primary">
            Verifying Sovereign Identity...
          </span>
          <p className="text-xs text-text-secondary">
            Loading encrypted size passport session and biometric keys.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary">
      <TopNavigation />
      <main className="flex-1 pb-20 md:pb-12 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
