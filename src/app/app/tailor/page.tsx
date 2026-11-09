import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TailorCardView } from "@/components/tailor/TailorCardView";

export default function TailorPage() {
  return (
    <AppShell>
      <TailorCardView />
    </AppShell>
  );
}
