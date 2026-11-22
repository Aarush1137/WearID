/**
 * WearID Chrome Extension — Content Script (Manifest V3)
 * Scrapes product display pages across Zara, H&M, Uniqlo, and Myntra
 * Injects sovereign, zero-knowledge sizing pill into shadow DOM.
 */

const RETAILER_CONFIGS = {
  zara: {
    name: "Zara",
    domainPattern: /zara\.com/i,
    titleSelectors: [
      ".product-detail-info__header-name",
      "h1.product-detail-info__name",
      "h1.product-detail-view__name",
      "h1",
    ],
    sizeSelectors: [
      ".product-detail-size-selector ul li button.size-selector-list__item",
      "ul.size-selector-list li button",
      ".product-size-info__main-label",
    ],
    mountSelectors: [
      ".product-detail-size-selector",
      ".product-detail-info",
      ".product-detail-actions",
    ],
    chartTriggerSelector: "button.product-detail-size-guide-link",
  },
  hm: {
    name: "H&M",
    domainPattern: /hm\.com/i,
    titleSelectors: [
      "h1[data-testid='product-title']",
      ".primary-product-headline",
      "h1.product-item-headline",
      "h1",
    ],
    sizeSelectors: [
      "ul[data-testid='size-selector'] li button",
      ".ProductSizeList-module--sizeButton",
      "[data-testid='size-selector'] button",
      ".picker-list li button",
    ],
    mountSelectors: [
      ".ProductSizeList-module--wrapper",
      "[data-testid='size-selector']",
      ".product-item-buttons",
    ],
    chartTriggerSelector: "button[data-testid='size-guide-button']",
  },
  uniqlo: {
    name: "Uniqlo",
    domainPattern: /uniqlo\.com/i,
    titleSelectors: [
      "h1.product-title",
      "[data-test='product-name']",
      "h1.fr-product-title",
      "h1",
    ],
    sizeSelectors: [
      ".size-picker button.chip",
      "input[name='size'] + label",
      ".size-picker button",
      "[data-test='size-chip']",
    ],
    mountSelectors: [
      ".size-picker-container",
      ".size-picker",
      ".product-size-section",
    ],
    chartTableSelectors: [
      "table.size-chart-table",
      "table.uq-size-table",
      ".size-chart-modal table",
    ],
  },
  myntra: {
    name: "Myntra",
    domainPattern: /myntra\.com/i,
    titleSelectors: [
      "h1.pdp-title",
      "h1.pdp-name",
      ".pdp-price-info h1",
      "h1",
    ],
    sizeSelectors: [
      ".size-buttons-size-button",
      "button.size-buttons-size-button-selected",
      ".size-buttons-buttonContainer button",
    ],
    mountSelectors: [
      ".size-buttons-size-container",
      ".pdp-action-container",
      ".pdp-size-chart",
    ],
    chartTriggerSelector: ".pdp-sizeChartContainer button",
  },
};

/**
 * Identifies retailer from current URL hostname
 */
function identifyRetailer(url = window.location.href) {
  for (const [key, config] of Object.entries(RETAILER_CONFIGS)) {
    if (config.domainPattern.test(url)) {
      return key;
    }
  }
  return null;
}

/**
 * Parses Uniqlo garment dimension tables if present on page (in cm)
 */
function parseUniqloSizeTable(doc) {
  const table = doc.querySelector("table.size-chart-table, table.uq-size-table");
  if (!table) return undefined;

  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length < 2) return undefined;

  const specs = [];
  // Parse header and rows
  const headers = Array.from(rows[0].querySelectorAll("th, td")).map((c) =>
    c.textContent.trim().toLowerCase()
  );
  const sizeIdx = headers.findIndex((h) => h.includes("size") || h.includes("label"));
  const chestIdx = headers.findIndex((h) => h.includes("body width") || h.includes("chest"));
  const lengthIdx = headers.findIndex((h) => h.includes("body length") || h.includes("length"));

  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll("td, th")).map((c) => c.textContent.trim());
    if (cells.length > sizeIdx && sizeIdx !== -1) {
      const sizeLabel = cells[sizeIdx];
      let chestFlatMm = undefined;
      let lengthMm = undefined;

      if (chestIdx !== -1 && cells[chestIdx]) {
        const val = parseFloat(cells[chestIdx]);
        if (!isNaN(val)) chestFlatMm = Math.round(val * 10); // cm to mm
      }
      if (lengthIdx !== -1 && cells[lengthIdx]) {
        const val = parseFloat(cells[lengthIdx]);
        if (!isNaN(val)) lengthMm = Math.round(val * 10);
      }

      if (sizeLabel) {
        specs.push({
          sizeLabel,
          chestFlatMm,
          lengthMm,
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        });
      }
    }
  }

  return specs.length > 0 ? specs : undefined;
}

/**
 * Extracts product metadata and available sizes from DOM
 */
