/**
 * WearID Connect Client SDK
 * Lightweight (<25KB), zero-dependency embeddable script for apparel e-commerce PDPs.
 * Enables zero-knowledge size recommendations directly inside merchant storefronts.
 */

export interface WearIDConnectConfig {
  merchantId: string;
  apiKey?: string;
  apiBaseUrl?: string;
  onSizeSelected?: (result: WearIDSizeSelectedEvent) => void;
  fitIntent?: "slim" | "regular" | "relaxed" | "oversized";
  theme?: "light" | "dark";
}

export interface WearIDSizeSelectedEvent {
  recommendedSize: string;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitScore: number;
  summaryText: string;
  productId?: string;
}

export interface RecommendationResponse {
  tokenValid: boolean;
  recommendedSize: string;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitScore: number;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  summaryText: string;
  latencyMs: number;
  zeroKnowledgeVerified: boolean;
  protocolVersion: string;
}

export class WearIDConnect {
  private config: WearIDConnectConfig;
  private apiBaseUrl: string;
  private modalElement: HTMLElement | null = null;

  constructor(config: WearIDConnectConfig) {
    if (!config.merchantId) {
      throw new Error("WearIDConnect Error: merchantId is required.");
    }
    this.config = config;
    this.apiBaseUrl = config.apiBaseUrl || "/api/v1/portability";
  }

  /**
   * Factory method to initialize and attach to window
   */
  public static init(config: WearIDConnectConfig): WearIDConnect {
    const instance = new WearIDConnect(config);
    if (typeof window !== "undefined") {
      (window as unknown as { WearIDInstance?: WearIDConnect }).WearIDInstance = instance;
    }
    return instance;
  }

