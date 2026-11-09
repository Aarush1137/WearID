import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PrivacyDashboard } from "@/components/passport/PrivacyDashboard";

export default function PrivacySettingsPage() {
  return (
    <AppShell>
      <PrivacyDashboard />
    </AppShell>
  );
}
