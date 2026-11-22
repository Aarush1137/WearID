/**
 * WearID Chrome Extension — Popup Controller
 */

function detectRetailerFromUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("zara.com")) return "Zara";
  if (lower.includes("hm.com")) return "H&M";
  if (lower.includes("uniqlo.com")) return "Uniqlo";
  if (lower.includes("myntra.com")) return "Myntra";
  return null;
}

function initPopup() {
  const profileSelect = document.getElementById("profile-select");
  const retailerText = document.getElementById("retailer-text");
  const retailerDot = document.getElementById("retailer-dot");

  if (!profileSelect || !retailerText || !retailerDot) return;

  // 1. Load active profile from storage
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.get(["activeProfile"], (result) => {
      if (result.activeProfile) {
        profileSelect.value = result.activeProfile;
      }
    });

    // 2. Query active tab to detect retailer
    if (chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "";
        const retailer = detectRetailerFromUrl(currentUrl);

        if (retailer) {
          retailerText.textContent = `${retailer} Product Page`;
          retailerDot.classList.add("active");
        } else {
          retailerText.textContent = "Not on supported retailer";
          retailerDot.classList.remove("active");
        }
      });
    }

    // 3. Handle Profile Switch
    profileSelect.addEventListener("change", (e) => {
      const newProfile = e.target.value;
      const newToken = `wearid_demo_${newProfile}`;
      chrome.storage.local.set({
        activeProfile: newProfile,
        activeToken: newToken,
      });
    });
  }
}

// Auto-run if running in DOM
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initPopup);
}

// Export for Node/Vitest test runner
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    detectRetailerFromUrl,
    initPopup,
  };
}
