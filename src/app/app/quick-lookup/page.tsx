"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { QuickSizeLookupView } from "@/components/lookup/QuickSizeLookupView";

export default function QuickLookupPage() {
  return (
    <AppShell>
      <QuickSizeLookupView />
    </AppShell>
  );
}
