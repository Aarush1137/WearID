import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { WearIDConnect, WearIDConnectConfig } from "@/connect/clientSdk";

describe("Phase 4.1: Embeddable Client SDK (WearID Connect)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "pdp-button-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.querySelectorAll(".wearid-connect-modal-overlay").forEach((el) => el.remove());
    vi.restoreAllMocks();
  });

  it("fails initialization when merchantId is missing", () => {
    expect(() => {
      new WearIDConnect({} as WearIDConnectConfig);
    }).toThrow("WearIDConnect Error: merchantId is required");
  });

  it("standalone public/wearid-connect.js exists and is within the <25KB size budget", () => {
    const scriptPath = path.resolve(__dirname, "../../../public/wearid-connect.js");
    expect(fs.existsSync(scriptPath)).toBe(true);

    const stats = fs.statSync(scriptPath);
    const maxBytes = 25 * 1024; // 25,600 bytes
    expect(stats.size).toBeLessThan(maxBytes);
    expect(stats.size).toBeGreaterThan(1000); // Verify non-empty
  });

  it("renders an accessible 'Fit with WearID' button adhering to WCAG 2.1 AA", () => {
    const sdk = WearIDConnect.init({ merchantId: "snitch" });
    const btn = sdk.renderButton(container, {
      productId: "prod_snitch_heavyweight_boxy",
      variant: "solid",
    });

    expect(btn).toBeDefined();
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-label")).toBe("Find your fit with WearID");
    expect(btn.getAttribute("data-wearid-product")).toBe("prod_snitch_heavyweight_boxy");

    // Accessible touch target (min-height 44px)
    expect(btn.style.minHeight).toBe("44px");

    // WearID brand colors (#1B2A4A or normalized rgb(27, 42, 74))
    expect(["#1B2A4A", "rgb(27, 42, 74)"]).toContain(btn.style.backgroundColor);

    // Contains SVG hanger icon and label text
    expect(btn.innerHTML).toContain("<svg");
    expect(btn.textContent).toContain("Fit with WearID");
  });

  it("clicking the button opens the zero-knowledge modal dialog", () => {
    const sdk = WearIDConnect.init({ merchantId: "uniqlo" });
    const btn = sdk.renderButton(container);

    btn.click();

    const modal = document.querySelector(".wearid-connect-modal-overlay");
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain("Sovereign Sizing Handshake");
    expect(modal?.textContent).toContain("WearID Sizing Token");

    sdk.closeModal();
    expect(document.querySelector(".wearid-connect-modal-overlay")).toBeNull();
  });

  it("dispatches 'wearid:size-selected' custom event and triggers onSizeSelected callback", () => {
    const onSizeSelectedSpy = vi.fn();
    const sdk = WearIDConnect.init({
      merchantId: "snitch",
      onSizeSelected: onSizeSelectedSpy,
    });

    let capturedEventDetail: unknown = null;
    window.addEventListener("wearid:size-selected", (e: Event) => {
      capturedEventDetail = (e as CustomEvent).detail;
    });

    sdk.dispatchSizeSelection({
      recommendedSize: "L",
      confidence: 0.96,
      confidenceLabel: "high",
      fitScore: 0.95,
      summaryText: "Relaxed fit over chest (+75mm ease)",
      productId: "prod_snitch_heavyweight_boxy",
    });

    expect(onSizeSelectedSpy).toHaveBeenCalledTimes(1);
    expect(onSizeSelectedSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        recommendedSize: "L",
        fitScore: 0.95,
      })
    );

    expect(capturedEventDetail).not.toBeNull();
    expect((capturedEventDetail as Record<string, unknown>).recommendedSize).toBe("L");
  });

  it("client SDK verifies response contains zero biometric keys", async () => {
    const sdk = WearIDConnect.init({ merchantId: "snitch" });

    // Mock fetch with safe response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tokenValid: true,
        recommendedSize: "L",
        confidence: 0.95,
        confidenceLabel: "high",
        fitScore: 0.94,
        isBorderline: false,
        summaryText: "Optimal fit",
        latencyMs: 12,
        zeroKnowledgeVerified: true,
        protocolVersion: "wearid-connect/1.0",
      }),
    } as unknown as Response);

    const result = await sdk.getRecommendation({
      token: "wearid_demo_regular",
      productId: "prod_snitch_heavyweight_boxy",
    });

    expect(result.recommendedSize).toBe("L");
    expect(result.zeroKnowledgeVerified).toBe(true);

    // Verify error thrown if backend leaks biometrics
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tokenValid: true,
        recommendedSize: "L",
        chestMm: 980, // LEAK
      }),
    } as unknown as Response);

    await expect(
      sdk.getRecommendation({
        token: "wearid_demo_regular",
      })
    ).rejects.toThrow("CRITICAL PRIVACY INVARIANT ERROR");
  });
});
