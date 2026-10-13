import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode, useCallback } from 'react';
import { ChaudharyPatientRow } from '../components/chaudhary/ChaudharyPatientsView';
import { api } from '../services/api';
import { subscribeToHmsEvent } from '../services/realtime';

interface HospitalContextType {
  patients: ChaudharyPatientRow[];
  setPatients: React.Dispatch<React.SetStateAction<ChaudharyPatientRow[]>>;
  addPatient: (newPatient: ChaudharyPatientRow) => Promise<void>;
  updatePatient: (id: string, updates: Partial<ChaudharyPatientRow>) => Promise<void>;
  transferBed: (patientId: string, newBed: string, newWard?: string) => Promise<void>;
  dischargePatient: (patientId: string) => Promise<void>;
  admitToIpd: (patientId: string, bedNo: string, ward: string) => Promise<void>;
  refreshPatients: () => Promise<void>;
  isLoadingPatients: boolean;
  // Global modal triggers for hotkeys
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isNewPatientModalOpen: boolean;
  setIsNewPatientModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function mapDbPatientToRow(p: any, vitals?: any): ChaudharyPatientRow {
  const isMale = p.gender === 'Male' || p.gender === 'M';

  // Admission timestamp comes from the record only — never default to "now"
  const admDate = p.admission_date ? new Date(p.admission_date) : null;
  const hasValidAdmDate = !!admDate && !isNaN(admDate!.getTime());
  const dateStr = hasValidAdmDate
    ? `${admDate!.getMonth() + 1}/${admDate!.getDate()}/${admDate!.getFullYear()}`
    : '—';
  const timeStr = hasValidAdmDate
    ? admDate!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  // ward_type is provided by the backend and is authoritative; the bed-label
  // inference below only covers legacy records that predate that field.
  let wardName = p.ward_type || '';
  if (!wardName) {
    const bedLower = (p.bed_no || '').toLowerCase();
    if (!p.bed_no || p.bed_no === '-' || p.patient_type === 'OPD') {
      wardName = 'OPD';
    } else if (bedLower.includes('icu')) {
      wardName = 'Intensive Care Unit (ICU Floor 3)';
    } else if (bedLower.includes('female')) {
      wardName = 'Female General Ward';
    } else if (bedLower.includes('et') || bedLower.includes('emergency')) {
      wardName = 'Emergency Triage';
    } else if (bedLower.includes('pvt')) {
      wardName = 'Private Cabin Ward';
    } else {
      wardName = 'General Ward';
    }
  }

  return {
    id: p.patient_id || p._id,
    name: p.name || 'Patient',
    guardian: p.guardian_name || '',
    type: (p.patient_type || (p.bed_no && p.bed_no !== '-' ? 'IPD' : 'OPD')) as 'IPD' | 'OPD',
    age: p.age ?? 0,
    gender: isMale ? 'M' : 'F',
    bedNo: p.bed_no || '-',
    ward: wardName,
    admissionDate: dateStr,
    admissionTime: timeStr,
    status: (p.status?.toUpperCase() === 'DISCHARGED' ? 'DISCHARGED' : 'ADMITTED') as 'ADMITTED' | 'ACTIVE' | 'DISCHARGED',
    payStatus: (p.payment_status?.toUpperCase() === 'PAID' ? 'PAID' : 'PENDING') as 'PENDING' | 'PAID',
    phone: p.mobile || '',
    address: p.address || '',
    condition: p.problem || '',
    doctor: p.doctor_assigned || '',
    totalBilled: p.totalBill !== undefined ? `₹${p.totalBill}` : '₹0',
    amountPaid: (p.totalBill !== undefined && p.pending_amount !== undefined) ? `₹${Math.max(0, p.totalBill - p.pending_amount)}` : '₹0',
    amountDue: p.pending_amount !== undefined ? `₹${p.pending_amount}` : '₹0',
    initial: (p.name?.trim()[0] || 'P').toUpperCase(),
    // Real recorded vitals only — "—" when nothing has been recorded for this patient
    bp: vitals?.bp || '—',
    pulse: vitals?.pulse ?? undefined,
    spo2: vitals?.spo2 ?? undefined
  };
}

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<ChaudharyPatientRow[]>([]);
  // Mirror of `patients` usable inside callbacks without widening their
  // dependency list — lets a failed mutation roll back to the exact row the
  // user was looking at before the optimistic update.
  const patientsRef = useRef<ChaudharyPatientRow[]>([]);
  useEffect(() => { patientsRef.current = patients; }, [patients]);
  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stable toast helper — the timer is tracked so repeated toasts don't stack
  // up one setInterval/setTimeout per call.
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  // Fetch real patients + their most recent recorded vitals from MongoDB
  const refreshPatients = useCallback(async () => {
    try {
      if (patientsRef.current.length === 0) {
        setIsLoadingPatients(true);
      }
      const [patientsRes, vitalsRes] = await Promise.all([
        api.patients.getAll(),
        api.vitals.getAll().catch(() => null),
      ]);

      // Latest vitals per patient (API returns newest first)
      const vitalsByPatient = new Map<string, any>();
      (vitalsRes?.vitals || []).forEach((v: any) => {
        const key = v?.patient_id ? String(v.patient_id) : null;
        if (key && !vitalsByPatient.has(key)) vitalsByPatient.set(key, v);
      });

      if (patientsRes?.success && Array.isArray(patientsRes.patients)) {
        const mapped = patientsRes.patients.map((p: any) =>
          mapDbPatientToRow(p, vitalsByPatient.get(String(p.patient_id || p._id)))
        );
        setPatients(mapped);
      }
    } catch (err) {
      console.warn('[HospitalContext] Backend sync error:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    refreshPatients();

    const handleAuthChange = () => {
      refreshPatients();
    };

    window.addEventListener('chaudhary_auth_updated', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('chaudhary_auth_updated', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refreshPatients]);

  // Real-time: the backend broadcasts these events only AFTER a write has been
  // committed to MongoDB, so re-reading on receipt can never show data that
  // did not persist. This is what keeps a change made in one portal visible in
  // every other authorized portal without a manual refresh.
  useEffect(() => {
    const unsubscribers = [
      subscribeToHmsEvent('patient:admitted', () => {
        refreshPatients();
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      }),
      subscribeToHmsEvent('patient:updated', () => {
        refreshPatients();
      }),
      subscribeToHmsEvent('patient:discharged', () => {
        refreshPatients();
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      }),
      subscribeToHmsEvent('bed:updated', () => {
        refreshPatients();
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      }),
      subscribeToHmsEvent('settings:updated', () => {
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      }),
    ];
    return () => { unsubscribers.forEach((off) => off()); };
  }, [refreshPatients]);

  const addPatient = useCallback(async (newPatient: ChaudharyPatientRow) => {
    // Optimistic UI update
    setPatients((prev) => [newPatient, ...prev]);
    showToast(`Registering ${newPatient.name}...`);

    try {
      const payload = {
        name: newPatient.name,
        age: newPatient.age,
        gender: newPatient.gender === 'M' ? 'Male' : 'Female',
        guardian_name: newPatient.guardian,
        mobile: newPatient.phone,
        address: newPatient.address,
        bed_no: newPatient.bedNo !== '-' ? newPatient.bedNo : null,
        doctor_assigned: newPatient.doctor || 'Duty Doctor',
        problem: newPatient.condition || 'General OPD Consultation',
        patient_type: newPatient.type,
        status: newPatient.status === 'DISCHARGED' ? 'Discharged' : 'Admitted',
        payment_status: newPatient.payStatus === 'PAID' ? 'Paid' : 'Pending',
      };

      const res = await api.patients.create(payload);
      if (res?.success && res.patient) {
        const savedRow = mapDbPatientToRow(res.patient);
        setPatients((prev) =>
          prev.map((p) => (p.name === newPatient.name && p.id === newPatient.id ? savedRow : p))
        );
        showToast(`Patient ${savedRow.name} registered successfully (ID: ${savedRow.id}).`);
      } else {
        // The backend did not return a saved record — treat it as a failure
        // rather than leaving an unregistered patient on screen.
        throw new Error('the server did not return a saved patient');
      }
    } catch (err: any) {
      // Roll back the optimistic row — the patient was NOT registered.
      setPatients((prev) => prev.filter((p) => !(p.name === newPatient.name && p.id === newPatient.id)));
      showToast(`Registration failed — ${newPatient.name} was not saved to the hospital record.`);
    }
  }, [showToast]);

  const updatePatient = useCallback(async (id: string, updates: Partial<ChaudharyPatientRow>) => {
    const snapshot = patientsRef.current.find((p) => p.id === id);
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    try {
      const res = await api.patients.update(id, {
        name: updates.name,
        age: updates.age,
        bed_no: updates.bedNo !== '-' ? updates.bedNo : null,
        doctor_assigned: updates.doctor,
        problem: updates.condition,
        mobile: updates.phone,
        address: updates.address,
      });
      if ((res as any)?.success === false) throw new Error('update was not accepted');
    } catch {
      // The edit did not persist — restore the last server-known row so the
      // screen never shows values that are not in MongoDB.
      if (snapshot) {
        setPatients((prev) => prev.map((p) => (p.id === id ? snapshot : p)));
      } else {
        await refreshPatients().catch(() => {});
      }
      showToast('Changes were not saved to the hospital record.');
    }
  }, [showToast, refreshPatients]);

  const transferBed = useCallback(async (patientId: string, newBed: string, newWard?: string) => {
    let patientName = '';
    let oldBed = '';
    // Optimistic update so the row moves immediately, but the success message
    // is withheld until the backend has actually accepted the transfer.
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          patientName = p.name;
          oldBed = p.bedNo;
          return {
            ...p,
            bedNo: newBed,
            ward: newWard || p.ward,
          };
        }
        return p;
      })
    );

    try {
      const res = await api.patients.transferBed({
        patient_id: patientId,
        new_bed_no: newBed,
        ward_type: newWard,
      });
      if ((res as any)?.success === false) throw new Error('transfer was not accepted');

      showToast(`Patient ${patientName || patientId} moved from Bed ${oldBed} to Bed ${newBed}.`);
    } catch {
      // The move did not reach MongoDB — re-read the authoritative record so
      // the bed the patient still actually occupies is shown again, and say so
      // instead of leaving a false "moved" message on screen.
      await refreshPatients().catch(() => {});
      showToast(`Bed transfer for ${patientName || patientId} was not saved — the patient remains in Bed ${oldBed}.`);
    }
  }, [showToast, refreshPatients]);

