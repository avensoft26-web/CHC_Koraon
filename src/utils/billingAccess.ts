import { useState, useEffect } from 'react';
import { getStoredAuthUser } from '../hooks/useAuthUser';
import { AuthUser } from '../features/auth/LoginPage';
import { subscribeToHmsEvent } from '../services/realtime';

const STORAGE_KEY = 'chaudhary_billing_access_map';

// Per-user overrides set from the Admin Users screen in this browser.
// Keyed by the real user id — there are no built-in entries, because a
// permission must never be assumed from a hard-coded identifier.
const defaultBillingMap: Record<string, boolean> = {};

function getStoredMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultBillingMap };
    return { ...defaultBillingMap, ...JSON.parse(raw) };
  } catch {
    return { ...defaultBillingMap };
  }
}

function saveStoredMap(map: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save billing access map', e);
  }
}

/**
 * Billing visibility for the signed-in user.
 *
 * Driven by the real session: admin and developer always have access, every
 * other role needs the backend-granted `billingAccess` flag, and an explicit
 * override recorded from the Admin Users screen wins last.
 */
export function checkBillingAccess(user?: AuthUser | null): boolean {
  const active = user ?? getStoredAuthUser();
  if (!active) return false;

  const role = (active.role || '').toUpperCase();
  if (role === 'ADMIN' || role === 'DEVELOPER') return true;
  if (active.billingAccess) return true;

  const map = getStoredMap();
  if (active.id && active.id in map) return Boolean(map[active.id]);
  if (role && role in map) return Boolean(map[role]);

  return false;
}

/**
 * Record an explicit billing-access override for a user or role
 */
export function setBillingAccess(identifier: string, isAllowed: boolean): void {
  const map = getStoredMap();
  map[identifier] = isAllowed;
  saveStoredMap(map);

  // Dispatch custom event to notify all components/tabs
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('chaudhary:billing-access-changed', {
        detail: { identifier, isAllowed },
      })
    );
  }
}

/**
 * React hook: live billing access for the signed-in user. Re-evaluates when
 * the signed-in user changes or an override is recorded, including cross-session
 * updates via Socket.IO.
 */
export function useBillingAccess(): boolean {
  const [hasAccess, setHasAccess] = useState<boolean>(() => checkBillingAccess());

  useEffect(() => {
    const recompute = () => setHasAccess(checkBillingAccess());

    recompute();

    window.addEventListener('chaudhary:billing-access-changed', recompute);
    window.addEventListener('chaudhary_auth_updated', recompute);
    window.addEventListener('storage', recompute);

    // Socket.IO real-time synchronization when admin toggles access
    const unsubscribeSocket = subscribeToHmsEvent('user:billing-access-changed', (data: any) => {
      const active = getStoredAuthUser();
      if (active?.id && String(active.id) === String(data?.userId)) {
        // Update cached session user
        const updatedUser = { ...active, billingAccess: Boolean(data.billingAccess) };
        try {
          localStorage.setItem('chaudhary_auth_user', JSON.stringify(updatedUser));
        } catch {
          // ignore
        }
        setBillingAccess(String(active.id), Boolean(data.billingAccess));
        recompute();
      }
    });

    return () => {
      window.removeEventListener('chaudhary:billing-access-changed', recompute);
      window.removeEventListener('chaudhary_auth_updated', recompute);
      window.removeEventListener('storage', handleRecomputeCleanup);
      if (unsubscribeSocket) unsubscribeSocket();
    };
  }, []);

  return hasAccess;
}

function handleRecomputeCleanup() {}
