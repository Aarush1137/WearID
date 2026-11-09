"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      const timer = setTimeout(() => {
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
      setWasOffline(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOffline) {
    return (
      <aside
        aria-live="polite"
        className="w-full bg-[#FAF0E6] border-b border-[#B5621A]/30 text-[#B5621A] px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 sticky top-0 z-50 transition-all pt-safe"
      >
        <WifiOff className="w-4 h-4 shrink-0 text-[#B5621A]" />
        <span>
          <strong>Offline Mode Active:</strong> You are browsing offline. Local biometric profiles and sizing calculations remain functional.
        </span>
      </aside>
    );
  }

  if (wasOffline && !isOffline) {
    return (
      <aside
        aria-live="polite"
        className="w-full bg-success-subtle border-b border-success/30 text-success px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 sticky top-0 z-50 transition-all pt-safe"
      >
        <Wifi className="w-4 h-4 shrink-0 text-success" />
        <span>Connection restored. Catalog sync active.</span>
      </aside>
    );
  }

  return null;
}
