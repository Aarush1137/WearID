"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  SupportedLocale,
  TranslationDictionary,
  TRANSLATIONS,
} from "./translations";

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  isHindi: boolean;
  dictionary: TranslationDictionary;
}

const STORAGE_KEY = "wearid_lang";

const defaultContextValue: I18nContextValue = {
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => TRANSLATIONS.en[key] ?? fallback ?? String(key),
  isHindi: false,
  dictionary: TRANSLATIONS.en,
};

const I18nContext = createContext<I18nContextValue>(defaultContextValue);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  // Hydrate persisted preference after mount to avoid SSR hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "hi" || stored === "en") {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable (e.g. iframe sandbox or SSR)
    }
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore storage error
    }
  }, []);

  const dictionary = useMemo(() => {
    return TRANSLATIONS[locale] || TRANSLATIONS.en;
  }, [locale]);

  const t = useCallback(
    (key: keyof TranslationDictionary, fallback?: string): string => {
      const val = dictionary[key] ?? TRANSLATIONS.en[key];
      return val ?? fallback ?? String(key);
    },
    [dictionary]
  );

  const value = useMemo<I18nContextValue>(() => {
    return {
      locale,
      setLocale,
      t,
      isHindi: locale === "hi",
      dictionary,
    };
  }, [locale, setLocale, t, dictionary]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  return context || defaultContextValue;
}

export const useTranslation = useI18n;
