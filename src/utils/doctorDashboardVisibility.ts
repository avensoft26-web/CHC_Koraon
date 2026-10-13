import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getStoredAuthUser } from '../hooks/useAuthUser';
import { subscribeToHmsEvent } from '../services/realtime';

export interface DoctorDashboardToggles {
  showAdmitted: boolean;
  showDischarged: boolean;
}

const STORAGE_KEY = 'chaudhary_doctor_dashboard_visibility';
const EVENT_NAME = 'chaudhary:doctor-visibility-changed';

const DEFAULT_TOGGLES: DoctorDashboardToggles = {
  showAdmitted: true,
  showDischarged: true,
};

/**
 * Read current Doctor Dashboard visibility toggles from localStorage/cache
 */
export function getDoctorDashboardToggles(): DoctorDashboardToggles {
  if (typeof window === 'undefined') return DEFAULT_TOGGLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TOGGLES;
    const parsed = JSON.parse(raw);
    return {
      showAdmitted: typeof parsed.showAdmitted === 'boolean' ? parsed.showAdmitted : true,
      showDischarged: typeof parsed.showDischarged === 'boolean' ? parsed.showDischarged : true,
    };
  } catch {
    return DEFAULT_TOGGLES;
  }
}

/**
 * Persist Doctor Dashboard visibility toggles to MongoDB and local cache,
 * notifying all active views in real-time.
 */
export function setDoctorDashboardToggles(updates: Partial<DoctorDashboardToggles>): DoctorDashboardToggles {
  const current = getDoctorDashboardToggles();
  const next: DoctorDashboardToggles = {
    ...current,
    ...updates,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }

    // Persist to MongoDB backend under user preferences
    const activeUser = getStoredAuthUser();
    if (activeUser?.id) {
      api.auth.updateUser(activeUser.id, {
        preferences: { doctorDashboardVisibility: next }
      }).catch((err: any) => {
        console.warn('[doctorDashboardVisibility] Backend preferences sync failed:', err.message);
      });
    }

    // Dispatch custom event for real-time in-app updates
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: next,
      })
    );

    // Also dispatch storage event for cross-tab synchronization
    window.dispatchEvent(new Event('storage'));
  }

  return next;
}

/**
 * React hook to listen to Doctor Dashboard visibility toggles in real-time,
 * grounded in MongoDB user preferences.
 */
export function useDoctorDashboardVisibility(): DoctorDashboardToggles & {
  setToggles: (updates: Partial<DoctorDashboardToggles>) => void;
} {
  const [toggles, setTogglesState] = useState<DoctorDashboardToggles>(getDoctorDashboardToggles);

  useEffect(() => {
    // 1. Initial fetch from MongoDB User profile
    const activeUser = getStoredAuthUser();
    if (activeUser?.id) {
      api.auth.getProfile().then((res: any) => {
        if (res?.success && res.user?.preferences?.doctorDashboardVisibility) {
          const remoteToggles = res.user.preferences.doctorDashboardVisibility;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteToggles));
          setTogglesState(remoteToggles);
        }
      }).catch(() => {});
    }

    // 2. In-app and cross-tab listener
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<DoctorDashboardToggles>;
      if (customEvent.detail) {
        setTogglesState(customEvent.detail);
      } else {
        setTogglesState(getDoctorDashboardToggles());
      }
    };

    const handleStorageEvent = () => {
      setTogglesState(getDoctorDashboardToggles());
    };

    window.addEventListener(EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    // 3. Real-time socket sync
    const unsubscribeSocket = subscribeToHmsEvent('user:updated', (data: any) => {
      if (data?.user?.id === activeUser?.id && data.user?.preferences?.doctorDashboardVisibility) {
        const next = data.user.preferences.doctorDashboardVisibility;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setTogglesState(next);
      }
    });

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      if (unsubscribeSocket) unsubscribeSocket();
    };
  }, []);

  const updateToggles = (updates: Partial<DoctorDashboardToggles>) => {
    const next = setDoctorDashboardToggles(updates);
    setTogglesState(next);
  };

  return {
    ...toggles,
    setToggles: updateToggles,
  };
}
