"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem("wearid_install_dismissed");
    if (dismissed === "true") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("wearid_install_dismissed", "true");
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 p-4 rounded-card border border-border bg-bg-surface shadow-lg flex items-center justify-between gap-4 pb-safe animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-btn bg-accent-subtle text-accent flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h4 id="pwa-install-title" className="font-semibold text-sm text-text-primary">
            Install WearID App
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Instant offline access to your size passport and recommendations.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="btn-primary min-h-[44px] px-3.5 text-xs font-semibold"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="w-11 h-11 flex items-center justify-center rounded-btn text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
