import React, { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingWizard } from "@/components/measure/OnboardingWizard";

export default function MeasurePage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="max-w-3xl mx-auto py-12 text-center text-xs text-text-secondary">Loading calibration wizard...</div>}>
        <OnboardingWizard />
      </Suspense>
    </AppShell>
  );
}
