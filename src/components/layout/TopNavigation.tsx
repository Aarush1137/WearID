"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfileStore } from "@/core/state/profileStore";
import { useAuthStore } from "@/lib/auth/authStore";
import {
  ChevronDown,
  Plus,
  User,
  ArrowRightLeft,
  LogIn,
  LogOut,
  ShieldCheck,
  Users,
  Sparkles,
  MessageSquarePlus,
  UserPlus,
  MoreHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { AuthModal } from "@/components/auth/AuthModal";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { InviteModal } from "@/components/invite/InviteModal";

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

  const { user, isAuthenticated, signOut, initAuth } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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

          {/* Navigation Links (Desktop: Decluttered & Focused) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/app"
              className={`min-h-[40px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Passport
            </Link>
            <Link
              href="/app/recommendations"
              className={`min-h-[40px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname.startsWith("/app/recommend")
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Size Matcher
            </Link>
            <Link
              href="/app/compare"
              className={`min-h-[40px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app/compare"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Compare
            </Link>
            <Link
              href="/app/explore"
              className={`min-h-[40px] px-3.5 inline-flex items-center text-sm font-medium rounded-btn transition-colors ${
                pathname === "/app/explore"
                  ? "text-accent bg-accent-subtle/50 font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
            >
              Brands
            </Link>

            {/* Tools Dropdown for Secondary Features */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`min-h-[40px] px-3 inline-flex items-center gap-1 text-sm font-medium rounded-btn transition-colors ${
                  pathname === "/app/tailor" ||
                  pathname === "/app/profile" ||
                  pathname === "/app/privacy-settings" ||
                  pathname === "/sandbox/retailer"
                    ? "text-accent bg-accent-subtle/50 font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
                aria-expanded={isMoreMenuOpen}
              >
                <span>Tools</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMoreMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 rounded-card border border-border bg-bg-surface shadow-md py-1.5 z-50 max-h-[80vh] overflow-y-auto">
                    <Link
                      href="/app/assistant"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span className="font-semibold text-accent">AI Fit Assistant</span>
                      <span className="text-[10px] text-accent font-semibold px-1.5 py-0.5 rounded-badge bg-accent-subtle">AI</span>
                    </Link>
                    <Link
                      href="/app/quick-lookup"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>What Size Am I?</span>
                      <span className="text-[10px] text-text-secondary">Instant</span>
                    </Link>
                    <Link
                      href="/app/outfits"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Outfit Builder</span>
                      <span className="text-[10px] text-text-secondary">Ensemble</span>
                    </Link>
                    <Link
                      href="/app/wardrobe"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>My Wardrobe Closet</span>
                      <span className="text-[10px] text-text-secondary">Calibrate</span>
                    </Link>
                    <Link
                      href="/app/wishlist"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Saved Wishlist</span>
                      <span className="text-[10px] text-text-secondary">Saved</span>
                    </Link>
                    <div className="border-t border-border my-1" />
                    <Link
                      href="/app/family"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Family Size Matrix</span>
                      <span className="text-[10px] text-text-secondary">Family</span>
                    </Link>
                    <Link
                      href="/app/ease-guide"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Visual Ease Guide</span>
                      <span className="text-[10px] text-text-secondary">Silhouettes</span>
                    </Link>
                    <Link
                      href="/app/brand-requests"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Vote on Brands</span>
                      <span className="text-[10px] text-text-secondary">Community</span>
                    </Link>
                    <Link
                      href="/app/history"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Measurement Trends</span>
                      <span className="text-[10px] text-text-secondary">History</span>
                    </Link>
                    <div className="border-t border-border my-1" />
                    <Link
                      href="/app/tailor"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Tailor Card & PDF</span>
                      <span className="text-[10px] text-text-secondary">Export</span>
                    </Link>
                    <Link
                      href="/app/profile"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Profile & Biometrics</span>
                      <span className="text-[10px] text-text-secondary">Manage</span>
                    </Link>
                    <Link
                      href="/app/privacy-settings"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                    >
                      <span>Privacy & Tokens</span>
                      <span className="text-[10px] text-text-secondary">Keys</span>
                    </Link>
                    <div className="border-t border-border my-1" />
                    <Link
                      href="/sandbox/retailer"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 flex items-center justify-between text-xs font-medium text-accent hover:bg-accent-subtle/40 transition-colors"
                    >
                      <span>Connect Retailer Sandbox</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">Demo</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Right Controls: Unit Toggle, Theme Toggle & Profile Switcher (Decluttered) */}
        <div className="flex items-center gap-2">

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

          {/* Language Selector (EN / HI) */}
          <LanguageSelector variant="minimal" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Authentication Button or Active Profile Menu */}
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="min-h-[44px] px-3.5 rounded-btn bg-accent text-white hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                type="button"
                className="min-h-[44px] px-3.5 rounded-btn bg-bg-surface border border-border-strong hover:bg-bg-elevated transition-colors inline-flex items-center gap-2 text-sm text-text-primary shadow-xs"
                aria-expanded={isProfileMenuOpen}
                aria-label="Active profile selector and account menu"
              >
                <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold">
                  {user?.fullName?.charAt(0) || activeProfile.name.charAt(0) || "U"}
                </div>
                <span className="font-medium max-w-[110px] truncate hidden sm:inline-block">
                  {activeProfile.name || user?.fullName || "Account"}
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
                  <div className="absolute right-0 mt-2 w-72 rounded-card border border-border bg-bg-surface shadow-md py-2 z-50">
                    {/* User Account Header */}
                    <div className="px-3.5 py-2 border-b border-border mb-1 bg-bg-elevated/40">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sovereign Identity</span>
                      </div>
                      <span className="text-xs font-medium text-text-primary block truncate mt-0.5">
                        {user?.email || user?.phone || user?.fullName}
                      </span>
                    </div>

                    <div className="px-3 py-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                        Switch Identity ({profiles.length})
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
                            <span className="text-sm font-medium leading-none">{p.name || "Unnamed"}</span>
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

                    {/* Suggested Addition: Partner Profile (shown as an option, not auto-added) */}
                    {profiles.length === 1 && (
                      <div className="mx-3 my-2 p-2.5 rounded-btn bg-accent-subtle/30 border border-accent/20">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-primary">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          <span>Shop for a partner?</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-0.5 mb-2 leading-relaxed">
                          Add a partner or family member to carry their clothing sizing everywhere.
                        </p>
                        <Link
                          href="/onboarding?mode=add_member"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-btn bg-bg-surface hover:bg-bg-elevated border border-border text-[11px] font-semibold text-accent transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Partner Profile</span>
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-border mt-1 pt-1 space-y-0.5">
                      <Link
                        href="/app/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-semibold text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <User className="w-4 h-4 text-accent" />
                        Account & Profiles
                      </Link>

                      <Link
                        href="/onboarding?mode=add_member"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-semibold text-accent hover:bg-accent-subtle/40 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        + Add Partner or Family Member
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsInviteOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <UserPlus className="w-4 h-4 text-accent" />
                        Invite Friends & Family
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsFeedbackOpen(true);
                        }}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <MessageSquarePlus className="w-4 h-4 text-accent" />
                        Submit Beta Feedback
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("wearid_tutorial_completed");
                            window.location.reload();
                          }
                        }}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-accent" />
                        Replay Guided Tour
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] flex items-center gap-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </header>
  );
}
