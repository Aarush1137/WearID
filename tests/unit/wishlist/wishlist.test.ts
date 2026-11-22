import { describe, it, expect, beforeEach } from "vitest";
import { useProfileStore, WishlistItem } from "@/core/state/profileStore";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";

describe("Wishlist & Save for Later Suite (Milestone 6 Feature 3)", () => {
  const profileIdA = "profile_self_primary";
  const profileIdB = "profile_partner_ananya";

  beforeEach(() => {
    useProfileStore.getState().resetToSampleData();
  });

  it("initializes profiles with empty wishlist arrays", () => {
    const store = useProfileStore.getState();
    const profile = store.getActiveProfile();
    expect(Array.isArray(profile.wishlist)).toBe(true);
    expect(profile.wishlist?.length).toBe(0);
  });

  it("adds an item to active profile wishlist with deterministic sizing tag", () => {
    const store = useProfileStore.getState();
    const activeProfile = store.getActiveProfile();
    const pilotProduct = PILOT_PRODUCTS[0]; // Uniqlo AIRism Oversized

    const rec = evaluateSizeRecommendation({
      profile: activeProfile.measurements,
      fitPreference: {
        profileId: activeProfile.id,
        category: pilotProduct.category,
        fitType: "regular",
      },
      garmentDimensions: pilotProduct.layer3Specs,
      brandSizeCharts: pilotProduct.layer2Charts,
      fabricSpec: pilotProduct.fabric,
    });

    store.addToWishlist(profileIdA, {
      productId: pilotProduct.id,
      brandId: pilotProduct.brandId,
      brandName: pilotProduct.brandName,
      productName: pilotProduct.name,
      category: pilotProduct.category,
      priceInr: pilotProduct.priceInr,
      savedSize: rec.recommendedSize,
      fitScore: rec.fitScore,
      confidenceLabel: rec.confidenceLabel,
      fitSilhouette: pilotProduct.fitSilhouette,
      notes: rec.summaryText,
    });

    const updatedProfile = useProfileStore.getState().getActiveProfile();
    expect(updatedProfile.wishlist?.length).toBe(1);

    const saved = updatedProfile.wishlist?.[0];
    expect(saved?.productId).toBe(pilotProduct.id);
    expect(saved?.savedSize).toBe(rec.recommendedSize);
    expect(saved?.fitScore).toBe(rec.fitScore);
    expect(saved?.confidenceLabel).toBe(rec.confidenceLabel);
    expect(saved?.savedAt).toBeDefined();
  });

  it("updates existing wishlist item if bookmarked again", () => {
    const store = useProfileStore.getState();
    const productId = "prod_uniqlo_airism_oversized";

    store.addToWishlist(profileIdA, {
      productId,
      brandId: "uniqlo",
      brandName: "Uniqlo India",
      productName: "AIRism Oversized",
      category: "t_shirt_oversized",
      priceInr: 1490,
      savedSize: "M",
      fitScore: 0.92,
      confidenceLabel: "high",
      fitSilhouette: "oversized",
    });

    expect(useProfileStore.getState().getActiveProfile().wishlist?.length).toBe(1);

    // Re-bookmark with recalibrated size
    store.addToWishlist(profileIdA, {
      productId,
      brandId: "uniqlo",
      brandName: "Uniqlo India",
      productName: "AIRism Oversized",
      category: "t_shirt_oversized",
      priceInr: 1490,
      savedSize: "L",
      fitScore: 0.95,
      confidenceLabel: "high",
      fitSilhouette: "oversized",
    });

    const wishlist = useProfileStore.getState().getActiveProfile().wishlist;
    expect(wishlist?.length).toBe(1);
    expect(wishlist?.[0].savedSize).toBe("L");
    expect(wishlist?.[0].fitScore).toBe(0.95);
  });

  it("removes an item by id from wishlist", () => {
    const store = useProfileStore.getState();

    store.addToWishlist(profileIdA, {
      productId: "prod_item_1",
      brandId: "uniqlo",
      brandName: "Uniqlo India",
      productName: "Item 1",
      category: "t_shirt",
      priceInr: 990,
      savedSize: "M",
      fitScore: 0.9,
      confidenceLabel: "high",
      fitSilhouette: "regular",
    });

    store.addToWishlist(profileIdA, {
      productId: "prod_item_2",
      brandId: "levis",
      brandName: "Levi's India",
      productName: "Item 2",
      category: "jeans",
      priceInr: 3999,
      savedSize: "32x32",
      fitScore: 0.93,
      confidenceLabel: "high",
      fitSilhouette: "regular",
    });

    let wishlist = useProfileStore.getState().getActiveProfile().wishlist || [];
    expect(wishlist.length).toBe(2);

    const itemToRemove = wishlist.find((w) => w.productId === "prod_item_1");
    expect(itemToRemove).toBeDefined();

    store.removeFromWishlist(profileIdA, itemToRemove!.id);

    wishlist = useProfileStore.getState().getActiveProfile().wishlist || [];
    expect(wishlist.length).toBe(1);
    expect(wishlist[0].productId).toBe("prod_item_2");
  });

  it("maintains strict isolation between multi-user profile wishlists", () => {
    const store = useProfileStore.getState();

    // Create a secondary profile to test isolation
    const partnerId = store.addProfile({
      name: "Partner Ananya",
      relation: "partner",
      gender: "female",
      measurements: {
        profileId: "temp",
        chestMm: 860,
        waistMm: 680,
        hipsMm: 930,
        heightMm: 1650,
        inseamMm: 740,
        shoulderWidthMm: 390,
        isCurrent: true,
      },
      preferences: {},
      referenceGarments: [],
    });

    // Add item to User A's wishlist
    store.addToWishlist(profileIdA, {
      productId: "prod_self_only",
      brandId: "uniqlo",
      brandName: "Uniqlo",
      productName: "Self Only Shirt",
      category: "shirt_casual",
      priceInr: 1990,
      savedSize: "L",
      fitScore: 0.91,
      confidenceLabel: "high",
      fitSilhouette: "relaxed",
    });

    const currentProfiles = useProfileStore.getState().profiles;
    const profileA = currentProfiles.find((p) => p.id === profileIdA);
    const profileB = currentProfiles.find((p) => p.id === partnerId);

    expect(profileA?.wishlist?.some((w) => w.productId === "prod_self_only")).toBe(true);
    expect(profileB?.wishlist?.some((w) => w.productId === "prod_self_only")).toBe(false);
  });
});
