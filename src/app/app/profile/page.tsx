"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/auth/authStore";
import { useProfileStore } from "@/core/state/profileStore";
import { formatMeasurement } from "@/core/formatters";
import {
  User,
  ShieldCheck,
  Users,
  Sliders,
  Ruler,
  LogOut,
  LogIn,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shirt,
  Scissors,
  Lock,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, signOut, signInWithTestAccount } = useAuthStore();
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    getActiveProfile,
    displayUnit,
    setDisplayUnit,
    updatePreference,
    addProfile,
  } = useProfileStore();

  const activeProfile = getActiveProfile();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelation, setNewMemberRelation] = useState<"partner" | "child" | "parent" | "other">("partner");
  const [newMemberGender, setNewMemberGender] = useState<"male" | "female" | "unisex">("female");
  const [signoutFeedback, setSignoutFeedback] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setSignoutFeedback(true);
    setTimeout(() => {
      setSignoutFeedback(false);
      router.push("/login");
    }, 1000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newId = addProfile({
      name: newMemberName.trim(),
      relation: newMemberRelation,
      gender: newMemberGender,
      measurements: {
        profileId: `profile_${Date.now()}`,
        chestMm: newMemberGender === "female" ? 880 : 960,
        waistMm: newMemberGender === "female" ? 720 : 820,
        hipsMm: newMemberGender === "female" ? 940 : 940,
        heightMm: newMemberGender === "female" ? 1630 : 1750,
        isCurrent: true,
      },
      preferences: {
        t_shirt: "regular",
        shirt_casual: "relaxed",
        jeans: "regular",
      },
      referenceGarments: [],
    });

    setActiveProfileId(newId);
    setNewMemberName("");
    setIsAddMemberOpen(false);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
        {/* Page Title */}
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-badge bg-accent-subtle/80 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
            <User className="w-3.5 h-3.5" />
            Account & Identity Center
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-text-primary">
            Profile & Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your personal size passport, switch between family members, and control your measurements.
          </p>
        </div>

        {/* 1. Account & Identity Status Card */}
        <section className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-display text-2xl shrink-0 shadow-sm">
                {user?.fullName?.charAt(0) || activeProfile.name.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg text-text-primary">
                    {isAuthenticated
                      ? user?.fullName || activeProfile.name
                      : `${activeProfile.name || "Guest User"} (Guest Mode)`}
                  </h2>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-badge bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {isAuthenticated ? "Signed In" : "Local Storage"}
                  </span>
                </div>
                <span className="text-xs text-text-secondary block mt-0.5">
                  {isAuthenticated
                    ? user?.email || user?.phone || "Verified Identity"
                    : "Measurements stored only on this browser"}
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    AES-256-GCM Encrypted at Rest
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-[44px] px-4 rounded-btn border border-border-strong bg-bg-surface hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 text-rose-600 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn-primary min-h-[44px] px-4 text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}
            </div>
          </div>

          {signoutFeedback && (
            <div className="mt-4 p-3 rounded-card bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Signed out successfully. Returning to login...</span>
            </div>
          )}

          {/* Guest Mode Conversion Banner */}
          {!isAuthenticated && (
            <div className="mt-6 p-4 rounded-card bg-accent-subtle/40 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-xs text-text-primary block">
                  Carry your size across all devices
                </span>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Sign in with mobile phone OTP or Google to sync your size passport and unlock one-click checkout.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => signInWithTestAccount("+917722890254")}
                  className="text-xs font-semibold text-accent hover:underline px-2.5 py-1.5"
                >
                  Quick Test Login
                </button>
                <Link
                  href="/login"
                  className="btn-primary min-h-[38px] px-3.5 text-xs font-semibold shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 2. Multi-Member Family Profile Manager */}
        <section className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="font-semibold text-base text-text-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Family & Member Profiles ({profiles.length})
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Switch active profile to size garments for yourself, your partner, or family members.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-accent-subtle/50 hover:bg-accent-subtle transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`p-4 rounded-card border cursor-pointer transition-all flex flex-col justify-between min-h-[120px] ${
                    isActive
                      ? "border-accent bg-accent-subtle/30 ring-1 ring-accent shadow-xs"
                      : "border-border bg-bg-elevated/40 hover:bg-bg-elevated hover:border-accent/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold">
                          {p.name.charAt(0) || "U"}
                        </div>
                        <span className="font-semibold text-sm text-text-primary">
                          {p.name}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-badge bg-accent text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary capitalize block mt-2">
                      {p.relation} · {p.gender}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary">
                      Chest: {p.measurements.chestMm ? formatMeasurement(p.measurements.chestMm, displayUnit) : "Not set"}
                    </span>
                    <span className="text-accent font-semibold text-xs">
                      {isActive ? "Currently Sizing" : "Tap to Switch"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Family Member Modal */}
          {isAddMemberOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-bg-surface border border-border rounded-card p-6 max-w-md w-full shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-semibold text-base text-text-primary flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Add Family Member Profile
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="text-text-tertiary hover:text-text-primary text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Member Name
                    </label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="e.g. Maya, Kabir, Dad"
                      className="input-editorial w-full"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Relation
                      </label>
                      <select
                        value={newMemberRelation}
                        onChange={(e) => setNewMemberRelation(e.target.value as any)}
                        className="input-editorial w-full"
                      >
                        <option value="partner">Partner</option>
                        <option value="child">Child / Kid</option>
                        <option value="parent">Parent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-primary mb-1">
                        Gender / Morphology
                      </label>
                      <select
                        value={newMemberGender}
                        onChange={(e) => setNewMemberGender(e.target.value as any)}
                        className="input-editorial w-full"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setIsAddMemberOpen(false)}
                      className="px-3 py-2 rounded-btn border border-border text-xs font-semibold text-text-secondary hover:bg-bg-elevated"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newMemberName.trim()}
                      className="btn-primary px-4 py-2 text-xs font-semibold shadow-xs disabled:opacity-50"
                    >
                      Create Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* 3. Sizing & Display Preferences */}
        <section className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-xs">
          <div className="mb-6 pb-4 border-b border-border">
            <h2 className="font-semibold text-base text-text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              Sizing & Unit Preferences
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Customize how measurements are displayed and calibrated across all recommendation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Toggle */}
            <div className="p-4 rounded-card bg-bg-elevated/40 border border-border space-y-3">
              <div>
                <span className="font-semibold text-xs text-text-primary block">
                  Measurement Display Unit
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  Stored canonical in mm internally. Converted cleanly for display.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayUnit("cm")}
                  className={`p-2.5 rounded-btn border text-xs font-semibold transition-all ${
                    displayUnit === "cm"
                      ? "bg-accent text-white border-accent shadow-xs"
                      : "bg-bg-surface border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Centimeters (cm)
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayUnit("in")}
                  className={`p-2.5 rounded-btn border text-xs font-semibold transition-all ${
                    displayUnit === "in"
                      ? "bg-accent text-white border-accent shadow-xs"
                      : "bg-bg-surface border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Inches (in)
                </button>
              </div>
            </div>

            {/* Preferred Fit Style */}
            <div className="p-4 rounded-card bg-bg-elevated/40 border border-border space-y-3">
              <div>
                <span className="font-semibold text-xs text-text-primary block">
                  Default Fit Silhouette
                </span>
                <span className="text-[11px] text-text-secondary block mt-0.5">
                  How much breathing ease you prefer in everyday tops.
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(["slim", "regular", "relaxed", "oversized"] as const).map((fit) => {
                  const currentFit = activeProfile.preferences.t_shirt || "regular";
                  const isSel = currentFit === fit;
                  return (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updatePreference(activeProfile.id, "t_shirt", fit)}
                      className={`p-2 rounded-btn border text-xs capitalize font-semibold transition-all ${
                        isSel
                          ? "bg-accent text-white border-accent shadow-xs"
                          : "bg-bg-surface border-border text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {fit}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Quick Action Hub */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/app/measure"
            className="p-4 rounded-card border border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-elevated/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Ruler className="w-5 h-5 text-accent mb-2" />
              <span className="font-semibold text-sm text-text-primary block group-hover:text-accent transition-colors">
                Update Measurements
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Recalibrate tape measurements or add new dimensions.
              </span>
            </div>
            <span className="text-xs font-semibold text-accent inline-flex items-center gap-1 mt-3">
              Open Wizard <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/app/recommendations"
            className="p-4 rounded-card border border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-elevated/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Shirt className="w-5 h-5 text-accent mb-2" />
              <span className="font-semibold text-sm text-text-primary block group-hover:text-accent transition-colors">
                Size Matcher
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Test how verified brand garments fit your body.
              </span>
            </div>
            <span className="text-xs font-semibold text-accent inline-flex items-center gap-1 mt-3">
              Match Clothes <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/app/compare"
            className="p-4 rounded-card border border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-elevated/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Sparkles className="w-5 h-5 text-accent mb-2" />
              <span className="font-semibold text-sm text-text-primary block group-hover:text-accent transition-colors">
                Compare Brands
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Side-by-side sizing differences between brands.
              </span>
            </div>
            <span className="text-xs font-semibold text-accent inline-flex items-center gap-1 mt-3">
              Compare Sizing <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            href="/app/tailor"
            className="p-4 rounded-card border border-border bg-bg-surface hover:border-accent/40 hover:bg-bg-elevated/60 transition-all flex flex-col justify-between group"
          >
            <div>
              <Scissors className="w-5 h-5 text-accent mb-2" />
              <span className="font-semibold text-sm text-text-primary block group-hover:text-accent transition-colors">
                Tailor Card & Sheet
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Print or share cutting-table dimensions for tailors.
              </span>
            </div>
            <span className="text-xs font-semibold text-accent inline-flex items-center gap-1 mt-3">
              View Tailor Card <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </section>

        {/* 5. Privacy & Data Rights Card */}
        <div className="p-4 rounded-card bg-bg-elevated/40 border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-text-secondary">
            <Lock className="w-4 h-4 text-accent" />
            <span>Need to export your biometric archive or purge your data?</span>
          </div>
          <Link
            href="/app/privacy-settings"
            className="text-accent font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Privacy Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
