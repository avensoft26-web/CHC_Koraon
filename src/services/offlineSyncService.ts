// ==============================================================
// CHAUDHARY HOSPITAL MANAGEMENT SYSTEM - OFFLINE RESILIENCE SERVICE
// Manages local clinical vitals queue and auto-sync on Wi-Fi reconnect
// ==============================================================

import { api } from './api';

export interface OfflineVitalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  uhid?: string;
  bed_no?: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  notes?: string;
  recordedAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

const STORAGE_KEY = 'chaudhary_offline_vitals_queue';

function readQueue(): OfflineVitalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[offlineSyncService] Error reading queue from storage:', err);
    return [];
  }
}

function writeQueue(queue: OfflineVitalRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('offline-vitals-changed', {
      detail: { pendingCount: queue.filter(q => q.status === 'pending').length }
    }));
  } catch (err) {
    console.error('[offlineSyncService] Error saving queue to storage:', err);
  }
}

/**
 * Stores a clinical vital reading locally when Wi-Fi / internet is disconnected.
 */
export function saveOfflineVital(data: {
  patient_id: string;
  patient_name: string;
  uhid?: string;
  bed_no?: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  notes?: string;
}): OfflineVitalRecord {
  const record: OfflineVitalRecord = {
    ...data,
    id: `ovr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    recordedAt: new Date().toISOString(),
    status: 'pending'
  };

  const queue = readQueue();
  queue.push(record);
  writeQueue(queue);

  console.log('[offlineSyncService] Saved vital locally to offline queue:', record.id, record.patient_name);
  return record;
}

/**
 * Returns all vitals currently queued locally.
 */
export function getPendingVitals(): OfflineVitalRecord[] {
  return readQueue().filter(item => item.status === 'pending' || item.status === 'failed');
}

/**
 * Returns count of unsynced offline vitals.
 */
export function getPendingVitalsCount(): number {
  return getPendingVitals().length;
}

/**
 * Drain the offline queue by sending all pending records to the backend.
 */
export async function syncPendingVitals(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    console.log('[offlineSyncService] Device is offline, skipping sync.');
    return { synced: 0, failed: 0 };
  }

  const queue = readQueue();
  const pending = queue.filter(item => item.status === 'pending' || item.status === 'failed');
  if (pending.length === 0) return { synced: 0, failed: 0 };

  console.log(`[offlineSyncService] Starting sync of ${pending.length} offline vitals...`);
  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    item.status = 'syncing';
    writeQueue(queue);

    try {
      await api.vitals.create({
        patient_id: item.patient_id,
        patient_name: item.patient_name,
        uhid: item.uhid,
        bed_no: item.bed_no,
        bp: item.bp,
        pulse: item.pulse,
        temp: item.temp,
        spo2: item.spo2,
      });

      item.status = 'synced';
      delete item.error;
      syncedCount++;
    } catch (err: any) {
      console.warn(`[offlineSyncService] Failed to sync vital ${item.id}:`, err.message);
      item.status = 'failed';
      item.error = err.message || 'Sync failed';
      failedCount++;
    }
  }

  // Filter out successfully synced items to keep local storage clean
  const remaining = queue.filter(item => item.status !== 'synced');
  writeQueue(remaining);

  if (syncedCount > 0) {
    window.dispatchEvent(new CustomEvent('offline-vitals-synced', {
      detail: { count: syncedCount }
    }));
  }

  console.log(`[offlineSyncService] Sync complete: ${syncedCount} synced, ${failedCount} remaining.`);
  return { synced: syncedCount, failed: failedCount };
}

// ── Background Auto-Sync Event Listeners ───────────────────────
if (typeof window !== 'undefined') {
  // 1. Auto-sync whenever browser transitions from offline to online
  window.addEventListener('online', () => {
    console.log('[offlineSyncService] 🌐 Device back ONLINE. Auto-triggering sync...');
    syncPendingVitals().catch(err => {
      console.error('[offlineSyncService] Error during auto-sync on reconnect:', err);
    });
  });

  // 2. Periodic background check every 45s if there are pending items
  setInterval(() => {
    if (navigator.onLine && getPendingVitalsCount() > 0) {
      syncPendingVitals().catch(() => {});
    }
  }, 45000);
}