  const dischargePatient = useCallback(async (patientId: string) => {
    let patientName = '';
    // Optimistic update so the row changes immediately, but if the backend
    // rejects it we re-read the authoritative record below — otherwise the
    // screen would keep showing the patient as discharged and the bed as free
    // even though MongoDB never recorded it.
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          patientName = p.name;
          return {
            ...p,
            status: 'DISCHARGED',
            bedNo: '-',
          };
        }
        return p;
      })
    );

    try {
      // Only the real discharge date is sent — no fabricated clinical narrative.
      await api.discharge.create({
        patientId,
        dischargeDate: new Date(),
      });
      await refreshPatients().catch(() => {});
      showToast(`Patient ${patientName || patientId} discharged successfully.`);
    } catch {
      // Roll back to the last known server state and report the real outcome.
      await refreshPatients().catch(() => {});
      showToast(`Discharge of ${patientName || patientId} was not saved to the hospital record.`);
    }
  }, [showToast, refreshPatients]);

  const admitToIpd = useCallback(async (patientId: string, bedNo: string, ward: string) => {
    let patientName = '';
    const snapshot = patientsRef.current.find((p) => p.id === patientId);
    // Optimistic update so the row changes immediately; the confirmation is
    // only shown once the backend has accepted the admission.
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          patientName = p.name;
          return {
            ...p,
            type: 'IPD',
            status: 'ADMITTED',
            bedNo,
            ward,
          };
        }
        return p;
      })
    );

    try {
      const res = await api.patients.update(patientId, {
        bed_no: bedNo,
        patient_type: 'IPD',
        status: 'Admitted',
      });
      if ((res as any)?.success === false) throw new Error('admission was not accepted');

      showToast(`Patient ${patientName || patientId} admitted to ${ward} (Bed ${bedNo}).`);
    } catch {
      // Roll back so the bed is not shown as taken when it never was.
      if (snapshot) {
        setPatients((prev) => prev.map((p) => (p.id === patientId ? snapshot : p)));
      } else {
        await refreshPatients().catch(() => {});
      }
      showToast(`IPD admission for ${patientName || patientId} was not saved — Bed ${bedNo} is still free.`);
    }
  }, [showToast, refreshPatients]);

  // Memoised so that the ~16 context consumers (sidebars, KPI cards, command
  // search, dashboards) don't all re-render on every provider render — previously
  // this object was rebuilt inline each time, so any state change here (including
  // a toast appearing) re-rendered every consumer.
  const value = useMemo<HospitalContextType>(
    () => ({
      patients,
      setPatients,
      addPatient,
      updatePatient,
      transferBed,
      dischargePatient,
      admitToIpd,
      refreshPatients,
      isLoadingPatients,
      isGlobalSearchOpen,
      setIsGlobalSearchOpen,
      isNewPatientModalOpen,
      setIsNewPatientModalOpen,
      toastMessage,
      showToast,
    }),
    [
      patients,
      addPatient,
      updatePatient,
      transferBed,
      dischargePatient,
      admitToIpd,
      refreshPatients,
      isLoadingPatients,
      isGlobalSearchOpen,
      isNewPatientModalOpen,
      toastMessage,
      showToast,
    ]
  );

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};

export const useHospitalContext = () => {
  const ctx = useContext(HospitalContext);
  if (!ctx) {
    throw new Error('useHospitalContext must be used within a HospitalProvider');
  }
  return ctx;
};
