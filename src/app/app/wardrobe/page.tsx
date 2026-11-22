"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WardrobeClosetView } from "@/components/wardrobe/WardrobeClosetView";

export default function WardrobePage() {
  return (
    <AppShell>
      <WardrobeClosetView />
    </AppShell>
  );
}
