"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type ThemeMode = "system" | "light" | "dark";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (mode === "dark") {
    root.classList.add("dark");
  } else if (mode === "light") {
    root.classList.add("light");
  } else if (mode === "system") {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  // On mount: read persisted preference & listen to system changes
  useEffect(() => {
    const stored = localStorage.getItem("wearid-theme") as ThemeMode | null;
    const resolved = stored ?? "system";
    setMode(resolved);
    applyTheme(resolved);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("wearid-theme") as ThemeMode | null;
      if (!current || current === "system") {
        applyTheme("system");
      }
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const cycle = () => {
    const next: ThemeMode = mode === "system" ? "dark" : mode === "dark" ? "light" : "system";
    setMode(next);
    applyTheme(next);
    localStorage.setItem("wearid-theme", next);
  };

  const icon =
    mode === "dark" ? (
      <Moon className="w-4 h-4" aria-hidden />
    ) : mode === "light" ? (
      <Sun className="w-4 h-4" aria-hidden />
    ) : (
      <Monitor className="w-4 h-4" aria-hidden />
    );

  const label =
    mode === "dark"
      ? "Dark mode active — click for light"
      : mode === "light"
      ? "Light mode active — click for system"
      : "System theme — click for dark";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-btn border border-border-strong bg-bg-surface hover:bg-bg-elevated transition-colors text-text-secondary hover:text-text-primary shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {icon}
    </button>
  );
}
