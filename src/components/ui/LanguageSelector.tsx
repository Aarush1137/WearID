"use client";

import React from "react";
import { useI18n } from "@/core/i18n/I18nContext";
import { Languages } from "lucide-react";

interface LanguageSelectorProps {
  variant?: "compact" | "pill" | "minimal";
  className?: string;
}

export function LanguageSelector({
  variant = "compact",
  className = "",
}: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();

  if (variant === "minimal") {
    return (
      <button
        onClick={() => setLocale(locale === "en" ? "hi" : "en")}
        aria-label={`Switch language to ${locale === "en" ? "Hindi" : "English"}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#F5F5F4] dark:hover:bg-[#292524] transition-colors ${className}`}
      >
        <Languages className="w-3.5 h-3.5 text-[#78716C] dark:text-[#A8A29E]" />
        <span>{locale === "en" ? "हिन्दी" : "EN"}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={`inline-flex items-center p-0.5 rounded-xl border border-[#E7E5E4] dark:border-[#292524] bg-[#F5F5F4] dark:bg-[#1C1917] shadow-inner ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[32px] min-w-[36px] flex items-center justify-center ${
          locale === "en"
            ? "bg-white dark:bg-[#292524] text-[#1C1917] dark:text-[#F5F5F4] shadow-sm font-bold"
            : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLocale("hi")}
        aria-pressed={locale === "hi"}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[32px] min-w-[44px] flex items-center justify-center ${
          locale === "hi"
            ? "bg-[#2D4A3E] text-white shadow-sm font-bold"
            : "text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F5F4]"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
