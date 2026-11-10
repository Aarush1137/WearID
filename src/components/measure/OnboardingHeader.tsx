"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/core/state/profileStore";
import { useAuthStore } from "@/lib/auth/authStore";
import { ArrowRight, Sparkles } from "lucide-react";

export function OnboardingHeader() {
  const router = useRouter();
  const { getActiveProfile, updateProfile } = useProfileStore();
  const { user } = useAuthStore();

  const handleSkipToPassport = (e: React.MouseEvent) => {
    e.preventDefault();
    const active = getActiveProfile();

    // Ensure active profile has a valid name and baseline measurements to avoid redirect loops
    if (!active.name || active.name.trim() === "") {
      updateProfile(active.id, {
        name: user?.fullName || "My Size Passport",
        gender: "male",
      });
    }

    router.push("/app");
  };

  return (
    <header className="border-b border-border bg-bg-surface/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg shadow-xs group-hover:bg-accent-hover transition-colors">
          W
        </span>
        <div className="flex flex-col">
          <span className="font-semibold text-lg tracking-tight text-text-primary leading-none">
            Wear<span className="text-accent">Id</span>
          </span>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium mt-0.5">
            Universal Fit
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleSkipToPassport}
        className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors min-h-[44px] px-3.5 py-2 rounded-btn hover:bg-accent-subtle/50 inline-flex items-center gap-1.5 shadow-xs"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Skip to Passport</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </header>
  );
}
