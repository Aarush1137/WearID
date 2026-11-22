import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isOnline,
  getOfflineQueue,
  enqueueOfflineItem,
  removeOfflineItem,
  clearOfflineQueue,
  drainOfflineQueue,
  incrementOfflineRetry,
} from "@/core/sync/offlineQueue";
import {
  syncProfiles,
  resolveConflictLWW,
  mapRemoteToLocalProfile,
  mapLocalToRemoteProfile,
  getSyncStatus,
} from "@/core/sync/profileSyncService";
import { useProfileStore, UserProfile } from "@/core/state/profileStore";
import { createMockSupabaseClient } from "@/lib/supabase/mock-client";

describe("Profile Sync & Offline Queue Suite (Milestone 6 Feature 1)", () => {
  beforeEach(() => {
    clearOfflineQueue();
    useProfileStore.getState().resetToSampleData();
  });

  describe("Offline Queue Management", () => {
    it("reports online connectivity by default in test environment", () => {
      expect(typeof isOnline()).toBe("boolean");
    });

    it("enqueues and retrieves offline sync items with generated UUIDs and ISO timestamps", () => {
      const item = enqueueOfflineItem({
        profileId: "prof_test_1",
        entityType: "profile",
        action: "upsert",
        payload: { name: "Test Sync Profile" },
      });

      expect(item.id).toBeDefined();
      expect(item.profileId).toBe("prof_test_1");
      expect(item.retryCount).toBe(0);
      expect(new Date(item.timestamp).getTime()).toBeGreaterThan(0);

      const queue = getOfflineQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].profileId).toBe("prof_test_1");
    });

    it("removes specific item from queue", () => {
      const item1 = enqueueOfflineItem({
        profileId: "prof_1",
        entityType: "profile",
        action: "upsert",
        payload: {},
      });
      const item2 = enqueueOfflineItem({
        profileId: "prof_2",
        entityType: "profile",
        action: "upsert",
        payload: {},
      });

      expect(getOfflineQueue().length).toBe(2);
      removeOfflineItem(item1.id);

      const remaining = getOfflineQueue();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(item2.id);
    });

    it("increments retry counter on failure", () => {
      const item = enqueueOfflineItem({
        profileId: "prof_retry",
        entityType: "profile",
        action: "upsert",
        payload: {},
      });

      incrementOfflineRetry(item.id);
      const queue = getOfflineQueue();
      expect(queue[0].retryCount).toBe(1);
    });

    it("drains queue sequentially and retains failed items", async () => {
      enqueueOfflineItem({
        profileId: "prof_success",
        entityType: "profile",
        action: "upsert",
        payload: { success: true },
      });
      enqueueOfflineItem({
        profileId: "prof_fail",
        entityType: "profile",
        action: "upsert",
        payload: { success: false },
      });

      const result = await drainOfflineQueue(async (item) => {
        return item.payload.success === true;
      });

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);

      const remaining = getOfflineQueue();
      expect(remaining.length).toBe(1);
      expect(remaining[0].profileId).toBe("prof_fail");
      expect(remaining[0].retryCount).toBe(1);
    });
  });

  describe("Conflict Resolution (Last-Write-Wins)", () => {
    const baseLocal: UserProfile = {
      id: "prof_lww_1",
      name: "Local Profile",
      relation: "self",
      gender: "male",
      measurements: {
        profileId: "prof_lww_1",
        chestMm: 980,
        waistMm: 820,
        hipsMm: 960,
        heightMm: 1780,
        inseamMm: 790,
        shoulderWidthMm: 450,
        isCurrent: true,
      },
      preferences: {},
      referenceGarments: [],
      createdAt: "2026-03-01T08:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z",
    };

    it("declares local_wins when local timestamp is newer", () => {
      const remote = {
        id: "prof_lww_1",
        name: "Remote Older",
        updated_at: "2026-03-01T10:00:00Z",
      };

      const outcome = resolveConflictLWW(baseLocal, remote);
      expect(outcome).toBe("local_wins");
    });

    it("declares remote_wins when remote timestamp is newer", () => {
      const remote = {
        id: "prof_lww_1",
        name: "Remote Newer",
        updated_at: "2026-03-01T14:00:00Z",
      };

      const outcome = resolveConflictLWW(baseLocal, remote);
      expect(outcome).toBe("remote_wins");
    });

    it("favors local_wins when timestamps are identical", () => {
      const remote = {
        id: "prof_lww_1",
        name: "Remote Identical",
        updated_at: "2026-03-01T12:00:00Z",
      };

      const outcome = resolveConflictLWW(baseLocal, remote);
      expect(outcome).toBe("local_wins");
    });
  });

  describe("DTO Mapping & Canonical Units (Invariant 4)", () => {
    it("maps local profile to remote schema with user_id and timestamps", () => {
      const local = useProfileStore.getState().profiles[0];
      const remoteRow = mapLocalToRemoteProfile(local, "usr_supabase_123");

      expect(remoteRow.id).toBe(local.id);
      expect(remoteRow.user_id).toBe("usr_supabase_123");
      expect(remoteRow.relationship).toBe(local.relation);
      expect(remoteRow.is_primary).toBe(true);
    });

    it("maps remote database record to local UserProfile preserving canonical mm", () => {
      const remoteRecord = {
        id: "prof_remote_456",
        name: "Cloud User",
        relationship: "self",
        gender: "male",
        chest_mm: 1020,
        waist_mm: 850,
        hips_mm: 990,
        shoulder_width_mm: 460,
        height_mm: 1820,
        inseam_mm: 810,
        updated_at: "2026-03-01T16:00:00Z",
        created_at: "2026-03-01T10:00:00Z",
      };

      const mapped = mapRemoteToLocalProfile(remoteRecord);
      expect(mapped.id).toBe("prof_remote_456");
      expect(mapped.name).toBe("Cloud User");
      expect(mapped.measurements.chestMm).toBe(1020);
      expect(mapped.measurements.waistMm).toBe(850);
      expect(mapped.measurements.hipsMm).toBe(990);
      expect(mapped.measurements.heightMm).toBe(1820);
    });
  });

  describe("Bidirectional syncProfiles Execution", () => {
    it("syncs cleanly using isomorphic MockSupabaseClient", async () => {
      const mockClient = createMockSupabaseClient();
      const result = await syncProfiles("usr_test_mock_1", mockClient);

      expect(result.success).toBe(true);
      expect(result.syncedProfileCount).toBeGreaterThanOrEqual(1);
      expect(result.lastSyncedAt).toBeDefined();
      expect(getSyncStatus()).toBe("synced");
    });

    it("buffers mutations when offline", async () => {
      // Mock navigator.onLine as false
      const originalNavigator = global.navigator;
      // @ts-ignore
      global.navigator = { onLine: false };

      try {
        const result = await syncProfiles("usr_test_mock_offline");
        expect(result.success).toBe(false);
        expect(result.error).toContain("offline");
        expect(getOfflineQueue().length).toBeGreaterThan(0);
        expect(getSyncStatus()).toBe("offline");
      } finally {
        global.navigator = originalNavigator;
      }
    });
  });
});
