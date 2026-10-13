import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { subscribeToHmsEvent } from '../services/realtime';

export interface DoctorOverride {
  status?: 'Active' | 'On Leave';
  availableTime?: string;
  roomNo?: string;
  opdFee?: number;
  phone?: string;
  avatarUrl?: string;
  leaveUntil?: string;
  updatedBy?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'chaudhary_doctor_availability_map_v1';

export function getDoctorOverrides(): Record<string, DoctorOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveDoctorOverrides(map: Record<string, DoctorOverride>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save doctor availability overrides', e);
  }
}

export function getDoctorOverride(identifier: string): DoctorOverride | undefined {
  const map = getDoctorOverrides();
  if (map[identifier]) return map[identifier];

  // Cross-match 'usr-doc-1' with 'doc-1'
  if (identifier.startsWith('usr-doc-')) {
    const shortId = identifier.replace('usr-', '');
    if (map[shortId]) return map[shortId];
  } else if (identifier.startsWith('doc-')) {
    const longId = 'usr-' + identifier;
    if (map[longId]) return map[longId];
  }

  // Cross-match by clean doctor name
  const cleanId = identifier.toLowerCase().trim();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase().trim() === cleanId) return val;
  }

  return undefined;
}

export function updateDoctorOverride(
  identifier: string, 
  updates: Partial<DoctorOverride>,
  updatedBy: string = 'User'
): void {
  const map = getDoctorOverrides();
  const existing = getDoctorOverride(identifier) || {};

  const merged: DoctorOverride = {
    ...existing,
    ...updates,
    updatedBy,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  map[identifier] = merged;

  // Also duplicate to alias key if applicable
  if (identifier.startsWith('usr-doc-')) {
    map[identifier.replace('usr-', '')] = merged;
  } else if (identifier.startsWith('doc-')) {
    map['usr-' + identifier] = merged;
  }

  saveDoctorOverrides(map);

  // Database persistence: if identifier is a MongoDB ID or has matched doctor, persist to backend
  const isMongoId = /^[a-f\d]{24}$/i.test(identifier);
  if (isMongoId) {
    const payload: Record<string, any> = {};
    if (updates.status !== undefined) payload.available = updates.status === 'Active';
    if (updates.availableTime !== undefined) payload.opdTiming = updates.availableTime;
    if (updates.roomNo !== undefined) payload.roomNo = updates.roomNo;
    if (updates.opdFee !== undefined) payload.fee = updates.opdFee;
    if (updates.phone !== undefined) payload.mobile = updates.phone;
    if (updates.avatarUrl !== undefined) payload.avatar = updates.avatarUrl;

    if (Object.keys(payload).length > 0) {
      api.doctors.update(identifier, payload).catch((err: any) => {
        console.warn('[doctorAvailability] Background DB persist failed:', err.message);
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('chaudhary:doctor-availability-changed', {
        detail: { identifier, updates: merged },
      })
    );
  }
}

export function toggleDoctorStatus(
  identifier: string, 
  currentStatus: 'Active' | 'On Leave',
  updatedBy: string = 'User'
): 'Active' | 'On Leave' {
  const newStatus: 'Active' | 'On Leave' = currentStatus === 'Active' ? 'On Leave' : 'Active';
  updateDoctorOverride(identifier, { status: newStatus }, updatedBy);
  return newStatus;
}

export function useDoctorAvailabilityMap(): Record<string, DoctorOverride> {
  const [map, setMap] = useState<Record<string, DoctorOverride>>(() => getDoctorOverrides());

  useEffect(() => {
    // 1. Initial Authoritative Fetch from MongoDB
    api.doctors.getAll().then((res) => {
      if (res?.success && Array.isArray(res.doctors)) {
        const nextMap = { ...getDoctorOverrides() };
        res.doctors.forEach((d: any) => {
          const docId = String(d._id || d.id);
          const override: DoctorOverride = {
            status: d.available !== false ? 'Active' : 'On Leave',
            availableTime: d.opdTiming || '10:00 AM - 04:00 PM',
            roomNo: d.roomNo || 'OPD Room 1',
            opdFee: d.fee || 500,
            phone: d.mobile || '',
            updatedAt: 'Server DB'
          };
          nextMap[docId] = override;
          if (d.name) nextMap[d.name] = override;
        });
        saveDoctorOverrides(nextMap);
        setMap(nextMap);
      }
    }).catch(() => {});

    // 2. Real-time in-app and cross-tab listener
    const handleChange = () => {
      setMap(getDoctorOverrides());
    };

    window.addEventListener('chaudhary:doctor-availability-changed', handleChange);
    window.addEventListener('storage', handleChange);

    // 3. Socket.IO Real-Time Listener across all devices & sessions
    const unsubscribeSocket = subscribeToHmsEvent('doctor:updated', (data: any) => {
      if (data?.doctor) {
        const d = data.doctor;
        const docId = String(d._id || d.id || data.doctorId);
        const override: DoctorOverride = {
          status: (data.available !== false && d.available !== false) ? 'Active' : 'On Leave',
          availableTime: d.opdTiming || '10:00 AM - 04:00 PM',
          roomNo: d.roomNo || 'OPD Room 1',
          opdFee: d.fee || 500,
          phone: d.mobile || '',
          updatedAt: 'Real-time'
        };

        const currentMap = getDoctorOverrides();
        currentMap[docId] = override;
        if (d.name) currentMap[d.name] = override;
        saveDoctorOverrides(currentMap);
        setMap({ ...currentMap });
      }
    });

    return () => {
      window.removeEventListener('chaudhary:doctor-availability-changed', handleChange);
      window.removeEventListener('storage', handleChange);
      if (unsubscribeSocket) unsubscribeSocket();
    };
  }, []);

  return map;
}
