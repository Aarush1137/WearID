import { describe, it, expect, beforeEach } from "vitest";
import {
  useBrandRequestStore,
  INITIAL_BRAND_REQUESTS,
} from "../../../src/core/state/brandRequestStore";

describe("Feature 6: Brand Request Voting Board", () => {
  beforeEach(() => {
    useBrandRequestStore.getState().resetToDefault();
  });

  it("should initialize with pre-seeded Indian D2C brands", () => {
    const { requests } = useBrandRequestStore.getState();
    expect(requests.length).toBeGreaterThanOrEqual(6);

    const names = requests.map((r) => r.brandName);
    expect(names).toContain("Bonkers Corner");
    expect(names).toContain("Rare Rabbit");
    expect(names).toContain("The Souled Store");
    expect(names).toContain("Beyoung");
    expect(names).toContain("Bewakoof");
    expect(names).toContain("Urbanic");

    // All pre-seeded items must have valid non-negative vote counts
    requests.forEach((r) => {
      expect(r.voteCount).toBeGreaterThan(0);
      expect(r.status).toBeDefined();
    });
  });

  it("should upvote a brand and update userVotes correctly", () => {
    const store = useBrandRequestStore.getState();
    const target = store.requests[0];
    const initialVotes = target.voteCount;

    const res = store.toggleVote(target.id);
    expect(res.success).toBe(true);
    expect(res.hasVoted).toBe(true);
    expect(res.newCount).toBe(initialVotes + 1);

    const updated = useBrandRequestStore.getState().requests.find((r) => r.id === target.id);
    expect(updated?.voteCount).toBe(initialVotes + 1);
    expect(useBrandRequestStore.getState().userVotes[target.id]).toBe(true);
  });

  it("should allow a user to retract their upvote cleanly", () => {
    const store = useBrandRequestStore.getState();
    const target = store.requests[0];
    const initialVotes = target.voteCount;

    // Upvote
    store.toggleVote(target.id);
    expect(useBrandRequestStore.getState().userVotes[target.id]).toBe(true);

    // Mock time passage past debounce window (>300ms)
    useBrandRequestStore.setState({
      lastVoteTime: { [target.id]: Date.now() - 500 },
    });

    // Retract
    const res = useBrandRequestStore.getState().toggleVote(target.id);
    expect(res.success).toBe(true);
    expect(res.hasVoted).toBe(false);
    expect(res.newCount).toBe(initialVotes);

    const updated = useBrandRequestStore.getState().requests.find((r) => r.id === target.id);
    expect(updated?.voteCount).toBe(initialVotes);
    expect(useBrandRequestStore.getState().userVotes[target.id]).toBe(false);
  });

  it("should enforce anti-duplicate debounce guard within 300ms", () => {
    const store = useBrandRequestStore.getState();
    const target = store.requests[0];

    // First click succeeds
    const first = store.toggleVote(target.id);
    expect(first.success).toBe(true);

    // Immediate second click (< 300ms) is blocked
    const second = useBrandRequestStore.getState().toggleVote(target.id);
    expect(second.success).toBe(false);
    expect(second.error).toContain("Too fast");
  });

  it("should detect duplicate for brands already live in PILOT_BRANDS catalog", () => {
    const store = useBrandRequestStore.getState();

    const uniqloCheck = store.checkDuplicate("Uniqlo India");
    expect(uniqloCheck.isLiveInCatalog).toBe(true);
    expect(uniqloCheck.liveBrand?.id).toBe("uniqlo");

    const snitchCheck = store.checkDuplicate("snitch");
    expect(snitchCheck.isLiveInCatalog).toBe(true);
    expect(snitchCheck.liveBrand?.name).toBe("Snitch");

    const zaraCheck = store.checkDuplicate("Zara");
    expect(zaraCheck.isLiveInCatalog).toBe(true);
  });

  it("should reject submission of brands already in catalog with friendly message", () => {
    const store = useBrandRequestStore.getState();

    const res = store.submitRequest({
      brandName: "Uniqlo",
      primaryCategory: "casual",
    });

    expect(res.success).toBe(false);
    expect(res.isLiveInCatalog).toBe(true);
    expect(res.message).toContain("already live in WearID");
  });

  it("should auto-upvote when attempting to submit a brand already requested", () => {
    const store = useBrandRequestStore.getState();
    const souledStoreInitial = store.requests.find((r) => r.brandName === "The Souled Store")!;
    const initialVotes = souledStoreInitial.voteCount;

    const res = store.submitRequest({
      brandName: "The Souled Store",
      primaryCategory: "casual",
      description: "Awesome t-shirts",
    });

    expect(res.success).toBe(true);
    expect(res.isAlreadyRequested).toBe(true);
    expect(res.message).toContain("already on the voting board");

    const updated = useBrandRequestStore.getState().requests.find((r) => r.brandName === "The Souled Store")!;
    expect(updated.voteCount).toBe(initialVotes + 1);
    expect(useBrandRequestStore.getState().userVotes[souledStoreInitial.id]).toBe(true);
  });

  it("should submit a brand new brand request successfully", () => {
    const store = useBrandRequestStore.getState();
    const initialLength = store.requests.length;

    const res = store.submitRequest({
      brandName: "Bluorng",
      websiteUrl: "https://bluorng.com",
      primaryCategory: "streetwear",
      description: "High quality oversized tees and heavyweight cotton.",
    });

    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();

    const { requests, userVotes } = useBrandRequestStore.getState();
    expect(requests.length).toBe(initialLength + 1);

    const created = requests.find((r) => r.id === res.id);
    expect(created?.brandName).toBe("Bluorng");
    expect(created?.voteCount).toBe(1);
    expect(created?.status).toBe("open");
    expect(userVotes[res.id!]).toBe(true);
  });

  it("should support filtering and sorting updates", () => {
    const store = useBrandRequestStore.getState();

    store.setSearchQuery("Corner");
    expect(useBrandRequestStore.getState().searchQuery).toBe("Corner");

    store.setCategoryFilter("streetwear");
    expect(useBrandRequestStore.getState().categoryFilter).toBe("streetwear");

    store.setStatusFilter("open");
    expect(useBrandRequestStore.getState().statusFilter).toBe("open");

    store.setSortBy("alphabetical");
    expect(useBrandRequestStore.getState().sortBy).toBe("alphabetical");
  });
});
