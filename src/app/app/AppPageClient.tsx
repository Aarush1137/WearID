"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PassportHeroCard } from "@/components/passport/PassportHeroCard";
import { PILOT_BRANDS } from "@/core/data/pilotBrands";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useProfileStore } from "@/core/state/profileStore";
import { GuidedTutorialModal } from "@/components/tutorial/GuidedTutorialModal";

export function AppPageClient() {
  const router = useRouter();
  const { getActiveProfile } = useProfileStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const activeProfile = getActiveProfile();
    if (!activeProfile?.name) {
      router.replace("/onboarding");
      return;
    }

    // Check if first-time user has completed the tutorial
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("wearid_tutorial_completed");
      if (!completed) {
        setShowTutorial(true);
      }
    }
  }, [getActiveProfile, router]);

  return (
    <AppShell>
      {/* Mandatory First-Time Onboarding Tutorial */}
      <GuidedTutorialModal
        isOpen={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />

      <div className="space-y-8">
        {/* Active Profile Biometric Passport */}
        <PassportHeroCard />

        {/* Brand Sizing Quick Strip */}
        <section className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-lg text-text-primary">
                Explore Brands
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Top apparel brands with verified size specifications calibrated to your measurements.
              </p>
            </div>
            <Link
              href="/app/explore"
              className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 shrink-0"
            >
              Browse Full Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PILOT_BRANDS.map((brand) => (
              <Link
                key={brand.id}
                href="/app/recommend"
                className="p-3.5 rounded-card bg-bg-elevated/40 border border-border hover:border-accent/40 hover:bg-bg-elevated/70 transition-all flex flex-col justify-between min-h-[96px] group"
              >
                <div>
                  <span className="font-semibold text-sm text-text-primary block group-hover:text-accent transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[11px] text-text-secondary block mt-0.5">
                    {brand.parentGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
                  <span className="text-[10px] font-semibold text-accent uppercase">
                    Match Fit
                  </span>
                  <ArrowRight className="w-3 h-3 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Methodology & Sovereignty Invariants Card */}
        <section className="p-6 rounded-card bg-bg-elevated/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-card bg-accent-subtle text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-text-primary">
                Private & Secure By Design
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 max-w-xl leading-relaxed">
                WearID never shares your raw body measurements with online stores or third parties.
                Fitting is calculated privately and securely on your device.
              </p>
            </div>
          </div>
          <Link
            href="/app/tailor"
            className="btn-secondary min-h-[44px] text-xs font-semibold shrink-0"
          >
            Open Tailor Card
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
