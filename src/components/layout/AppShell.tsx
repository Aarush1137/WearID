"use client";

import React, { useEffect } from "react";
import { TopNavigation } from "./TopNavigation";
import { BottomTabBar } from "./BottomTabBar";
import { useAuthStore } from "@/lib/auth/authStore";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const { touchSession, checkSessionExpiry } = useAuthStore();

  useEffect(() => {
    // Non-blocking background session check & activity heartbeat
    touchSession();
    checkSessionExpiry();
  }, [touchSession, checkSessionExpiry]);

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
