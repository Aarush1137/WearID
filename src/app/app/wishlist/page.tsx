"use client";

import React from "react";
import Link from "next/link";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { useProfileStore } from "@/core/state/profileStore";

export default function WishlistPage() {
  const { profiles, activeProfileId, setActiveProfileId } = useProfileStore();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/app" className="hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">Wishlist & Saved Items</span>
      </nav>

      {/* Profile Selector if multiple profiles exist */}
      {profiles.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Active Profile:</span>
          <div className="flex gap-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveProfileId(p.id)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  p.id === activeProfileId
                    ? "bg-[#1B2A4A] text-white dark:bg-blue-600"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {p.name || (p.relation === "self" ? "Primary User" : p.relation)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Wishlist View */}
      <WishlistView />
    </div>
  );
}
