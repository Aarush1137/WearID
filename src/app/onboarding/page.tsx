import React, { Suspense } from "react";
import { OnboardingHeader } from "@/components/measure/OnboardingHeader";
import { OnboardingWizard } from "@/components/measure/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      {/* Interactive Top Header with Safe Skip */}
      <OnboardingHeader />

      {/* Main Wizard wrapped in Suspense */}
      <main className="flex-1 px-4 sm:px-6">
        <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-xs text-text-secondary">Loading calibration wizard...</div>}>
          <OnboardingWizard />
        </Suspense>
      </main>
    </div>
  );
}
