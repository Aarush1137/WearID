/**
 * WearID Connect Standalone Client Script v1.0
 * Lightweight (<25KB), zero-dependency embed for e-commerce store product pages.
 * Enforces Invariant 7 (Zero Biometric Leakage) during external retailer sizing handshakes.
 */
(function (window, document) {
  "use strict";

  function WearIDConnect(config) {
    if (!config || !config.merchantId) {
      throw new Error("WearIDConnect Error: merchantId is required in configuration.");
    }
    this.config = config;
    this.apiBaseUrl = config.apiBaseUrl || "/api/v1/portability";
    this.modalEl = null;
  }

  WearIDConnect.init = function (config) {
    var instance = new WearIDConnect(config);
    window.WearIDInstance = instance;
    return instance;
  };

  WearIDConnect.prototype.getRecommendation = function (params) {
    var self = this;
    var payload = {
      token: params.token,
      retailerId: self.config.merchantId,
      productId: params.productId,
      category: params.category,
      fitIntent: params.fitIntent || self.config.fitIntent || "regular",
    };

    return fetch(self.apiBaseUrl + "/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            throw new Error(err.error || "HTTP error " + res.status);
          });
        }
        return res.json();
      })
      .then(function (data) {
        // Assert zero biometric leakage
        var forbidden = ["chestMm", "waistMm", "hipsMm", "inseamMm", "shoulderWidthMm"];
        for (var i = 0; i < forbidden.length; i++) {
          if (forbidden[i] in data) {
            throw new Error("CRITICAL SECURITY VIOLATION: Biometric parameter " + forbidden[i] + " found in response.");
          }
        }
        return data;
      });
  };

  WearIDConnect.prototype.renderButton = function (container, options) {
    var self = this;
    options = options || {};
    var el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) {
      throw new Error("WearIDConnect: Target container element not found.");
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wearid-connect-button";
    btn.setAttribute("aria-label", "Find your fit with WearID");
    btn.setAttribute("data-wearid-product", options.productId || "");

    var isSolid = options.variant !== "outline";
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.gap = "8px";
    btn.style.padding = "10px 18px";
    btn.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "600";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.minHeight = "44px";
    btn.style.transition = "all 0.2s ease";

    if (isSolid) {
      btn.style.backgroundColor = "#425B48";
      btn.style.color = "#FFFFFF";
      btn.style.border = "1px solid #425B48";
    } else {
      btn.style.backgroundColor = "#FFFFFF";
      btn.style.color = "#425B48";
      btn.style.border = "1.5px solid #425B48";
    }

    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14.5A2 2 0 0 0 3.5 17H20.5a2 2 0 0 0 1.5-2.5L14.2 7.1c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z"/>' +
      '<path d="M12 7v5"/>' +
      "</svg>" +
      "<span>" +
      (options.label || "Fit with WearID") +
      "</span>";

    btn.addEventListener("click", function () {
      self.openModal({
        productId: options.productId,
        category: options.category,
        defaultToken: options.token,
      });
    });

    el.appendChild(btn);
    return btn;
  };

  WearIDConnect.prototype.openModal = function (options) {
    var self = this;
    options = options || {};

    if (self.modalEl) {
      self.modalEl.remove();
    }

    var overlay = document.createElement("div");
    overlay.className = "wearid-modal-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(36,40,33,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px;";

    var dialog = document.createElement("div");
    dialog.style.cssText =
      "background:#FFFFFF;border-radius:12px;max-width:440px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.2);border:1px solid #DDE4D9;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;color:#242821;";

    dialog.innerHTML =
      '<div style="background:#F5F3ED;padding:18px 24px;border-bottom:1px solid #DDE4D9;display:flex;align-items:center;justify-content:space-between;">' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<span style="background:#425B48;color:#FFFFFF;border-radius:6px;padding:4px 8px;font-weight:700;font-size:13px;">WearID</span>' +
      '<span style="font-size:14px;font-weight:600;color:#425B48;">Connect</span>' +
      "</div>" +
      '<button id="wearid-close-btn" style="background:none;border:none;font-size:20px;cursor:pointer;color:#73776F;min-width:32px;min-height:32px;">&times;</button>' +
      "</div>" +
      '<div style="padding:24px;">' +
      '<h3 style="font-size:17px;font-weight:700;margin:0 0 8px 0;color:#242821;">Sovereign Sizing Handshake</h3>' +
      '<p style="font-size:13px;color:#73776F;margin:0 0 16px 0;line-height:1.4;">Zero biometric data is transmitted. Only the deterministic size recommendation is calculated.</p>' +
      '<label style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:#73776F;margin-bottom:6px;">WearID Token</label>' +
      '<input id="wearid-tok-input" type="text" placeholder="wearid_tok_... or select demo below" value="' +
      (options.defaultToken || "") +
      '" style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #DDE4D9;border-radius:6px;font-family:monospace;font-size:12px;margin-bottom:12px;" />' +
      '<div style="margin-bottom:16px;">' +
      '<span style="font-size:11px;color:#73776F;display:block;margin-bottom:6px;">Quick Presets:</span>' +
      '<div style="display:flex;gap:6px;">' +
      '<button type="button" class="wearid-chip" data-val="regular" style="flex:1;padding:6px;font-size:11px;font-weight:600;border:1px solid #DDE4D9;background:#F5F3ED;border-radius:4px;cursor:pointer;">Regular</button>' +
      '<button type="button" class="wearid-chip" data-val="athletic" style="flex:1;padding:6px;font-size:11px;font-weight:600;border:1px solid #DDE4D9;background:#F5F3ED;border-radius:4px;cursor:pointer;">Athletic</button>' +
      '<button type="button" class="wearid-chip" data-val="slim" style="flex:1;padding:6px;font-size:11px;font-weight:600;border:1px solid #DDE4D9;background:#F5F3ED;border-radius:4px;cursor:pointer;">Slim</button>' +
      "</div>" +
      "</div>" +
      '<button id="wearid-submit-btn" style="width:100%;background:#425B48;color:#FFFFFF;border:none;padding:12px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;min-height:44px;">Calculate Deterministic Size</button>' +
      '<div id="wearid-res-box" style="display:none;margin-top:16px;padding:14px;border-radius:8px;background:#F5F3ED;border:1px solid #DDE4D9;"></div>' +
      "</div>";

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    self.modalEl = overlay;

    dialog.querySelector("#wearid-close-btn").addEventListener("click", function () {
      self.closeModal();
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) self.closeModal();
    });

    var chips = dialog.querySelectorAll(".wearid-chip");
    var input = dialog.querySelector("#wearid-tok-input");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        input.value = "wearid_demo_" + chip.getAttribute("data-val");
      });
    });

    var submitBtn = dialog.querySelector("#wearid-submit-btn");
    var resBox = dialog.querySelector("#wearid-res-box");

    submitBtn.addEventListener("click", function () {
      var tok = input.value.trim();
      if (!tok) {
        alert("Please enter a WearID token.");
        return;
      }
      submitBtn.textContent = "Calculating fit...";
      submitBtn.disabled = true;

      self
        .getRecommendation({
          token: tok,
          productId: options.productId,
          category: options.category,
        })
        .then(function (rec) {
          resBox.style.display = "block";
          resBox.innerHTML =
            '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;">' +
            '<div><span style="font-size:11px;text-transform:uppercase;color:#73776F;font-weight:700;">Recommended Size</span><div style="font-size:26px;font-weight:800;color:#425B48;">' +
            rec.recommendedSize +
            "</div></div>" +
            '<div style="text-align:right;"><span style="display:inline-block;padding:3px 8px;font-size:11px;font-weight:700;border-radius:12px;background:#DDE4D9;color:#2D6A4F;">' +
            Math.round(rec.fitScore * 100) +
            "% Match</span></div>" +
            "</div>" +
            '<p style="font-size:12px;color:#242821;margin:0 0 12px 0;line-height:1.4;">' +
            rec.summaryText +
            "</p>" +
            '<div style="font-size:10px;color:#73776F;margin-bottom:12px;">✓ Invariant 7: Zero biometric values transferred (latency: ' +
            rec.latencyMs +
            "ms)</div>" +
            '<button id="wearid-apply-btn" style="width:100%;background:#242821;color:#FFFFFF;border:none;padding:10px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;min-height:40px;">Apply Size ' +
            rec.recommendedSize +
            " to Store</button>";

          resBox.querySelector("#wearid-apply-btn").addEventListener("click", function () {
            self.dispatchSizeSelection({
              recommendedSize: rec.recommendedSize,
              confidence: rec.confidence,
              confidenceLabel: rec.confidenceLabel,
              fitScore: rec.fitScore,
              summaryText: rec.summaryText,
              productId: options.productId,
            });
            self.closeModal();
          });
        })
        .catch(function (err) {
          resBox.style.display = "block";
          resBox.innerHTML =
            '<div style="color:#C38367;font-size:12px;font-weight:600;">Error: ' +
            (err.message || "Failed to calculate fit") +
            "</div>";
        })
        .finally(function () {
          submitBtn.textContent = "Calculate Deterministic Size";
          submitBtn.disabled = false;
        });
    });
  };

  WearIDConnect.prototype.closeModal = function () {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  };

  WearIDConnect.prototype.dispatchSizeSelection = function (detail) {
    if (this.config.onSizeSelected) {
      this.config.onSizeSelected(detail);
    }
    if (typeof window !== "undefined") {
      var evt = new CustomEvent("wearid:size-selected", { detail: detail, bubbles: true });
      window.dispatchEvent(evt);
    }
  };

  window.WearIDConnect = WearIDConnect;
})(typeof window !== "undefined" ? window : globalThis, typeof document !== "undefined" ? document : {});