function extractProductInfo(doc = document, url = window.location.href) {
  const retailerKey = identifyRetailer(url);
  if (!retailerKey) return null;

  const config = RETAILER_CONFIGS[retailerKey];

  // Title extraction
  let title = "";
  for (const sel of config.titleSelectors) {
    const el = doc.querySelector(sel);
    if (el && el.textContent.trim()) {
      title = el.textContent.trim();
      break;
    }
  }

  // Available Sizes extraction
  const sizeSet = new Set();
  for (const sel of config.sizeSelectors) {
    const elements = doc.querySelectorAll(sel);
    elements.forEach((el) => {
      const label = el.textContent.trim().toUpperCase();
      // Filter out non-size labels
      if (label && label.length <= 6 && !label.includes("GUIDE") && !label.includes("CHART")) {
        sizeSet.add(label);
      }
    });
    if (sizeSet.size > 0) break;
  }
  const availableSizes = Array.from(sizeSet);

  // Mount Element
  let mountEl = null;
  for (const sel of config.mountSelectors) {
    const el = doc.querySelector(sel);
    if (el) {
      mountEl = el;
      break;
    }
  }

  // Table specs (Uniqlo or Layer 3)
  let garmentDimensions = undefined;
  if (retailerKey === "uniqlo") {
    garmentDimensions = parseUniqloSizeTable(doc);
  }

  // Detect category from title keywords
  let category = "t_shirt";
  const titleLower = title.toLowerCase();
  if (titleLower.includes("jean") || titleLower.includes("denim")) category = "jeans";
  else if (titleLower.includes("trouser") || titleLower.includes("chino") || titleLower.includes("pant")) category = "trousers_chinos";
  else if (titleLower.includes("jacket") || titleLower.includes("blazer")) category = "jacket";
  else if (titleLower.includes("shirt") && !titleLower.includes("t-shirt")) category = "shirt_casual";
  else if (titleLower.includes("dress")) category = "dress";
  else if (titleLower.includes("shoe") || titleLower.includes("sneaker")) category = "shoes";

  return {
    brand: config.name,
    brandId: retailerKey,
    title,
    category,
    availableSizes,
    mountElement: mountEl,
    garmentDimensions,
    sizeChartFound: Boolean(garmentDimensions && garmentDimensions.length > 0),
  };
}

/**
 * Injects WearID Sizing Pill via isolated Shadow DOM (Invariant 7 protected)
 */
function injectShadowWidget(productInfo, recommendation, doc = document) {
  if (!productInfo || !recommendation) return null;

  // Locate or create host
  let host = doc.getElementById("wearid-extension-host");
  if (!host) {
    host = doc.createElement("div");
    host.id = "wearid-extension-host";

    if (productInfo.mountElement && productInfo.mountElement.parentNode) {
      productInfo.mountElement.parentNode.insertBefore(host, productInfo.mountElement);
    } else {
      doc.body.appendChild(host);
    }
  }

  // Get or attach shadow root
  let shadow = host.shadowRoot;
  if (!shadow) {
    shadow = host.attachShadow({ mode: "open" });
  }

  // Assert Invariant 7: Ensure zero raw biometrics exist in recommendation payload before rendering
  const forbiddenBiometrics = ["chestMm", "waistMm", "hipsMm", "inseamMm", "heightMm", "weightG"];
  for (const key of forbiddenBiometrics) {
    if (key in recommendation) {
      throw new Error(`CRITICAL BIOMETRIC PRIVACY LEAK: ${key} found in extension DOM.`);
    }
  }

  const { recommendedSize, fitScore = 92, confidenceLabel = "high", isBorderline, summaryText } = recommendation;

  shadow.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 12px 0;
        box-sizing: border-box;
      }
      .wearid-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 10px 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      .wearid-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .wearid-badge-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
        display: inline-block;
      }
      .wearid-brand {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #047857;
      }
      .wearid-recommendation {
        font-size: 14px;
        font-weight: 700;
        color: #064e3b;
      }
      .wearid-meta {
        font-size: 12px;
        color: #047857;
        margin-left: 4px;
      }
      .wearid-btn {
        background: #047857;
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: background 0.15s ease;
      }
      .wearid-btn:hover {
        background: #065f46;
      }
      .wearid-borderline {
        background: #fffbeb;
        border-color: #fde68a;
      }
      .wearid-borderline .wearid-badge-dot {
        background-color: #f59e0b;
      }
      .wearid-borderline .wearid-brand,
      .wearid-borderline .wearid-recommendation,
      .wearid-borderline .wearid-meta {
        color: #92400e;
      }
    </style>
    <div class="wearid-container ${isBorderline ? "wearid-borderline" : ""}" data-testid="wearid-pill">
      <div class="wearid-left">
        <span class="wearid-badge-dot"></span>
        <div>
          <div class="wearid-brand">WearID Size Passport</div>
          <div class="wearid-recommendation">
            Fit: Size ${recommendedSize}
            <span class="wearid-meta">(${fitScore}% Match • ${confidenceLabel} confidence)</span>
          </div>
        </div>
      </div>
      <a href="http://localhost:3000/app" target="_blank" rel="noopener" class="wearid-btn" data-testid="wearid-pill-link">
        Passport &rarr;
      </a>
    </div>
  `;

  return host;
}

/**
 * Main execution trigger
 */
function runContentPipeline(doc = document, url = window.location.href) {
  const productInfo = extractProductInfo(doc, url);
  if (!productInfo) return;

  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage(
      {
        action: "EVALUATE_RECOMMENDATION",
        payload: {
          brandId: productInfo.brandId,
          category: productInfo.category,
          title: productInfo.title,
          availableSizes: productInfo.availableSizes,
          garmentDimensions: productInfo.garmentDimensions,
        },
      },
      (response) => {
        if (response && response.success && response.data) {
          injectShadowWidget(productInfo, response.data, doc);
        }
      }
    );
  }
}

// Auto-run if inside browser document
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => runContentPipeline());
  } else {
    runContentPipeline();
  }

  // SPA Navigation Observer for dynamic retailer page loads
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(() => runContentPipeline(), 500);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Export for Node/Vitest tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    RETAILER_CONFIGS,
    identifyRetailer,
    parseUniqloSizeTable,
    extractProductInfo,
    injectShadowWidget,
    runContentPipeline,
  };
}
