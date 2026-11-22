/**
 * Offline Sync Queue for WearID
 * Buffers profile mutations when the client is disconnected or network requests fail.
 * Replays queued items in FIFO order when connectivity is restored.
 */

export type SyncEntityType =
  | "profile"
  | "measurements"
  | "preference"
  | "reference_garment"
  | "snapshot"
  | "wishlist";

export type SyncAction = "upsert" | "delete";

export interface SyncQueueItem {
  id: string;
  profileId: string;
  entityType: SyncEntityType;
  action: SyncAction;
  payload: any;
  timestamp: string; // ISO 8601
  retryCount: number;
}

const STORAGE_KEY = "wearid_offline_sync_queue";

// In-memory fallback for SSR / non-browser environments
let inMemoryQueue: SyncQueueItem[] = [];

/**
 * Checks whether client currently has network connectivity.
 */
export function isOnline(): boolean {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    return navigator.onLine;
  }
  return true;
}

/**
 * Retrieves the current offline queue from storage or in-memory fallback.
 */
export function getOfflineQueue(): SyncQueueItem[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [...inMemoryQueue];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [...inMemoryQueue];
  }
}

/**
 * Saves the offline queue to storage or in-memory fallback.
 */
function saveQueue(queue: SyncQueueItem[]): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    inMemoryQueue = [...queue];
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    inMemoryQueue = [...queue];
  }
}

/**
 * Enqueues a mutation to be synced when online.
 */
export function enqueueOfflineItem(
  item: Omit<SyncQueueItem, "id" | "timestamp" | "retryCount">
): SyncQueueItem {
  const queue = getOfflineQueue();
  const queueItem: SyncQueueItem = {
    ...item,
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(queueItem);
  saveQueue(queue);
  return queueItem;
}

/**
 * Removes a specific item from the offline queue.
 */
export function removeOfflineItem(id: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  saveQueue(queue);
}

/**
 * Increments the retry count of a queued item.
 */
export function incrementOfflineRetry(id: string): void {
  const queue = getOfflineQueue().map((item) =>
    item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
  );
  saveQueue(queue);
}

/**
 * Clears the offline queue.
 */
export function clearOfflineQueue(): void {
  saveQueue([]);
}

/**
 * Drains the offline queue by processing each item with the provided handler.
 * Successfully processed items are removed; failed items are kept with incremented retry count.
 */
export async function drainOfflineQueue(
  processor: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      const ok = await processor(item);
      if (ok) {
        processed++;
      } else {
        failed++;
        remaining.push({ ...item, retryCount: item.retryCount + 1 });
      }
    } catch {
      failed++;
      remaining.push({ ...item, retryCount: item.retryCount + 1 });
    }
  }

  saveQueue(remaining);
  return { processed, failed };
}

/**
 * Registers a listener for the browser 'online' event to trigger automatic queue draining.
 */
export function registerOnlineListener(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.addEventListener) {
    return () => {};
  }

  const handler = () => {
    callback();
  };

  window.addEventListener("online", handler);
  return () => {
    window.removeEventListener("online", handler);
  };
}
