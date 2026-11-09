import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA Assets & Manifest Integration", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("manifest.json exists and adheres to PWA standalone specifications", () => {
    const manifestPath = path.join(publicDir, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.display).toBe("standalone");
    expect(manifest.orientation).toBe("portrait-primary");
    expect(manifest.theme_color).toBe("#425B48");
    expect(manifest.background_color).toBe("#F5F3ED");
    expect(manifest.start_url).toBe("/app");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    // Verify icon declarations
    const iconSources = manifest.icons.map((i: any) => i.src);
    expect(iconSources).toContain("/icons/icon-192.png");
    expect(iconSources).toContain("/icons/icon-512.png");
    expect(iconSources).toContain("/icons/icon-512-maskable.png");
  });

  it("public/icons contains valid PNG files with proper headers and dimensions", () => {
    const iconsDir = path.join(publicDir, "icons");
    expect(fs.existsSync(iconsDir)).toBe(true);

    const requiredIcons = [
      { name: "icon-192.png", width: 192, height: 192 },
      { name: "icon-512.png", width: 512, height: 512 },
      { name: "icon-512-maskable.png", width: 512, height: 512 },
      { name: "apple-touch-icon.png", width: 180, height: 180 },
    ];

    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    for (const icon of requiredIcons) {
      const filePath = path.join(iconsDir, icon.name);
      expect(fs.existsSync(filePath), `Icon ${icon.name} should exist`).toBe(true);

      const buf = fs.readFileSync(filePath);
      expect(buf.length).toBeGreaterThan(100);

      // Verify PNG magic bytes
      const sig = buf.subarray(0, 8);
      expect(sig.equals(pngSignature), `Icon ${icon.name} must have valid PNG signature`).toBe(true);

      // Verify IHDR width and height
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      expect(w).toBe(icon.width);
      expect(h).toBe(icon.height);
    }
  });

  it("public/sw.js exists and implements cache-first and network-first strategies", () => {
    const swPath = path.join(publicDir, "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const content = fs.readFileSync(swPath, "utf-8");
    expect(content).toContain("wearid-static-v1");
    expect(content).toContain("wearid-api-v1");
    expect(content).toContain("/offline.html");
    expect(content).toContain("addEventListener('install'");
    expect(content).toContain("addEventListener('activate'");
    expect(content).toContain("addEventListener('fetch'");
    expect(content).toContain("/api/");
  });

  it("public/offline.html is a standalone fallback page styled with WearID tokens", () => {
    const offlinePath = path.join(publicDir, "offline.html");
    expect(fs.existsSync(offlinePath)).toBe(true);

    const html = fs.readFileSync(offlinePath, "utf-8");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("#425B48"); // Forest green accent
    expect(html).toContain("#F5F3ED"); // Warm ivory
    expect(html).toContain("WearID");
    expect(html).toContain("offline");
    expect(html).toContain("Retry Connection");
  });
});
