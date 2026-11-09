import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RecommendationView } from "@/components/recommend/RecommendationView";

export default function RecommendPage() {
  return (
    <AppShell>
      <RecommendationView />
    </AppShell>
  );
}
