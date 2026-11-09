"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCheck, Sparkles, Compass, Share2 } from "lucide-react";

export function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Passport",
      href: "/app",
      icon: UserCheck,
      isActive: pathname === "/app",
    },
    {
      name: "Measure",
      href: "/onboarding",
      icon: Sparkles,
      isActive: pathname === "/onboarding",
    },
    {
      name: "Match",
      href: "/app/recommend",
      icon: Compass,
      isActive: pathname.startsWith("/app/recommend"),
    },
    {
      name: "Tailor",
      href: "/app/tailor",
      icon: Share2,
      isActive: pathname === "/app/tailor",
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface/95 backdrop-blur-md border-t border-border shadow-lg"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors ${
                tab.isActive
                  ? "text-accent font-semibold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none tracking-tight">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
