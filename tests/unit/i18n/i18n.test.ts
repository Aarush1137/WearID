import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { TRANSLATIONS, TranslationDictionary } from "../../../src/core/i18n/translations";
import { I18nProvider, useI18n } from "../../../src/core/i18n/I18nContext";
import { LanguageSelector } from "../../../src/components/ui/LanguageSelector";

describe("Feature 7: Multi-Language Support / i18n", () => {
  it("should have complete key parity between English and Hindi dictionaries", () => {
    const enKeys = Object.keys(TRANSLATIONS.en) as (keyof TranslationDictionary)[];
    const hiKeys = Object.keys(TRANSLATIONS.hi) as (keyof TranslationDictionary)[];

    expect(enKeys.length).toBeGreaterThan(30);
    expect(hiKeys.length).toBe(enKeys.length);

    enKeys.forEach((key) => {
      expect(TRANSLATIONS.hi[key]).toBeDefined();
      expect(typeof TRANSLATIONS.hi[key]).toBe("string");
      expect(TRANSLATIONS.hi[key].trim().length).toBeGreaterThan(0);
    });
  });

  it("should accurately translate core biometric and garment anatomy terms", () => {
    expect(TRANSLATIONS.hi.chest).toContain("छाती");
    expect(TRANSLATIONS.hi.waist).toContain("कमर");
    expect(TRANSLATIONS.hi.inseam).toContain("इनसीम");
    expect(TRANSLATIONS.hi.footLength).toContain("पैर की लंबाई");
    expect(TRANSLATIONS.hi.hips).toContain("कूल्हे");
    expect(TRANSLATIONS.hi.shoulderWidth).toContain("कंधे की चौड़ाई");
  });

  it("should accurately translate fit types and feelings", () => {
    expect(TRANSLATIONS.hi.fit_slim).toBe("स्लिम फिट");
    expect(TRANSLATIONS.hi.fit_regular).toBe("रेगुलर फिट");
    expect(TRANSLATIONS.hi.fit_relaxed).toContain("ढीला");
    expect(TRANSLATIONS.hi.fit_oversized).toBe("ओवरसाइज़्ड");
    expect(TRANSLATIONS.hi.fit_perfect).toContain("सही नाप");
    expect(TRANSLATIONS.hi.fit_too_tight).toBe("बहुत तंग");
  });

  it("should accurately translate sizing engine concepts", () => {
    expect(TRANSLATIONS.hi.recommendedSize).toBe("अनुशंसित साइज़");
    expect(TRANSLATIONS.hi.alternativeSize).toBe("वैकल्पिक साइज़");
    expect(TRANSLATIONS.hi.fitConfidence).toBe("सटीकता स्तर");
    expect(TRANSLATIONS.hi.wearingEase).toContain("ईज़");
  });

  it("should accurately translate navigation routes", () => {
    expect(TRANSLATIONS.hi.passport).toBe("साइज़ पासपोर्ट");
    expect(TRANSLATIONS.hi.outfitBuilder).toBe("आउटफ़िट बिल्डर");
    expect(TRANSLATIONS.hi.familyMatrix).toBe("परिवार नाप तालिका");
    expect(TRANSLATIONS.hi.brandRequests).toBe("ब्रांड अनुरोध");
  });

  it("should provide hook-based locale switching and dictionary lookup", () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => React.createElement(I18nProvider, null, children),
    });

    expect(result.current.locale).toBe("en");
    expect(result.current.isHindi).toBe(false);
    expect(result.current.t("passport")).toBe("Passport");

    act(() => {
      result.current.setLocale("hi");
    });

    expect(result.current.locale).toBe("hi");
    expect(result.current.isHindi).toBe(true);
    expect(result.current.t("passport")).toBe("साइज़ पासपोर्ट");
    expect(result.current.t("chest")).toContain("छाती");

    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.locale).toBe("en");
    expect(result.current.t("passport")).toBe("Passport");
  });

  it("should render LanguageSelector and toggle language correctly", () => {
    function Consumer() {
      const { locale } = useI18n();
      return React.createElement(
        "div",
        null,
        React.createElement(LanguageSelector, null),
        React.createElement("span", { "data-testid": "curr-locale" }, locale)
      );
    }

    render(React.createElement(I18nProvider, null, React.createElement(Consumer, null)));

    expect(screen.getByTestId("curr-locale").textContent).toBe("en");

    const hiBtn = screen.getByRole("button", { name: "हिन्दी" });
    fireEvent.click(hiBtn);

    expect(screen.getByTestId("curr-locale").textContent).toBe("hi");

    const enBtn = screen.getByRole("button", { name: "EN" });
    fireEvent.click(enBtn);

    expect(screen.getByTestId("curr-locale").textContent).toBe("en");
  });
});
