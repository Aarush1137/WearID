import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
// @ts-expect-error jsdom declaration not included in devDependencies
import { JSDOM } from "jsdom";

// Load extension scripts directly
const contentModule = require(path.resolve(process.cwd(), "extension/content.js"));
const backgroundModule = require(path.resolve(process.cwd(), "extension/background.js"));
const popupModule = require(path.resolve(process.cwd(), "extension/popup.js"));

describe("Feature 11: Chrome / Shopping Extension Scaffold", () => {
  describe("Manifest V3 Configuration (extension/manifest.json)", () => {
    it("conforms to Manifest V3 specifications", () => {
      const manifestPath = path.resolve(process.cwd(), "extension/manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(raw);

      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toContain("WearID");
      expect(manifest.permissions).toContain("storage");
      expect(manifest.permissions).toContain("activeTab");

      // Verify host permissions for Zara, H&M, Uniqlo, Myntra
      const hosts = manifest.host_permissions;
      expect(hosts.some((h: string) => h.includes("zara.com"))).toBe(true);
      expect(hosts.some((h: string) => h.includes("hm.com"))).toBe(true);
      expect(hosts.some((h: string) => h.includes("uniqlo.com"))).toBe(true);
      expect(hosts.some((h: string) => h.includes("myntra.com"))).toBe(true);

      // Verify service worker and content scripts
      expect(manifest.background.service_worker).toBe("background.js");
      expect(manifest.content_scripts[0].matches.length).toBeGreaterThanOrEqual(4);
      expect(manifest.action.default_popup).toBe("popup.html");
    });
  });

  describe("Retailer Detection & URL Matching", () => {
    it("correctly identifies supported retailer domains", () => {
      expect(contentModule.identifyRetailer("https://www.zara.com/in/en/linen-shirt-p03057400.html")).toBe("zara");
      expect(contentModule.identifyRetailer("https://www2.hm.com/en_in/productpage.1189472001.html")).toBe("hm");
      expect(contentModule.identifyRetailer("https://www.uniqlo.com/in/en/products/E425974-000/00")).toBe("uniqlo");
      expect(contentModule.identifyRetailer("https://www.myntra.com/shirts/roadster/12345/buy")).toBe("myntra");
      expect(contentModule.identifyRetailer("https://www.amazon.in/dp/B08XYZ")).toBeNull();
    });

    it("popup detects retailer from active tab URL", () => {
      expect(popupModule.detectRetailerFromUrl("https://www.zara.com/us/en/product")).toBe("Zara");
      expect(popupModule.detectRetailerFromUrl("https://www.hm.com/product")).toBe("H&M");
      expect(popupModule.detectRetailerFromUrl("https://www.uniqlo.com/product")).toBe("Uniqlo");
      expect(popupModule.detectRetailerFromUrl("https://www.myntra.com/product")).toBe("Myntra");
      expect(popupModule.detectRetailerFromUrl("https://www.google.com")).toBeNull();
    });
  });

  describe("Retailer DOM Scrapers", () => {
    it("scrapes Zara mock product display page", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <div class="product-detail-info">
              <h1 class="product-detail-info__header-name">Textured Relaxed Shirt</h1>
              <div class="product-detail-size-selector">
                <ul>
                  <li><button class="size-selector-list__item">S</button></li>
                  <li><button class="size-selector-list__item">M</button></li>
                  <li><button class="size-selector-list__item">L</button></li>
                  <li><button class="size-selector-list__item">XL</button></li>
                </ul>
              </div>
            </div>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: "https://www.zara.com/in/en/textured-shirt" });
      const info = contentModule.extractProductInfo(dom.window.document, "https://www.zara.com/in/en/textured-shirt");

      expect(info).toBeDefined();
      expect(info.brand).toBe("Zara");
      expect(info.title).toBe("Textured Relaxed Shirt");
      expect(info.availableSizes).toEqual(["S", "M", "L", "XL"]);
      expect(info.mountElement).not.toBeNull();
    });

    it("scrapes H&M mock product display page", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1 data-testid="product-title">Regular Fit Crew Neck T-Shirt</h1>
            <div data-testid="size-selector" class="ProductSizeList-module--wrapper">
              <ul data-testid="size-selector">
                <li><button>XS</button></li>
                <li><button>S</button></li>
                <li><button>M</button></li>
                <li><button>L</button></li>
              </ul>
            </div>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: "https://www2.hm.com/en_in/product.html" });
      const info = contentModule.extractProductInfo(dom.window.document, "https://www2.hm.com/en_in/product.html");

      expect(info.brand).toBe("H&M");
      expect(info.title).toBe("Regular Fit Crew Neck T-Shirt");
      expect(info.availableSizes).toEqual(["XS", "S", "M", "L"]);
    });

    it("scrapes Uniqlo page and parses dimensional table specs in cm", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1 class="product-title">AIRism Cotton Oversized T-Shirt</h1>
            <div class="size-picker-container">
              <div class="size-picker">
                <button class="chip">S</button>
                <button class="chip">M</button>
                <button class="chip">L</button>
              </div>
            </div>
            <table class="size-chart-table">
              <tr>
                <th>Size</th>
                <th>Body Width</th>
                <th>Body Length</th>
              </tr>
              <tr>
                <td>S</td>
                <td>53</td>
                <td>68.5</td>
              </tr>
              <tr>
                <td>M</td>
                <td>56</td>
                <td>70.5</td>
              </tr>
              <tr>
                <td>L</td>
                <td>59</td>
                <td>73.5</td>
              </tr>
            </table>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: "https://www.uniqlo.com/in/en/products/E425974" });
      const info = contentModule.extractProductInfo(dom.window.document, "https://www.uniqlo.com/in/en/products/E425974");

      expect(info.brand).toBe("Uniqlo");
      expect(info.title).toBe("AIRism Cotton Oversized T-Shirt");
      expect(info.availableSizes).toEqual(["S", "M", "L"]);
      expect(info.sizeChartFound).toBe(true);
      expect(info.garmentDimensions).toBeDefined();

      // Flat chest 56cm converted to 560mm
      const sizeMSpec = info.garmentDimensions.find((s: any) => s.sizeLabel === "M");
      expect(sizeMSpec.chestFlatMm).toBe(560);
      expect(sizeMSpec.lengthMm).toBe(705);
    });

    it("scrapes Myntra mock product display page", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1 class="pdp-title">Roadster Pure Cotton Casual Shirt</h1>
            <div class="size-buttons-size-container">
              <button class="size-buttons-size-button">38</button>
              <button class="size-buttons-size-button">40</button>
              <button class="size-buttons-size-button">42</button>
            </div>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: "https://www.myntra.com/shirts/roadster/pdp" });
      const info = contentModule.extractProductInfo(dom.window.document, "https://www.myntra.com/shirts/roadster/pdp");

      expect(info.brand).toBe("Myntra");
      expect(info.title).toBe("Roadster Pure Cotton Casual Shirt");
      expect(info.availableSizes).toEqual(["38", "40", "42"]);
    });

    it("INVARIANT 1: Safely reports sizeChartFound = false when page lacks dimensions", () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Minimalist T-Shirt</h1>
            <div class="product-detail-size-selector">
              <button class="size-selector-list__item">M</button>
            </div>
          </body>
        </html>
      `;
      const dom = new JSDOM(html, { url: "https://www.zara.com/product" });
      const info = contentModule.extractProductInfo(dom.window.document, "https://www.zara.com/product");

      expect(info.sizeChartFound).toBe(false);
      expect(info.garmentDimensions).toBeUndefined();
    });
  });

  describe("Shadow DOM Widget Injection & Privacy Protection", () => {
    it("injects isolated shadow DOM sizing pill and ensures zero raw biometrics in DOM", () => {
      const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="mount-anchor"></div></body></html>`);
      const doc = dom.window.document;
      const mountElement = doc.getElementById("mount-anchor")!;

      const productInfo = {
        brand: "Uniqlo",
        brandId: "uniqlo",
        title: "AIRism Tee",
        availableSizes: ["S", "M", "L"],
        mountElement,
      };

      const recommendation = {
        recommendedSize: "M",
        fitScore: 94,
        confidenceLabel: "high",
        isBorderline: false,
        summaryText: "Optimal regular fit ease",
      };

      const host = contentModule.injectShadowWidget(productInfo, recommendation, doc);
      expect(host).not.toBeNull();
      expect(host.id).toBe("wearid-extension-host");
      expect(host.shadowRoot).not.toBeNull();

      const shadowHtml = host.shadowRoot.innerHTML;
      expect(shadowHtml).toContain("Size M");
      expect(shadowHtml).toContain("94% Match");

      // MANDATORY PRIVACY CHECK: Asserts that NO biometric keys exist in shadow DOM
      const forbiddenBiometrics = ["chestMm", "waistMm", "hipsMm", "inseamMm", "heightMm"];
      for (const key of forbiddenBiometrics) {
        expect(shadowHtml).not.toContain(key);
      }
    });

    it("throws critical error if recommendation attempts to pass raw biometrics", () => {
      const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
      const doc = dom.window.document;

      const productInfo = {
        brand: "Zara",
        brandId: "zara",
        title: "Shirt",
        availableSizes: ["M"],
      };

      const leakyRecommendation = {
        recommendedSize: "M",
        chestMm: 980, // LEAK ATTEMPT
      };

      expect(() => {
        contentModule.injectShadowWidget(productInfo, leakyRecommendation, doc);
      }).toThrow("CRITICAL BIOMETRIC PRIVACY LEAK");
    });
  });

  describe("Background Service Worker Offline Sizing Calculation", () => {
    it("computes deterministic size fallback based on profile and available sizes", () => {
      const athletic = backgroundModule.computeLocalDeterministicSize(
        { availableSizes: ["S", "M", "L", "XL"] },
        "athletic"
      );
      expect(["L", "XL"]).toContain(athletic.recommendedSize);

      const slim = backgroundModule.computeLocalDeterministicSize(
        { availableSizes: ["S", "M", "L", "XL"] },
        "slim"
      );
      expect(["S", "M"]).toContain(slim.recommendedSize);
    });
  });
});
