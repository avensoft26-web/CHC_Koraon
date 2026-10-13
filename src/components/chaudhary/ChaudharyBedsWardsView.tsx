import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeToHmsEvent } from '../../services/realtime';
import {
  Building2,
  Users,
  CheckCircle2,
  Activity,
  X,
  HeartPulse,
  LogOut,
  RefreshCw,
  ChevronDown,
  Building,
  ShieldCheck,
  Zap,
  Bed,
  Plus,
  Stethoscope,
  Clock,
  UserPlus,
  Sparkles
} from 'lucide-react';

export type BedTypeTab =
  | 'General Ward'
  | 'Private Rooms'
  | 'ICU & Critical'
  | 'Semi-Private'
  | 'Isolation Ward'
  | 'Emergency & Trauma';

export type FloorOption = 'All Floors' | 'Ground Floor' | 'First Floor' | 'Second Floor' | 'Third Floor' | 'ICU Block';

export interface PlanBed {
  id: string;
  code: string;
  status: 'Available' | 'Occupied' | 'Sanitizing' | 'Reserved';
  bedType: string;
  dailyRate: number;
  patient?: {
    name: string;
    uhid: string;
    age: number;
    gender: 'M' | 'F';
    doctor: string;
    diagnosis: string;
    admittedAt: string;
    phone?: string;
    vitals?: { bp: string; spo2: string; pulse: string; temp: string };
  };
}

export interface PlanZone {
  id: string;
  title: string;
  category: BedTypeTab;
  floorLabel: FloorOption;
  bedCountLabel: string;
  spec: string;
  genderBadge?: string;
  beds: PlanBed[];
}

