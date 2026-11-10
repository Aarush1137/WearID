"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone mode (already installed)
    const isStandalone =
      (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches) ||
      (window.navigator as any)?.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed permanently via localStorage
    const dismissed = localStorage.getItem("wearid_install_dismissed");
    if (dismissed === "true") return;

    const handleBeforeInstall = (e: Event) => {
      // Prevent the mini-infobar from appearing automatically on mobile/Chrome
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setIsVisible(false);
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // User selected "No": remember choice permanently so they are never prompted again
    if (typeof window !== "undefined") {
      localStorage.setItem("wearid_install_dismissed", "true");
    }
  };

  if (!isVisible || !deferredPrompt || isInstalled) {
    return null;
  }

  return (
    <aside
      aria-label="PWA install dialog"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 p-4 sm:p-5 rounded-card border border-border-strong bg-bg-surface/95 backdrop-blur-md shadow-xl pb-safe animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow-xs">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-text-primary">Install WearID App?</h3>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close install prompt"
              className="text-text-tertiary hover:text-text-primary p-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Install on your device for fast offline sizing, full-screen view, and instant passport access.
          </p>
          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="btn-primary min-h-[40px] px-4 text-xs font-semibold flex-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Yes, Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn-secondary min-h-[40px] px-3.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              No, Thanks
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
