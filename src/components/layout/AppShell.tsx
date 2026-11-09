"use client";

import React from "react";
import { TopNavigation } from "./TopNavigation";
import { BottomTabBar } from "./BottomTabBar";

export function AppShell({ children }: { children: React.ReactNode }) {
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
