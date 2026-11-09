import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingWizard } from "@/components/measure/OnboardingWizard";

export default function MeasurePage() {
  return (
    <AppShell>
      <OnboardingWizard />
    </AppShell>
  );
}