  /**
   * Fetches zero-knowledge size recommendation from the WearID Gateway
   */
  public async getRecommendation(params: {
    token: string;
    productId?: string;
    category?: string;
    fitIntent?: "slim" | "regular" | "relaxed" | "oversized";
  }): Promise<RecommendationResponse> {
    const payload = {
      token: params.token,
      retailerId: this.config.merchantId,
      productId: params.productId,
      category: params.category,
      fitIntent: params.fitIntent || this.config.fitIntent || "regular",
    };

    const res = await fetch(`${this.apiBaseUrl}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data: RecommendationResponse = await res.json();

    // Verify zero biometric leakage in client SDK
    const rawKeys = Object.keys(data);
    const forbidden = ["chestMm", "waistMm", "hipsMm", "inseamMm", "shoulderWidthMm"];
    for (const key of forbidden) {
      if (rawKeys.includes(key)) {
        throw new Error(`CRITICAL PRIVACY INVARIANT ERROR: Biometric key ${key} exposed in response.`);
      }
    }

    return data;
  }

  /**
   * Renders the "Fit with WearID" button into a host DOM element
   */
  public renderButton(
    container: HTMLElement | string,
    options: {
      productId?: string;
      category?: string;
      token?: string;
      label?: string;
      variant?: "solid" | "outline";
    } = {}
  ): HTMLElement {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) {
      throw new Error(`WearIDConnect: Target container element not found.`);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "wearid-connect-btn";
    button.setAttribute("aria-label", "Find your fit with WearID");
    button.setAttribute("data-wearid-product", options.productId || "");

    const isSolid = options.variant !== "outline";
    button.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 44px;
      text-decoration: none;
      ${
        isSolid
          ? "background-color: #425B48; color: #FFFFFF; border: 1px solid #425B48;"
          : "background-color: #FFFFFF; color: #425B48; border: 1.5px solid #425B48;"
      }
    `;

    // WearID hanger/shield SVG icon
    button.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14.5A2 2 0 0 0 3.5 17H20.5a2 2 0 0 0 1.5-2.5L14.2 7.1c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z"/>
        <path d="M12 7v5"/>
      </svg>
      <span>${options.label || "Fit with WearID"}</span>
    `;

    button.addEventListener("mouseenter", () => {
      button.style.backgroundColor = isSolid ? "#354A3A" : "#F5F3ED";
    });
    button.addEventListener("mouseleave", () => {
      button.style.backgroundColor = isSolid ? "#425B48" : "#FFFFFF";
    });

    button.addEventListener("click", () => {
      this.openModal({
        productId: options.productId,
        category: options.category,
        defaultToken: options.token,
      });
    });

    el.appendChild(button);
    return button;
  }

  /**
   * Opens the zero-knowledge size recommendation modal overlay
   */
  public openModal(options: {
    productId?: string;
    category?: string;
    defaultToken?: string;
  } = {}): void {
    if (this.modalElement) {
      this.modalElement.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "wearid-connect-modal-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background-color: rgba(36, 40, 33, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      padding: 16px;
    `;

    const dialog = document.createElement("div");
    dialog.className = "wearid-connect-modal-dialog";
    dialog.style.cssText = `
      background-color: #FFFFFF;
      border-radius: 12px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid #DDE4D9;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      color: #242821;
    `;

    dialog.innerHTML = `
      <div style="background-color: #F5F3ED; padding: 18px 24px; border-bottom: 1px solid #DDE4D9; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background-color: #425B48; color: #FFFFFF; border-radius: 6px; padding: 4px 8px; font-weight: 700; font-size: 13px;">WearID</div>
          <span style="font-size: 14px; font-weight: 600; color: #425B48;">Connect</span>
        </div>
        <button id="wearid-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #73776F; min-width: 32px; min-height: 32px;" aria-label="Close dialog">&times;</button>
      </div>
      <div style="padding: 24px;" id="wearid-modal-body">
        <h3 style="font-size: 17px; font-weight: 700; margin: 0 0 8px 0; color: #242821;">Sovereign Sizing Handshake</h3>
        <p style="font-size: 13px; color: #73776F; margin: 0 0 18px 0; line-height: 1.4;">
          Your anatomical biometrics remain completely private. Only the deterministic size recommendation will be delivered.
        </p>

        <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #73776F; margin-bottom: 6px;">
          WearID Sizing Token
        </label>
        <input 
          id="wearid-token-input" 
          type="text" 
          placeholder="Paste wearid_tok_... or select demo below"
          value="${options.defaultToken || ""}"
          style="width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #DDE4D9; border-radius: 6px; font-family: monospace; font-size: 12px; margin-bottom: 14px;"
        />

        <div style="margin-bottom: 18px;">
          <span style="font-size: 11px; color: #73776F; display: block; margin-bottom: 6px;">Quick Demo Profiles:</span>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="wearid-demo-chip" data-profile="regular" style="flex: 1; padding: 6px 4px; font-size: 11px; font-weight: 600; border: 1px solid #DDE4D9; background: #F5F3ED; border-radius: 4px; cursor: pointer; color: #242821;">Regular</button>
            <button type="button" class="wearid-demo-chip" data-profile="athletic" style="flex: 1; padding: 6px 4px; font-size: 11px; font-weight: 600; border: 1px solid #DDE4D9; background: #F5F3ED; border-radius: 4px; cursor: pointer; color: #242821;">Athletic</button>
            <button type="button" class="wearid-demo-chip" data-profile="slim" style="flex: 1; padding: 6px 4px; font-size: 11px; font-weight: 600; border: 1px solid #DDE4D9; background: #F5F3ED; border-radius: 4px; cursor: pointer; color: #242821;">Slim</button>
          </div>
        </div>

        <button 
          id="wearid-calculate-btn"
          style="width: 100%; background-color: #425B48; color: #FFFFFF; border: none; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; min-height: 44px;"
        >
          Calculate Deterministic Size
        </button>

        <div id="wearid-result-container" style="display: none; margin-top: 18px; padding: 14px; border-radius: 8px; background: #F5F3ED; border: 1px solid #DDE4D9;"></div>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    this.modalElement = overlay;

    // Close handlers
    const closeBtn = dialog.querySelector("#wearid-close-btn");
    closeBtn?.addEventListener("click", () => this.closeModal());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Demo chip click handlers
    const chips = dialog.querySelectorAll(".wearid-demo-chip");
    const tokenInput = dialog.querySelector("#wearid-token-input") as HTMLInputElement;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const profile = chip.getAttribute("data-profile");
        if (profile) {
          tokenInput.value = `wearid_demo_${profile}`;
        }
      });
    });

    // Calculate handler
    const calcBtn = dialog.querySelector("#wearid-calculate-btn") as HTMLButtonElement;
    const resultBox = dialog.querySelector("#wearid-result-container") as HTMLElement;

    calcBtn.addEventListener("click", async () => {
      const token = tokenInput.value.trim();
      if (!token) {
        alert("Please enter or select a WearID token.");
        return;
      }

      calcBtn.textContent = "Calculating fit...";
      calcBtn.disabled = true;

      try {
        const rec = await this.getRecommendation({
          token,
          productId: options.productId,
          category: options.category,
        });

        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: #73776F; font-weight: 700; letter-spacing: 0.05em;">Recommended Size</span>
              <div style="font-size: 28px; font-weight: 800; color: #425B48;">${rec.recommendedSize}</div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 700; border-radius: 12px; background: #DDE4D9; color: #2D6A4F;">
                ${Math.round(rec.fitScore * 100)}% Match
              </span>
              <div style="font-size: 11px; color: #73776F; margin-top: 4px;">Confidence: ${rec.confidenceLabel}</div>
            </div>
          </div>
          <p style="font-size: 12px; color: #242821; margin: 0 0 12px 0; line-height: 1.4;">
            ${rec.summaryText}
          </p>
          <div style="font-size: 10px; color: #73776F; margin-bottom: 12px;">
            [Verified] Invariant 7: Zero anatomical measurements transmitted (latency: ${rec.latencyMs}ms)
          </div>
          <button 
            id="wearid-apply-size-btn"
            style="width: 100%; background: #242821; color: #FFFFFF; border: none; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px;"
          >
            Apply Size ${rec.recommendedSize} to Store
          </button>
        `;

        const applyBtn = resultBox.querySelector("#wearid-apply-size-btn");
        applyBtn?.addEventListener("click", () => {
          this.dispatchSizeSelection({
            recommendedSize: rec.recommendedSize,
            confidence: rec.confidence,
            confidenceLabel: rec.confidenceLabel,
            fitScore: rec.fitScore,
            summaryText: rec.summaryText,
            productId: options.productId,
          });
          this.closeModal();
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Handshake failed";
        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div style="color: #C38367; font-size: 12px; font-weight: 600;">
            Recommendation failed: ${errorMsg}
          </div>
        `;
      } finally {
        calcBtn.textContent = "Calculate Deterministic Size";
        calcBtn.disabled = false;
      }
    });
  }

  public closeModal(): void {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
  }

  /**
   * Dispatches custom event and triggers user callback
   */
  public dispatchSizeSelection(eventData: WearIDSizeSelectedEvent): void {
    if (this.config.onSizeSelected) {
      this.config.onSizeSelected(eventData);
    }

    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent("wearid:size-selected", {
        detail: eventData,
        bubbles: true,
      });
      window.dispatchEvent(customEvent);
    }
  }
}