// Exact 3D Isometric Hospital Bed / Stretcher Illustration matching user's reference
const MedicalHospitalBedIcon: React.FC<{
  status: 'Available' | 'Occupied' | 'Sanitizing' | 'Reserved';
  className?: string;
}> = ({ status, className = 'w-14 h-12' }) => {
  const isOcc = status === 'Occupied';
  const isClean = status === 'Sanitizing';

  // Mattress colors (Adaptive or Classic Medical Blue like user reference)
  const topColor = isOcc ? '#F43F5E' : isClean ? '#F59E0B' : '#0070F3';
  const sideColor = isOcc ? '#BE123C' : isClean ? '#D97706' : '#0051B3';
  const dividerColor = isOcc ? '#9F1239' : isClean ? '#B45309' : '#003B82';
  const lightBevel = isOcc ? '#FDA4AF' : isClean ? '#FCD34D' : '#38BDF8';

  return (
    <svg viewBox="0 0 120 105" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="bed-shadow" x="0" y="70" width="120" height="35" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>

      {/* Ground Soft Shadows */}
      <ellipse cx="23" cy="85" rx="7" ry="3.5" fill="#94A3B8" fillOpacity="0.3" />
      <ellipse cx="56" cy="98" rx="8" ry="4" fill="#94A3B8" fillOpacity="0.3" />
      <ellipse cx="78" cy="62" rx="7" ry="3.5" fill="#94A3B8" fillOpacity="0.3" />
      <ellipse cx="108" cy="72" rx="8" ry="4" fill="#94A3B8" fillOpacity="0.3" />

      {/* Back Wheels & Legs */}
      <path d="M78 40v20" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      <path d="M78 40v20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M74 58l8-2v6l-8 2z" fill="#94A3B8" />
      <circle cx="78" cy="62" r="6" fill="#334155" />
      <circle cx="78" cy="62" r="3" fill="#94A3B8" />
      <circle cx="78" cy="62" r="1.5" fill="#475569" />

      <path d="M107 48v22" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      <path d="M107 48v22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M103 68l8-2v6l-8 2z" fill="#94A3B8" />
      <circle cx="107" cy="72" r="7" fill="#334155" />
      <circle cx="107" cy="72" r="3.5" fill="#94A3B8" />
      <circle cx="107" cy="72" r="1.5" fill="#475569" />

      {/* Crossbars Under Carriage */}
      <path d="M22 68l56-28M56 82l51-24" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 68l34 14M78 40l29 12" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

      {/* Headboard */}
      <path
        d="M72 17 Q72 10 78 8 L104 22 Q110 25 110 32 L110 46 L72 30 Z"
        fill="#E2E8F0"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <path d="M104 22 L110 25 L110 46 L104 43 Z" fill="#CBD5E1" />
      <path
        d="M78 18 Q77 15 80 14 L98 23 Q100 24 99 27 L81 19 Z"
        fill="#FFFFFF"
        stroke="#94A3B8"
        strokeWidth="1"
      />

      {/* Guard Rail */}
      <path
        d="M58 24 Q68 18 78 23 L96 32 Q100 34 96 38"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M70 20v14M85 27v13" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />

      {/* Base Frame */}
      <polygon points="12,50 82,14 112,30 42,66" fill="#CBD5E1" />
      <polygon points="12,50 42,66 42,71 12,55" fill="#94A3B8" />
      <polygon points="42,66 112,30 112,35 42,71" fill="#64748B" />

      {/* 3-Segment Mattress */}
      <polygon points="16,48 40,36 50,41 26,53" fill={topColor} />
      <polygon points="26,53 50,41 50,47 26,59" fill={sideColor} />
      <polygon points="16,48 26,53 26,59 16,54" fill={lightBevel} />

      <polygon points="41,35.5 65,23.5 75,28.5 51,40.5" fill={topColor} />
      <polygon points="51,40.5 75,28.5 75,34.5 51,46.5" fill={sideColor} />
      <line x1="40" y1="36" x2="50" y2="41" stroke={dividerColor} strokeWidth="1.5" />

      <polygon points="66,23 90,11 100,16 76,28" fill={topColor} />
      <polygon points="76,28 100,16 100,22 76,34" fill={sideColor} />
      <line x1="65" y1="23.5" x2="75" y2="28.5" stroke={dividerColor} strokeWidth="1.5" />

      <line x1="16" y1="48" x2="90" y2="11" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4" />

      {/* Footboard */}
      <path
        d="M6 38 Q6 32 12 30 L40 44 Q46 47 46 54 L46 66 L6 50 Z"
        fill="#E2E8F0"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <path d="M40 44 L46 47 L46 66 L40 63 Z" fill="#CBD5E1" />
      <path
        d="M12 40 Q11 37 14 36 L34 46 Q36 47 35 50 L15 41 Z"
        fill="#FFFFFF"
        stroke="#94A3B8"
        strokeWidth="1"
      />

      {/* Near Guard Rail */}
      <path
        d="M24 38 Q36 29 48 35 L76 49 Q82 52 78 57"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M24 38 Q36 29 48 35 L76 49 Q82 52 78 57"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M38 32v18M56 41v18M72 49v16" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 32v18M56 41v18M72 49v16" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

      {/* Front Wheels & Legs */}
      <path d="M22 55v15" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M22 55v15" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 68l10-2v7l-10 2z" fill="#94A3B8" />
      <circle cx="22" cy="74" r="7.5" fill="#334155" />
      <circle cx="22" cy="74" r="3.8" fill="#CBD5E1" />
      <circle cx="22" cy="74" r="1.8" fill="#1E293B" />

      <path d="M56 68v16" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <path d="M56 68v16" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 82l12-3v8l-12 3z" fill="#94A3B8" />
      <circle cx="56" cy="88" r="8.5" fill="#1E293B" />
      <circle cx="56" cy="88" r="4.2" fill="#E2E8F0" />
      <circle cx="56" cy="88" r="2" fill="#0F172A" />

      {/* Patient Indicator for Occupied / Sparkle for Cleaning */}
      {isOcc && (
        <g transform="translate(68, 12)">
          <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
          <circle cx="0" cy="-1" r="1.8" fill="#F43F5E" />
          <path d="M-2.5 3 C-2.5 1.5 2.5 1.5 2.5 3" stroke="#F43F5E" strokeWidth="1.2" />
        </g>
      )}

      {isClean && (
        <g transform="translate(68, 14)">
          <circle cx="0" cy="0" r="4.5" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.2" />
          <path d="M0 -3v6M-3 0h6" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

interface WardTabConfig {
  id: BedTypeTab;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

const WARD_TABS: WardTabConfig[] = [
  {
    id: 'General Ward',
    label: 'General Ward',
    subLabel: 'Male & Female',
    icon: <Users className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'Private Rooms',
    label: 'Private Rooms',
    subLabel: 'Deluxe & VIP',
    icon: <Building2 className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'ICU & Critical',
    label: 'ICU & Critical',
    subLabel: 'ICU & CCU Units',
    icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
  },
  {
    id: 'Semi-Private',
    label: 'Semi-Private',
    subLabel: 'Twin Sharing',
    icon: <Users className="w-4 h-4 text-cyan-600" />,
  },
  {
    id: 'Isolation Ward',
    label: 'Isolation Ward',
    subLabel: 'Negative Press.',
    icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
  },
  {
    id: 'Emergency & Trauma',
    label: 'Emergency',
    subLabel: 'Trauma & Triage',
    icon: <Zap className="w-4 h-4 text-amber-600" />,
  },
];

// Legacy localStorage cache key. Old builds stored fabricated bed/patient data here,
// so the stale cache is dropped once and beds are always read live from MongoDB.
const STORAGE_KEY = 'chaudhary_wards_beds_data';
try {
  localStorage.removeItem(STORAGE_KEY);
} catch {
  // storage unavailable
}

export interface HospitalBedsSummary {
  totalBeds: number;
  occupiedBeds: number;
  sanitizingBeds: number;
  availableBeds: number;
  occupancyPct: number;
  wardsBreakdown: {
    name: string;
    total: number;
    occupied: number;
    available: number;
    sanitizing: number;
    pct: number;
    dotColor: string;
    barColor: string;
  }[];
}

export const emptyHospitalBedsSummary: HospitalBedsSummary = {
  totalBeds: 0,
  occupiedBeds: 0,
  sanitizingBeds: 0,
  availableBeds: 0,
  occupancyPct: 0,
  wardsBreakdown: [],
};

// Ward grouping rules. "female" is tested before "male" because it contains it.
const WARD_GROUPS: {
  name: string;
  dotColor: string;
  barColor: string;
  test: (wardName: string) => boolean;
}[] = [
  { name: 'General Female', dotColor: 'bg-emerald-500', barColor: 'bg-emerald-500', test: (w) => w.includes('female') },
  { name: 'General Male', dotColor: 'bg-amber-500', barColor: 'bg-amber-500', test: (w) => w.includes('male') },
  { name: 'ICU Critical', dotColor: 'bg-blue-600', barColor: 'bg-blue-600', test: (w) => w.includes('icu') },
  { name: 'Private Deluxe', dotColor: 'bg-purple-600', barColor: 'bg-purple-600', test: (w) => w.includes('private') || w.includes('pvt') },
  { name: 'Emergency Triage', dotColor: 'bg-rose-500', barColor: 'bg-rose-500', test: (w) => w.includes('emergency') || w.includes('triage') },
];

/** Build the dashboard bed summary from the live `/api/beds` response. */
export const bedsSummaryFromApiBeds = (apiBeds: any[]): HospitalBedsSummary => {
  const beds = Array.isArray(apiBeds) ? apiBeds : [];

  const buckets = WARD_GROUPS.map((g) => ({ ...g, total: 0, occupied: 0, available: 0, sanitizing: 0 }));
  const other = {
    name: 'Other Wards',
    dotColor: 'bg-slate-400',
    barColor: 'bg-slate-400',
    total: 0,
    occupied: 0,
    available: 0,
    sanitizing: 0,
  };

  let totalBeds = 0;
  let occupiedBeds = 0;
  let sanitizingBeds = 0;
  let availableBeds = 0;

  beds.forEach((bed) => {
    totalBeds++;
    const isOccupied = bed?.status === 'Occupied';
    const isSanitizing = bed?.status === 'Sanitizing';
    if (isOccupied) occupiedBeds++;
    else if (isSanitizing) sanitizingBeds++;
    else availableBeds++;

    const wardName = String(bed?.ward || '').toLowerCase();
    const bucket = buckets.find((g) => g.test(wardName)) || other;
    bucket.total++;
    if (isOccupied) bucket.occupied++;
    else if (isSanitizing) bucket.sanitizing++;
    else bucket.available++;
  });

  const toStat = (g: { name: string; total: number; occupied: number; available: number; sanitizing: number; dotColor: string; barColor: string }) => ({
    name: g.name,
    total: g.total,
    occupied: g.occupied,
    available: g.available,
    sanitizing: g.sanitizing,
    pct: g.total > 0 ? Math.round((g.occupied / g.total) * 100) : 0,
    dotColor: g.dotColor,
    barColor: g.barColor,
  });

  return {
    totalBeds,
    occupiedBeds,
    sanitizingBeds,
    availableBeds,
    occupancyPct: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    wardsBreakdown: [...buckets.map(toStat), ...(other.total > 0 ? [toStat(other)] : [])],
  };
};

/** Fetch the bed summary straight from MongoDB via the backend. */
export const fetchHospitalBedsSummary = async (): Promise<HospitalBedsSummary> => {
  const res = await api.beds.getAll();
  if (!res?.success) {
    throw new Error('Unable to load bed availability');
  }
  return bedsSummaryFromApiBeds(res.beds);
};

// Module-level cache for instant Bed & Wards tab switching
let cachedWardsMemory: PlanZone[] = [];

export const ChaudharyBedsWardsView: React.FC<{ onAdmitPatient?: (bedCode: string) => void }> = ({ onAdmitPatient }) => {
  const [wardsList, setWardsList] = useState<PlanZone[]>(() => cachedWardsMemory);
  const [isLoadingBeds, setIsLoadingBeds] = useState(() => cachedWardsMemory.length === 0);
  const [bedsError, setBedsError] = useState<string | null>(null);
  const [activeBedType, setActiveBedType] = useState<BedTypeTab>('General Ward');
  const [selectedFloor, setSelectedFloor] = useState<FloorOption>('All Floors');
  const [viewDensity, setViewDensity] = useState<'visual' | 'matrix'>('visual');
  const [selectedBedModal, setSelectedBedModal] = useState<{ bed: PlanBed; zone: PlanZone } | null>(null);
  const [hoveredBed, setHoveredBed] = useState<{ bed: PlanBed; zone: PlanZone; rect: DOMRect } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wardsList.length > 0) {
      cachedWardsMemory = wardsList;
    }
  }, [wardsList]);

  // Load the live bed plan from MongoDB, enriched with each patient's real
  // contact number and their most recently recorded vitals.
  useEffect(() => {
    let isMounted = true;

    const zoneConfig = [
      { id: 'zone-gw-male', title: 'General Male Ward', category: 'General Ward' as const, floorLabel: 'Ground Floor' as const, spec: 'Standard Fowler • Adjustable Backrest', genderBadge: 'Male', wardIncludes: 'Male General', bedType: 'Standard Fowler', defaultRate: 500 },
      { id: 'zone-gw-female', title: 'General Female Ward', category: 'General Ward' as const, floorLabel: 'First Floor' as const, spec: 'Standard Fowler • Female Recovery', genderBadge: 'Female', wardIncludes: 'Female General', bedType: 'Standard Fowler', defaultRate: 500 },
      { id: 'zone-icu', title: 'Intensive Care Unit (ICU)', category: 'ICU & Critical' as const, floorLabel: 'Third Floor' as const, spec: 'Multi-Para Monitor • Invasive Ventilator', genderBadge: undefined, wardIncludes: 'ICU', bedType: 'Critical Care ICU', defaultRate: 2500 },
      { id: 'zone-et', title: 'Emergency Triage & Trauma', category: 'Emergency & Trauma' as const, floorLabel: 'Ground Floor' as const, spec: 'Resuscitation Stretcher • Crash Cart Ready', genderBadge: undefined, wardIncludes: 'Emergency', bedType: 'Resuscitation Stretcher', defaultRate: 1000 },
      { id: 'zone-private-cubicles', title: 'Private Cabin Ward', category: 'Private Rooms' as const, floorLabel: 'Second Floor' as const, spec: 'Motorized Deluxe Bed • Attached Restroom', genderBadge: undefined, wardIncludes: 'Private', bedType: 'Motorized Deluxe', defaultRate: 1800 },
    ];

    const loadBeds = async () => {
      try {
        if (cachedWardsMemory.length === 0) {
          setIsLoadingBeds(true);
        }
        const [bedsRes, patientsRes, vitalsRes] = await Promise.all([
          api.beds.getAll(),
          api.patients.getAll().catch(() => null),
          api.vitals.getAll().catch(() => null),
        ]);

        if (!bedsRes?.success || !Array.isArray(bedsRes.beds)) {
          throw new Error('Bed data unavailable');
        }

        // Track discharged patients to ensure they never appear occupying a bed
        const dischargedPatientIds = new Set<string>();
        const phoneByPatient = new Map<string, string>();
        (patientsRes?.patients || []).forEach((p: any) => {
          const key = String(p.patient_id || p._id || '');
          if (key && String(p.status || '').toLowerCase().trim() === 'discharged') {
            dischargedPatientIds.add(key);
          }
          if (key && p.mobile) phoneByPatient.set(key, String(p.mobile));
        });

        // Most recently recorded vitals per patient (API returns newest first)
        const vitalsByPatient = new Map<string, any>();
        (vitalsRes?.vitals || []).forEach((v: any) => {
          const key = v.patient_id;
          if (key && !vitalsByPatient.has(String(key))) vitalsByPatient.set(String(key), v);
        });

        const liveBeds = bedsRes.beds;

        const mappedZones: PlanZone[] = zoneConfig.map((zone) => {
          const zoneBeds = liveBeds.filter((b: any) => String(b.ward || '').includes(zone.wardIncludes));
          const beds: PlanBed[] = zoneBeds.map((b: any) => {
            const patientId = b.patient ? String(b.patient.id || b.patient.patient_id || '') : '';
            const isDischarged = patientId ? dischargedPatientIds.has(patientId) : false;
            const raw = isDischarged ? null : b.patient;
            const phone = patientId ? phoneByPatient.get(patientId) : undefined;
            const vital = patientId ? vitalsByPatient.get(patientId) : undefined;
            return {
              id: b.bedNo,
              code: b.bedNo,
              status: (raw ? (b.status || 'Occupied') : 'Available') as PlanBed['status'],
              bedType: zone.bedType,
              dailyRate: b.charge || zone.defaultRate,
              patient: raw
                ? {
                    name: raw.name || 'Patient',
                    uhid: patientId,
                    age: raw.age || 0,
                    gender: raw.gender === 'Female' || raw.gender === 'F' ? 'F' : 'M',
                    doctor: raw.doctor || '—',
                    diagnosis: raw.diagnosis || '—',
                    admittedAt: raw.admissionDate ? new Date(raw.admissionDate).toLocaleDateString() : '—',
                    phone: phone || undefined,
                    vitals: vital
                      ? {
                          bp: vital.bp || '—',
                          spo2: vital.spo2 !== undefined && vital.spo2 !== null ? `${vital.spo2}%` : '—',
                          pulse: vital.pulse !== undefined && vital.pulse !== null ? `${vital.pulse} bpm` : '—',
                          temp: vital.temp !== undefined && vital.temp !== null ? `${vital.temp}°F` : '—',
                        }
                      : undefined,
                  }
                : undefined,
            };
          });

          return {
            id: zone.id,
            title: zone.title,
            category: zone.category,
            floorLabel: zone.floorLabel,
            bedCountLabel: `${beds.length} Beds`,
            spec: zone.spec,
            genderBadge: zone.genderBadge,
            beds,
          };
        });

        if (isMounted) {
          setWardsList(mappedZones);
          setBedsError(null);
        }
      } catch (err: any) {
        if (isMounted) setBedsError(err?.message || 'Unable to load beds');
      } finally {
        if (isMounted) setIsLoadingBeds(false);
      }
    };

    loadBeds();

    // Re-fetch instantly on any socket or local change
    const unsubBeds = subscribeToHmsEvent('bed:updated', () => loadBeds());
    const unsubSettings = subscribeToHmsEvent('settings:updated', () => loadBeds());
    const unsubAdmit = subscribeToHmsEvent('patient:admitted', () => loadBeds());
    const unsubDischarge = subscribeToHmsEvent('patient:discharged', () => loadBeds());

    const handleLocalUpdate = () => loadBeds();
    window.addEventListener('chaudhary_beds_updated', handleLocalUpdate);

    return () => {
      isMounted = false;
      unsubBeds();
      unsubSettings();
      unsubAdmit();
      unsubDischarge();
      window.removeEventListener('chaudhary_beds_updated', handleLocalUpdate);
    };
  }, []);

  const updateBedStatus = (bedId: string, nextStatus: PlanBed['status'], patient?: PlanBed['patient']) => {
    setWardsList(prev => {
      const updated = prev.map(zone => ({
        ...zone,
        beds: zone.beds.map(b => {
          if (b.id === bedId) {
            return {
              ...b,
              status: nextStatus,
              patient: nextStatus === 'Occupied' ? (patient || b.patient) : undefined,
            };
          }
          return b;
        })
      }));
      // Local, session-only visual state (e.g. "Sanitizing") — never persisted,
      // so a reload always re-reads the true bed state from MongoDB.
      window.dispatchEvent(new Event('chaudhary_beds_updated'));
      return updated;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const floorOptions: FloorOption[] = ['All Floors', 'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'ICU Block'];

  const displayedZones = useMemo(() => {
    return wardsList.filter(zone => {
      const matchType = zone.category === activeBedType;
      const matchFloor = selectedFloor === 'All Floors' || zone.floorLabel === selectedFloor;
      return matchType && matchFloor;
    });
  }, [wardsList, activeBedType, selectedFloor]);

  const tabStats = useMemo(() => {
    let total = 0;
    let available = 0;
    let occupied = 0;
    let sanitizing = 0;

    displayedZones.forEach(z => {
      z.beds.forEach(b => {
        total++;
        if (b.status === 'Available') available++;
        if (b.status === 'Occupied') occupied++;
        if (b.status === 'Sanitizing') sanitizing++;
      });
    });

    return { total, available, occupied, sanitizing };
  }, [displayedZones]);

  return (
    <div className="w-full space-y-3.5 font-sans select-none pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 bg-slate-900 text-white font-medium text-xs rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER & CONTROLS ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Ward &amp; Bed Allocation</span>
            </h2>
            
            {/* Live summary pills for active ward */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {tabStats.available} Available
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {tabStats.occupied} Occupied
              </span>
              {tabStats.sanitizing > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {tabStats.sanitizing} Cleaning
                </span>
              )}
            </div>
          </div>

          {/* Controls: Density Toggle + Floor Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewDensity('visual')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewDensity === 'visual' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bed Cards
              </button>
              <button
                type="button"
                onClick={() => setViewDensity('matrix')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewDensity === 'matrix' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compact Table
              </button>
            </div>

            {/* Floor Selector Dropdown */}
            <div className="relative shrink-0">
              <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedFloor}
                onChange={e => setSelectedFloor(e.target.value as FloorOption)}
                className="pl-8 pr-8 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none transition-colors shadow-xs"
              >
                {floorOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 6 Clean Department Option Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {WARD_TABS.map(tab => {
            const isActive = activeBedType === tab.id;
            const count = wardsList
              .filter(z => z.category === tab.id)
              .reduce((a, z) => a + z.beds.length, 0);

            const freeCount = wardsList
              .filter(z => z.category === tab.id)
              .reduce((a, z) => a + z.beds.filter(b => b.status === 'Available').length, 0);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveBedType(tab.id);
                  setHoveredBed(null);
                }}
                className={`p-2.5 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between border ${
                  isActive
                    ? 'bg-blue-50/60 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600/20'
                    : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {/* Top Row: Icon + Count */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-white border-blue-200' : 'bg-white border-slate-200'
                  }`}>
                    {tab.icon}
                  </div>
                  
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    {count} Beds
                  </span>
                </div>

                {/* Ward Name & SubLabel */}
                <div>
                  <h4 className="text-xs font-bold leading-tight truncate">
                    {tab.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {tab.subLabel}
                  </p>
                </div>

                {/* Bottom Status Quick Tag */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-700 font-semibold">{freeCount} Free</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. WARD CARDS WITH PROFESSIONAL CLINICAL TILES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
        {displayedZones.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            {isLoadingBeds ? (
              <p className="text-xs font-semibold text-slate-500">Loading live bed data from database...</p>
            ) : bedsError ? (
              <p className="text-xs font-semibold text-rose-500">{bedsError}</p>
            ) : (
              <p className="text-xs font-semibold text-slate-500">
                {wardsList.length === 0 ? 'No beds configured yet' : 'No rooms found on this floor'}
              </p>
            )}
          </div>
        ) : (
          displayedZones.map(zone => {
            const occupied = zone.beds.filter(b => b.status === 'Occupied').length;
            const available = zone.beds.filter(b => b.status === 'Available').length;
            const cleaning = zone.beds.filter(b => b.status === 'Sanitizing').length;
            const occPercent = Math.round((occupied / zone.beds.length) * 100);

            return (
              <div 
                key={zone.id} 
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
              >
                {/* Ward Card Top Header */}
                <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      {zone.category === 'ICU & Critical' ? <HeartPulse className="w-4 h-4 text-rose-600" /> :
                       zone.category === 'Private Rooms' ? <Building2 className="w-4 h-4 text-blue-600" /> :
                       zone.category === 'Isolation Ward' ? <ShieldCheck className="w-4 h-4 text-purple-600" /> :
                       zone.category === 'Emergency & Trauma' ? <Zap className="w-4 h-4 text-amber-600" /> :
                       <Users className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">{zone.title}</h3>
                        {zone.genderBadge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {zone.genderBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                        {zone.floorLabel} • {zone.spec}
                      </p>
                    </div>
                  </div>

                  {/* Occupancy Indicator */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700">
                      <span>{occupied}/{zone.beds.length} Occupied</span>
                      <span className="text-slate-400 font-normal">({occPercent}%)</span>
                    </div>

                    {/* Multi-segment micro bar */}
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 flex overflow-hidden ml-auto">
                      <div style={{ width: `${(available / zone.beds.length) * 100}%` }} className="bg-emerald-500" />
                      <div style={{ width: `${(occupied / zone.beds.length) * 100}%` }} className="bg-rose-500" />
                      <div style={{ width: `${(cleaning / zone.beds.length) * 100}%` }} className="bg-amber-500" />
                    </div>
                  </div>
                </div>

                {/* Bed Tiles Grid */}
                {viewDensity === 'matrix' ? (
                  /* Compact Table Density */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-1.5 pr-2">Bed</th>
                          <th className="py-1.5 px-2">Status</th>
                          <th className="py-1.5 px-2">Patient / Details</th>
                          <th className="py-1.5 pl-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {zone.beds.map(bed => (
                          <tr 
                            key={bed.id}
                            onClick={() => setSelectedBedModal({ bed, zone })}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2 pr-2 font-mono font-bold text-slate-900">{bed.code}</td>
                            <td className="py-2 px-2">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                bed.status === 'Occupied' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                bed.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  bed.status === 'Occupied' ? 'bg-rose-500' :
                                  bed.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} />
                                {bed.status === 'Occupied' ? 'Admitted' : bed.status === 'Available' ? 'Vacant' : 'Cleaning'}
                              </span>
                            </td>
                            <td className="py-2 px-2 truncate max-w-[150px]">
                              {bed.patient ? (
                                <span className="font-semibold text-slate-800">{bed.patient.name} ({bed.patient.diagnosis})</span>
                              ) : bed.status === 'Available' ? (
                                <span className="text-slate-500">₹{bed.dailyRate} / day</span>
                              ) : (
                                <span className="text-amber-700 font-medium">Housekeeping</span>
                              )}
                            </td>
                            <td className="py-2 pl-2 text-right">
                              <span className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Manage →</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Professional Bed Cards Density (4 Columns) */
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-1">
                    {zone.beds.map(bed => {
                      const isOcc = bed.status === 'Occupied';
                      const isAvail = bed.status === 'Available';
                      const isClean = bed.status === 'Sanitizing';

                      return (
                        <div
                          key={bed.id}
                          onMouseEnter={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredBed({ bed, zone, rect });
                          }}
                          onMouseLeave={() => setHoveredBed(null)}
                          onClick={() => {
                            setSelectedBedModal({ bed, zone });
                            setHoveredBed(null);
                          }}
                          className={`rounded-lg border text-left p-2.5 flex flex-col justify-between transition-all cursor-pointer h-[125px] ${
                            isOcc
                              ? 'bg-rose-50/30 border-rose-200 hover:border-rose-400 hover:bg-rose-50/60'
                              : isAvail
                              ? 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20'
                              : 'bg-amber-50/30 border-amber-200 hover:border-amber-400 hover:bg-amber-50/60'
                          }`}
                        >
                          {/* Top: Bed Code + Status Dot */}
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-mono font-bold tracking-tight text-slate-900">
                              {bed.code}
                            </span>
                            
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              isOcc
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isAvail
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isOcc ? 'bg-rose-500' : isAvail ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} />
                              {isOcc ? 'Admitted' : isAvail ? 'Vacant' : 'Clean'}
                            </span>
                          </div>

                          {/* Center: Custom 3D Isometric Hospital Bed Illustration */}
                          <div className="py-1 flex items-center justify-center my-auto">
                            <MedicalHospitalBedIcon status={bed.status} className="w-13 h-10 transition-transform duration-200 hover:scale-105" />
                          </div>

                          {/* Bottom: Action / Vitals / Details */}
                          <div className="pt-1.5 border-t border-slate-100 w-full">
                            {isOcc && bed.patient ? (
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                                  {bed.patient.name}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5 font-medium">
                                  {bed.patient.gender}/{bed.patient.age} • {bed.patient.doctor.split(' ')[1] || bed.patient.doctor}
                                </p>
                              </div>
                            ) : isAvail ? (
                              <div className="flex items-center justify-between text-emerald-700">
                                <span className="text-xs font-bold">+ Admit</span>
                                <span className="text-[11px] text-slate-500 font-medium">₹{bed.dailyRate}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-amber-700">
                                <span className="text-xs font-bold">Housekeeping</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateBedStatus(bed.id, 'Available');
                                    showToast(`Bed ${bed.code} marked as Ready!`);
                                  }}
                                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  ✓ Ready
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ward Card Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {available} Free
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {occupied} Admitted
                    </span>
                    {cleaning > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {cleaning} Cleaning
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-slate-800 text-xs">
                    ₹{zone.beds[0]?.dailyRate.toLocaleString()} <span className="font-normal text-slate-400">/ day</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 3. HOVER TOOLTIP (Clean SaaS Popover) ── */}
      {hoveredBed && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredBed.rect.left + hoveredBed.rect.width / 2}px`,
            top: `${hoveredBed.rect.top - 8}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="pointer-events-none w-72 bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 relative text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-white">
                {hoveredBed.bed.code}
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                {hoveredBed.zone.title}
              </span>
            </div>
            
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              hoveredBed.bed.status === 'Occupied' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                : hoveredBed.bed.status === 'Available' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {hoveredBed.bed.status === 'Occupied' ? 'Admitted' : hoveredBed.bed.status}
            </span>
          </div>

          {hoveredBed.bed.status === 'Occupied' && hoveredBed.bed.patient ? (
            <div className="space-y-2">
              <div>
                <p className="font-bold text-white text-xs leading-tight">
                  {hoveredBed.bed.patient.name}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {hoveredBed.bed.patient.gender === 'M' ? 'Male' : 'Female'}, {hoveredBed.bed.patient.age}Y • UHID: {hoveredBed.bed.patient.uhid}
                </p>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-semibold">Diagnosis</span>
                <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5 mt-0.5">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{hoveredBed.bed.patient.diagnosis}</span>
                </span>
              </div>

              <div className="text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Attending:</span>
                <span className="font-semibold text-sky-300">
                  {hoveredBed.bed.patient.doctor}
                </span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-4 gap-1 pt-1 text-center text-[9px]">
                <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold">BP</span>
                  <span className="font-bold text-rose-300 text-[10px]">{hoveredBed.bed.patient.vitals?.bp || '—'}</span>
                </div>
                <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold">SpO2</span>
                  <span className="font-bold text-emerald-300 text-[10px]">{hoveredBed.bed.patient.vitals?.spo2 || '—'}</span>
                </div>
                <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold">Pulse</span>
                  <span className="font-bold text-sky-300 text-[10px]">{hoveredBed.bed.patient.vitals?.pulse || '—'}</span>
                </div>
                <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
                  <span className="text-slate-400 block text-[8px] font-bold">Temp</span>
                  <span className="font-bold text-amber-300 text-[10px]">{hoveredBed.bed.patient.vitals?.temp || '—'}</span>
                </div>
              </div>
            </div>
          ) : hoveredBed.bed.status === 'Available' ? (
            <div className="space-y-1.5">
              <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Vacant &amp; Ready for Admission</span>
              </p>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-[11px]">
                <span className="text-slate-400">{hoveredBed.bed.bedType}</span>
                <span className="block font-bold text-white mt-0.5">₹{hoveredBed.bed.dailyRate.toLocaleString()} / day</span>
              </div>
              <p className="text-blue-400 text-[11px] font-medium pt-0.5">👉 Click bed to assign a patient</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-amber-400 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>Housekeeping In Progress</span>
              </p>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-[11px] text-slate-300">
                Fresh linens placed • Estimated ready in ~15 mins
              </div>
            </div>
          )}

          {/* Pointer Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45" />
        </div>
      )}

      {/* ── 4. BED DETAILS MODAL ── */}
      {selectedBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <MedicalHospitalBedIcon status={selectedBedModal.bed.status} className="w-10 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bed {selectedBedModal.bed.code}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedBedModal.zone.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBedModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Occupied State */}
              {selectedBedModal.bed.status === 'Occupied' && selectedBedModal.bed.patient && (
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {selectedBedModal.bed.patient.name}
                      </h4>
                      <span className="text-slate-600 text-xs font-semibold">
                        {selectedBedModal.bed.patient.gender === 'M' ? 'Male' : 'Female'}, {selectedBedModal.bed.patient.age}Y
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs">
                      UHID: <span className="font-mono font-bold text-slate-800">{selectedBedModal.bed.patient.uhid}</span>
                    </p>

                    <p className="text-slate-700 font-medium pt-1">
                      Diagnosis: <span className="text-amber-800 font-bold">{selectedBedModal.bed.patient.diagnosis}</span>
                    </p>

                    <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Doctor:</span>
                      <span className="font-bold text-blue-700">{selectedBedModal.bed.patient.doctor}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Admitted:</span>
                      <span className="font-semibold text-slate-700">{selectedBedModal.bed.patient.admittedAt}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Emergency Phone:</span>
                      <span className="font-semibold text-slate-700">{selectedBedModal.bed.patient.phone || '—'}</span>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                      <span className="text-[10px] text-rose-700 font-bold block">BP</span>
                      <span className="text-xs font-bold text-slate-900">{selectedBedModal.bed.patient.vitals?.bp || '—'}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                      <span className="text-[10px] text-emerald-700 font-bold block">SpO2</span>
                      <span className="text-xs font-bold text-slate-900">{selectedBedModal.bed.patient.vitals?.spo2 || '—'}</span>
                    </div>
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-2">
                      <span className="text-[10px] text-sky-700 font-bold block">Pulse</span>
                      <span className="text-xs font-bold text-slate-900">{selectedBedModal.bed.patient.vitals?.pulse || '—'}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <span className="text-[10px] text-amber-700 font-bold block">Temp</span>
                      <span className="text-xs font-bold text-slate-900">{selectedBedModal.bed.patient.vitals?.temp || '—'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      updateBedStatus(selectedBedModal.bed.id, 'Sanitizing');
                      showToast(`Discharge complete for ${selectedBedModal.bed.patient?.name}. Bed ${selectedBedModal.bed.code} sent to Housekeeping.`);
                      setSelectedBedModal(null);
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Initiate Discharge</span>
                  </button>
                </div>
              )}

              {/* Available State */}
              {selectedBedModal.bed.status === 'Available' && (
                <div className="space-y-3 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">Bed is Clean &amp; Vacant</p>
                    <p className="text-xs text-slate-500">{selectedBedModal.bed.bedType}</p>
                    <p className="text-xs font-bold text-emerald-800 pt-1">
                      Rate: ₹{selectedBedModal.bed.dailyRate.toLocaleString()} / day
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      // A bed can only be occupied by a real, registered patient.
                      // Route to the admission form instead of inventing a patient
                      // record (previously this fabricated a name, age, doctor,
                      // phone number and a full set of normal vital signs).
                      if (onAdmitPatient) {
                        onAdmitPatient(selectedBedModal.bed.code);
                      } else {
                        showToast(`Register the patient via the admission form before allocating Bed ${selectedBedModal.bed.code}.`);
                      }
                      setSelectedBedModal(null);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Admit Patient Here</span>
                  </button>
                </div>
              )}

              {/* Sanitizing State */}
              {selectedBedModal.bed.status === 'Sanitizing' && (
                <div className="space-y-3 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
                    <RefreshCw className="w-8 h-8 text-amber-600 mx-auto mb-2 animate-spin" />
                    <p className="font-bold text-slate-900 text-sm">Housekeeping In Progress</p>
                    <p className="text-xs text-slate-500">Deep cleaning &amp; fresh linens</p>
                  </div>

                  <button
                    onClick={() => {
                      updateBedStatus(selectedBedModal.bed.id, 'Available');
                      showToast(`Bed ${selectedBedModal.bed.code} marked as Sanitized & Ready!`);
                      setSelectedBedModal(null);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    ✓ Mark as Sanitized &amp; Ready
                  </button>
                </div>
              )}

              <button
                onClick={() => setSelectedBedModal(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
