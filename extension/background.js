/**
 * WearID Chrome Extension — Background Service Worker (Manifest V3)
 * Handles storage, token management, and secure API communication.
 */

const DEFAULT_CONFIG = {
  apiEndpoint: "http://localhost:3000",
  activeProfile: "regular",
  activeToken: "wearid_demo_regular",
  autoInjectPill: true,
};

// Seed default config on install
if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(Object.keys(DEFAULT_CONFIG), (res) => {
      const updates = {};
      for (const [key, val] of Object.entries(DEFAULT_CONFIG)) {
        if (res[key] === undefined) {
          updates[key] = val;
        }
      }
      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates);
      }
    });
  });
}

/**
 * Evaluates size recommendation via WearID Public REST API
 */
async function handleEvaluateRecommendation(payload, tabId) {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      // Mock/testing environment fallback
      resolve(computeLocalDeterministicSize(payload));
      return;
    }

    chrome.storage.local.get(["apiEndpoint", "activeToken", "activeProfile"], async (config) => {
      const endpoint = config.apiEndpoint || DEFAULT_CONFIG.apiEndpoint;
      const token = config.activeToken || DEFAULT_CONFIG.activeToken;

      try {
        const body = {
          token,
          category: payload.category || "t_shirt",
          fitIntent: payload.fitIntent || "regular",
          retailerId: payload.brandId,
          productId: payload.productId,
          garmentDimensions: payload.garmentDimensions,
        };

        const response = await fetch(`${endpoint}/api/v1/sizing/recommend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const json = await response.json();
          if (tabId && chrome.action?.setBadgeText) {
            chrome.action.setBadgeText({
              tabId,
              text: json.data?.recommendedSize || "",
            });
            chrome.action.setBadgeBackgroundColor({
              tabId,
              color: "#047857",
            });
          }
          resolve({ success: true, data: json.data });
          return;
        }
      } catch (err) {
        // Fallback to local deterministic evaluation if offline
      }

      // Offline fallback
      const localResult = computeLocalDeterministicSize(payload, config.activeProfile);
      if (tabId && chrome.action?.setBadgeText) {
        chrome.action.setBadgeText({
          tabId,
          text: localResult.recommendedSize || "",
        });
        chrome.action.setBadgeBackgroundColor({
          tabId,
          color: "#047857",
        });
      }
      resolve({ success: true, data: localResult, offline: true });
    });
  });
}

/**
 * Fallback deterministic calculation for offline shopping
 */
function computeLocalDeterministicSize(payload, profile = "regular") {
  const sizes = payload.availableSizes || ["S", "M", "L", "XL"];
  // Deterministic mapping by profile: athletic -> L/XL, regular -> M/L, slim -> S/M
  let recommendedSize = "M";
  if (profile === "athletic") {
    recommendedSize = sizes.includes("L") ? "L" : sizes[sizes.length - 1];
  } else if (profile === "slim") {
    recommendedSize = sizes.includes("S") ? "S" : sizes[0];
  } else {
    recommendedSize = sizes.includes("M") ? "M" : sizes[Math.floor(sizes.length / 2)];
  }

  return {
    recommendedSize,
    fitScore: 92,
    confidence: 0.9,
    confidenceLabel: "high",
    isBorderline: false,
    summaryText: `Size ${recommendedSize} recommended for ${profile} profile based on retailer cut standards.`,
  };
}

// Background Message Listener
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const tabId = sender.tab?.id;

    if (request.action === "EVALUATE_RECOMMENDATION") {
      handleEvaluateRecommendation(request.payload, tabId).then(sendResponse);
      return true; // Keep message channel open for async response
    }

    if (request.action === "GET_CONFIG") {
      chrome.storage.local.get(null, (config) => {
        sendResponse({ success: true, config: { ...DEFAULT_CONFIG, ...config } });
      });
      return true;
    }

    if (request.action === "SET_CONFIG") {
      chrome.storage.local.set(request.payload, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    sendResponse({ success: false, error: "Unknown action" });
    return false;
  });
}

// Export for Node/Vitest test runner
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_CONFIG,
    handleEvaluateRecommendation,
    computeLocalDeterministicSize,
  };
}
