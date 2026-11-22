"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FitAssistantChat } from "@/components/assistant/FitAssistantChat";

export default function AssistantPage() {
  return (
    <AppShell requireAuth={false}>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary,#0f172a)] tracking-tight">
            AI Fit Assistant
          </h1>
          <p className="text-sm text-[var(--text-secondary,#64748b)] mt-1.5">
            Conversational size advisor grounded strictly in deterministic garment ease with zero hallucination.
          </p>
        </div>

        <FitAssistantChat initialProfileKey="regular" />
      </div>
    </AppShell>
  );
}
