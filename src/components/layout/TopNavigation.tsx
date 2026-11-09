"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/core/state/profileStore";
import { ChevronDown, Plus, User, ArrowRightLeft } from "lucide-react";

export function TopNavigation() {
  const pathname = usePathname();
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    getActiveProfile,
    displayUnit,
    toggleDisplayUnit,
  } = useProfileStore();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const activeProfile = getActiveProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-surface/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg tracking-tight group-hover:bg-accent-hover transition-colors shadow-xs">
              W
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-text-primary leading-none">
                Wear<span className="text-accent">Id</span>
              </span>
              <span className="text-[10px] text-text-secondary tracking-wide uppercase font-medium mt-0.5 hidden sm:inline-block">
                Universal Fit
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/app"
              className={`min-h-[44px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Passport
            </Link>
            <Link
              href="/app/recommend"
              className={`min-h-[44px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname.startsWith("/app/recommend")
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Size Matcher
            </Link>
            <Link
              href="/app/explore"
              className={`min-h-[44px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app/explore"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Pilot Brands
            </Link>
            <Link
              href="/app/tailor"
              className={`min-h-[44px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app/tailor"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Tailor Card
            </Link>
          </nav>
        </div>

        {/* Right Controls: Unit Toggle & Profile Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Unit Toggle Switch */}
          <button
            onClick={toggleDisplayUnit}
            type="button"
            className="min-h-[44px] min-w-[44px] px-3 rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors inline-flex items-center gap-1.5 text-xs font-medium text-text-primary shadow-xs"
            title={`Current display unit: ${displayUnit}. Click to toggle.`}
            aria-label={`Toggle display unit, currently ${displayUnit}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-text-secondary" />
            <span className="font-semibold uppercase tracking-wider">{displayUnit}</span>
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              type="button"
              className="min-h-[44px] px-3.5 rounded-btn bg-bg-surface border border-border-strong hover:bg-bg-elevated transition-colors inline-flex items-center gap-2 text-sm text-text-primary shadow-xs"
              aria-expanded={isProfileMenuOpen}
              aria-label="Active profile selector"
            >
              <div className="w-6 h-6 rounded-full bg-accent-subtle text-accent flex items-center justify-center text-xs font-semibold">
                {activeProfile.name.charAt(0)}
              </div>
              <span className="font-medium max-w-[110px] truncate hidden sm:inline-block">
                {activeProfile.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-card border border-border bg-bg-surface shadow-md py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-border mb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-text-secondary">
                      Switch Clothing Identity
                    </span>
                  </div>

                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveProfileId(p.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center justify-between hover:bg-bg-elevated transition-colors ${
                        p.id === activeProfileId ? "bg-accent-subtle/30 text-accent font-semibold" : "text-text-primary"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-text-secondary" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">{p.name}</span>
                          <span className="text-[11px] text-text-secondary capitalize mt-0.5">
                            {p.relation} · {p.measurements.chestMm ? `${p.measurements.chestMm / 10}cm chest` : "Incomplete"}
                          </span>
                        </div>
                      </div>
                      {p.id === activeProfileId && (
                        <span className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </button>
                  ))}

                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-semibold text-accent hover:bg-accent-subtle/40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Fit Profile
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
