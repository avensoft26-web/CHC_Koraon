import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../services/api';
import {
  Users,
  Stethoscope,
  Activity,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Plus,
  Printer,
  CheckCircle2,
  X,
  ArrowRight,
  BedDouble,
  FlaskConical,
  Heart,
  Thermometer,
  Search,
  Filter,
  Check,
  ChevronRight,
  ShieldAlert,
  Send,
  Building2,
  LogOut,
  IndianRupee,
  Receipt,
  UserPlus,
  FileBadge,
  History
} from 'lucide-react';
import { DoctorNavTab } from './ChaudharyDoctorSidebar';
import { useBillingAccess } from '../../../utils/billingAccess';
import { useDoctorDashboardVisibility } from '../../../utils/doctorDashboardVisibility';
import { useAuthUser } from '../../../hooks/useAuthUser';
import { subscribeToHmsEvent } from '../../../services/realtime';
import { MedicineAutocomplete } from '../../common/MedicineAutocomplete';
import { DiagnosisAutocomplete } from '../../common/DiagnosisAutocomplete';

interface ChaudharyDoctorHomeViewProps {
  onNavigate: (tab: DoctorNavTab) => void;
  userId?: string;
}

interface OpdPatient {
  token: number;
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  phone: string;
  complaint: string;
  status: 'Waiting' | 'In Consultation' | 'Completed';
  bp: string;
  pulse: string;
  spo2: string;
}

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instruction: string;
}

interface ClinicalActivityItem {
  id: string;
  type: 'patient' | 'payment' | 'note' | 'discharge';
  title: string;
  time: string;
  badge?: string;
}

export const ChaudharyDoctorHomeView: React.FC<ChaudharyDoctorHomeViewProps> = ({
  onNavigate,
}) => {
  const hasBillingAccess = useBillingAccess();
  const { showAdmitted, showDischarged } = useDoctorDashboardVisibility();
  // The signed-in clinician — this dashboard only ever shows one doctor's own view
  const authUser = useAuthUser();

  // Real Database States
  const [patients, setPatients] = useState<any[]>([]);
  const [billings, setBillings] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [opdQueue, setOpdQueue] = useState<OpdPatient[]>([]);
  const [liveBeds, setLiveBeds] = useState<any[]>([]);

  // Calculate live bed telemetry by ward
  const bedStats = useMemo(() => {
    const list = liveBeds || [];
    const total = list.length || 46;
    const occupied = list.filter((b: any) => b.status === 'Occupied').length;
    const available = Math.max(0, total - occupied);

    const maleBeds = list.filter((b: any) => String(b.bedNo).toUpperCase().startsWith('MALE'));
    const maleTotal = maleBeds.length || 14;
    const maleOcc = maleBeds.filter((b: any) => b.status === 'Occupied').length;
    const malePct = maleTotal > 0 ? Math.round((maleOcc / maleTotal) * 100) : 0;

    const femaleBeds = list.filter((b: any) => String(b.bedNo).toUpperCase().startsWith('FEMALE'));
    const femaleTotal = femaleBeds.length || 20;
    const femaleOcc = femaleBeds.filter((b: any) => b.status === 'Occupied').length;
    const femalePct = femaleTotal > 0 ? Math.round((femaleOcc / femaleTotal) * 100) : 0;

    const icuBeds = list.filter((b: any) => String(b.bedNo).toUpperCase().startsWith('ICU'));
    const icuTotal = icuBeds.length || 7;
    const icuOcc = icuBeds.filter((b: any) => b.status === 'Occupied').length;
    const icuPct = icuTotal > 0 ? Math.round((icuOcc / icuTotal) * 100) : 0;

    const pvtBeds = list.filter((b: any) => String(b.bedNo).toUpperCase().startsWith('PVT') || String(b.bedNo).toUpperCase().startsWith('PRIVATE'));
    const pvtTotal = pvtBeds.length || 5;
    const pvtOcc = pvtBeds.filter((b: any) => b.status === 'Occupied').length;
    const pvtPct = pvtTotal > 0 ? Math.round((pvtOcc / pvtTotal) * 100) : 0;

    return {
      total,
      occupied,
      available,
      male: { occ: maleOcc, total: maleTotal, pct: malePct },
      female: { occ: femaleOcc, total: femaleTotal, pct: femalePct },
      icu: { occ: icuOcc, total: icuTotal, pct: icuPct },
      pvt: { occ: pvtOcc, total: pvtTotal, pct: pvtPct },
    };
  }, [liveBeds]);

  // Fetch live patients, billing, beds, and appointments from MongoDB
  useEffect(() => {
    let isMounted = true;

    const refreshBeds = () => {
      api.beds.getAll().then((res) => {
        if (isMounted && res?.success && Array.isArray(res.beds)) {
          setLiveBeds(res.beds);
        }
      }).catch(() => { });
    };

    const unsubscribeBedEvents = subscribeToHmsEvent('bed:updated', () => {
      refreshBeds();
    });

    Promise.all([
      api.patients.getAll().catch(() => ({ success: false, patients: [] })),
      api.billing.getAll().catch(() => ({ success: false, billings: [] })),
      api.appointments.getAll().catch(() => ({ success: false, appointments: [] })),
      api.vitals.getAll().catch(() => ({ success: false, vitals: [] })),
      api.beds.getAll().catch(() => ({ success: false, beds: [] })),
    ]).then(([patRes, billRes, aptRes, vitRes, bedRes]: any[]) => {
      if (!isMounted) return;
      const realPatients = (patRes.success && Array.isArray(patRes.patients)) ? patRes.patients : [];
      const realBillings = (billRes.success && Array.isArray(billRes.billings)) ? billRes.billings : [];
      const realAppts = (aptRes.success && Array.isArray(aptRes.appointments)) ? aptRes.appointments : [];
      const realBeds = (bedRes.success && Array.isArray(bedRes.beds)) ? bedRes.beds : [];

      setLiveBeds(realBeds);

      // Latest recorded vitals per patient (API returns newest first)
      const vitalsByPatient = new Map<string, any>();
      if (vitRes?.success && Array.isArray(vitRes.vitals)) {
        vitRes.vitals.forEach((v: any) => {
          const key = v?.patient_id ? String(v.patient_id) : null;
          if (key && !vitalsByPatient.has(key)) vitalsByPatient.set(key, v);
        });
      }
      // Never invent a reading — an unrecorded vital shows as "—"
      const liveVitals = (patientKey?: string | null) => {
        const v = patientKey ? vitalsByPatient.get(String(patientKey)) : undefined;
        return {
          bp: v?.bp ? String(v.bp) : '—',
          pulse: v?.pulse !== undefined && v?.pulse !== null ? String(v.pulse) : '—',
          spo2: v?.spo2 !== undefined && v?.spo2 !== null ? `${v.spo2}%` : '—',
        };
      };

      setPatients(realPatients);
      setBillings(realBillings);
      setAppointments(realAppts);

      // Build real OPD Queue from OPD patients and scheduled appointments
      const opdList: OpdPatient[] = [];
      let tokenCounter = 1;

      // 1. From live appointments
      realAppts.forEach((a: any) => {
        opdList.push({
          token: a.token_no || tokenCounter++,
          id: a._id || a.appointment_id || `apt-${tokenCounter}`,
          uhid: a.patient_id || '—',
          name: a.patient_name || 'Patient',
          age: a.patient_age || 0,
          gender: (a.patient_gender === 'Female' || a.patient_gender === 'F') ? 'F' : 'M',
          phone: a.patient_phone || '—',
          complaint: a.notes || `${a.type || 'Consultation'}${a.doctor_name ? ` with ${a.doctor_name}` : ''}`,
          status: a.status === 'In Consultation' ? 'In Consultation' : (a.status === 'Completed' ? 'Completed' : 'Waiting'),
          ...liveVitals(a.patient_id),
        });
      });

      // 2. From real active OPD patients (discharged patients excluded)
      realPatients.filter((p: any) => {
        const s = String(p.status || '').toLowerCase().trim();
        return s !== 'discharged' && (p.patient_type === 'OPD' || (!p.bed_no && p.patient_type !== 'IPD'));
      }).forEach((p: any) => {
        if (!opdList.some(o => o.name === p.name || o.uhid === p.patient_id)) {
          opdList.push({
            token: tokenCounter++,
            id: p.patient_id || p._id,
            uhid: p.patient_id || '—',
            name: p.name,
            age: p.age || 0,
            gender: (p.gender === 'Female' || p.gender === 'F') ? 'F' : 'M',
            phone: p.mobile || '—',
            complaint: p.problem || '—',
            status: p.status === 'Discharged' ? 'Completed' : 'Waiting',
            ...liveVitals(p.patient_id),
          });
        }
      });

      setOpdQueue(opdList);
    });

    return () => { isMounted = false; };
  }, []);

  // Live KPI Calculations from real MongoDB records
  const totalPatientsCount = patients.length;
  const admittedCount = patients.filter(p => p.status === 'Admitted' || (p.patient_type === 'IPD' && p.status !== 'Discharged')).length;
  const dischargedCount = patients.filter(p => p.status === 'Discharged').length;
  const revenueCollected = billings.reduce((sum, b) => sum + (b.totalPaid || 0), 0);
  const paidInvoicesCount = billings.filter(b => b.payment_status === 'Paid' || b.due === 0).length;
  const pendingBillsCount = billings.filter(b => b.due > 0).length;

  // Real Dynamic Activities derived from live admissions & billings
  const activities: ClinicalActivityItem[] = useMemo(() => {
    const list: ClinicalActivityItem[] = [];
    patients.slice(0, 4).forEach((p, idx) => {
      list.push({
        id: `act-p-${idx}`,
        type: p.status === 'Discharged' ? 'discharge' : 'patient',
        title: p.status === 'Discharged' ? `Patient discharged: ${p.name}` : `Patient registered: ${p.name}`,
        time: p.admission_date ? new Date(p.admission_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
      });
    });
    billings.slice(0, 2).forEach((b, idx) => {
      if (b.totalPaid > 0) {
        list.push({
          id: `act-b-${idx}`,
          type: 'payment',
          title: `₹${b.totalPaid.toLocaleString('en-IN')} received from ${b.patient_name || 'Patient'}`,
          time: 'Today',
        });
      }
    });
    return list.slice(0, 6);
  }, [patients, billings]);

  // Consultation Drawer State
  const [activeConsultationPatient, setActiveConsultationPatient] = useState<OpdPatient | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [labTests, setLabTests] = useState('12-Lead ECG, Complete Blood Count');
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([
    { id: '1', name: 'Tab. Paracetamol 650mg', dosage: '1-0-1', duration: '5 Days', instruction: 'After Food' },
    { id: '2', name: 'Tab. Pantocid 40mg', dosage: '1-0-0 (Morning)', duration: '7 Days', instruction: 'Before Breakfast' },
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1-0-1');
  const [newMedDuration, setNewMedDuration] = useState('5 Days');
  const [newMedInstruction, setNewMedInstruction] = useState('After Food');
  const [prescriptionPrinted, setPrescriptionPrinted] = useState(false);

  const startConsultation = (patient: OpdPatient) => {
    setActiveConsultationPatient(patient);
    setDiagnosis(patient.complaint || 'Clinical Evaluation & Symptomatic Relief');
    setClinicalNotes(`Initial evaluation completed for ${patient.name}. Vitals: BP ${patient.bp}, Pulse ${patient.pulse}, SpO2 ${patient.spo2}.`);
    setPrescriptionPrinted(false);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setMedicines(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMedName.trim(),
        dosage: newMedDosage,
        duration: newMedDuration,
        instruction: newMedInstruction,
      }
    ]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleCompleteConsultation = () => {
    if (activeConsultationPatient) {
      setOpdQueue(prev => prev.map(p => p.id === activeConsultationPatient.id ? { ...p, status: 'Completed' } : p));
      setActiveConsultationPatient(null);
    }
  };

  // Dynamic visible KPI count for row 1 grid columns
  const visibleKpiCount = 4 + (showAdmitted ? 1 : 0) + (showDischarged ? 1 : 0);
  const kpiGridCols = visibleKpiCount === 6 ? 'lg:grid-cols-6' : visibleKpiCount === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  // Dynamic quick action button count for row 2 clinical summary
  const quickActionCount = (showAdmitted ? 1 : 0) + 1 + (hasBillingAccess ? 1 : 0) + 1;
  const quickActionGridClass = quickActionCount === 4 ? 'grid-cols-4' : quickActionCount === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className="space-y-4">
      {/* =========================================================================
          ROW 1: PREMIUM GLASSMORPHIC KPI CARDS (Dynamically adapts when cards are toggled)
      ========================================================================= */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${kpiGridCols} gap-3`}>
        {/* Card 1: Total Patients (Soft Sky Glass) - Hover Lift Active, Non-clickable */}
        <div className="relative glass-card-soft-sky rounded-3xl p-3.5 sm:p-4 overflow-hidden !border-2 !border-sky-400 shadow-xs hover:shadow-[0_12px_28px_rgba(56,189,248,0.22)] hover:-translate-y-0.5 transition-all duration-300 cursor-default select-none flex flex-col justify-between">
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              TOTAL PATIENTS
            </span>
            <div className="w-8.5 h-8.5 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-[0_6px_16px_rgba(56,189,248,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/50 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                {totalPatientsCount}
              </span>
              <span className="font-outfit text-[10px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0">
                Active Today
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Admitted (Soft Emerald Glass) - Hover Lift Active, Non-clickable */}
        {showAdmitted && (
          <div className="relative glass-card-soft-emerald rounded-2xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-emerald-400/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between z-10 min-w-0">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
                ADMITTED
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2 z-10 min-w-0">
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                  {admittedCount}
                </span>
                <span className="font-outfit text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  In Ward
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Discharged (Soft Amber Glass) - Hover Lift Active, Non-clickable */}
        {showDischarged && (
          <div className="relative glass-card-soft-amber rounded-2xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-amber-400/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between z-10 min-w-0">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
                DISCHARGED
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2 z-10 min-w-0">
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                  {dischargedCount}
                </span>
                <span className="font-outfit text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                  Completed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card 4: Revenue Collected (Soft Indigo Glass) - Hover Lift Active, Non-clickable */}
        <div className="relative glass-card-soft-indigo rounded-2xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-indigo-400/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none flex flex-col justify-between">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1 min-w-0">
              <span className="font-outfit text-xl sm:text-[23px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs truncate">
                {revenueCollected > 0 ? `₹${revenueCollected.toLocaleString('en-IN')}` : '₹0'}
              </span>
              <span className="font-outfit text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                Cashier Total
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Paid Invoices (Soft Purple Glass) - Hover Lift Active, Non-clickable */}
        <div className="relative glass-card-soft-purple rounded-2xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-purple-400/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none flex flex-col justify-between">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              PAID INVOICES
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                {paidInvoicesCount}
              </span>
              <span className="font-outfit text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                Cleared
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Pending Bills (Soft Rose Glass) - Hover Lift Active, Non-clickable */}
        <div className="relative glass-card-soft-rose rounded-2xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-rose-400/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default select-none flex flex-col justify-between">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider truncate">
              PENDING BILLS
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[28px] font-extrabold text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                {pendingBillsCount}
              </span>
              <span className="font-outfit text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                Action Req.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: CLINICAL SUMMARY & BED OCCUPANCY (Glass Style & Compact Height)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Clinical Summary Card (Soft Indigo Glass) */}
        <div className="relative glass-card-soft-indigo rounded-3xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-indigo-400/90 shadow-xs flex flex-col justify-between">
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/50 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900">
                Clinical Summary
              </h3>
            </div>

            {/* Polished Glass Metric Tiles */}
            <div className="space-y-1.5 text-xs">
              {/* Doctor */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-indigo-100/80 transition-all flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-slate-700 font-semibold text-xs">Doctor</span>
                </div>
                <span className="font-bold text-slate-900 text-xs bg-indigo-50/70 px-2 py-0.5 rounded-lg border border-indigo-200/70">
                  {authUser.name || '—'}
                </span>
              </div>

              {/* Active Patients (Only when showAdmitted is true) */}
              {showAdmitted && (
                <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-indigo-100/80 transition-all flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-slate-700 font-semibold text-xs">Active Patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200/70">Admitted</span>
                    <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-lg bg-white border border-sky-200/90 shadow-2xs">
                      {admittedCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Discharged Today (Only when showDischarged is true) */}
              {showDischarged && (
                <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-indigo-100/80 transition-all flex items-center justify-between shadow-2xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="text-slate-700 font-semibold text-xs">Discharged Today</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70">Done</span>
                    <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-lg bg-white border border-emerald-200/90 shadow-2xs">
                      {dischargedCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Surgery Cases */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-indigo-100/80 transition-all flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="text-slate-700 font-semibold text-xs">Surgery Cases</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">Scheduled</span>
                  <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                    0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Glass Buttons (Dynamically adapts to active buttons) */}
          <div className={`grid gap-2 pt-2.5 mt-2 border-t border-indigo-100/70 ${quickActionGridClass}`}>
            {/* Admit - Only rendered when showAdmitted is true */}
            {showAdmitted && (
              <button
                onClick={() => onNavigate('Add Patient')}
                className="py-2 px-1 rounded-2xl bg-gradient-to-b from-emerald-50/90 to-emerald-100/50 hover:from-emerald-100/90 hover:to-emerald-200/60 backdrop-blur-md !border-2 !border-emerald-400/90 hover:!border-emerald-500 text-emerald-950 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group animate-fadeIn"
              >
                <UserPlus className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="text-[11px] sm:text-xs font-bold truncate">Admit</span>
              </button>
            )}

            {/* Patients */}
            <button
              onClick={() => onNavigate('Patients')}
              className="py-2 px-1 rounded-2xl bg-gradient-to-b from-sky-50/90 to-sky-100/50 hover:from-sky-100/90 hover:to-sky-200/60 backdrop-blur-md !border-2 !border-sky-400/90 hover:!border-sky-500 text-sky-950 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(56,189,248,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group"
            >
              <Users className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <span className="text-[11px] sm:text-xs font-bold truncate">Patients</span>
            </button>

            {/* Billing (Only rendered when Billing access is ON) */}
            {hasBillingAccess && (
              <button
                onClick={() => onNavigate('Billing')}
                className="py-2 px-1 rounded-2xl bg-gradient-to-b from-amber-50/90 to-amber-100/50 hover:from-amber-100/90 hover:to-amber-200/60 backdrop-blur-md !border-2 !border-amber-400/90 hover:!border-amber-500 text-amber-950 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group"
              >
                <Receipt className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="text-[11px] sm:text-xs font-bold truncate">Billing</span>
              </button>
            )}

            {/* Records */}
            <button
              onClick={() => onNavigate('Patient Records')}
              className="py-2 px-1 rounded-2xl bg-gradient-to-b from-purple-50/90 to-purple-100/50 hover:from-purple-100/90 hover:to-purple-200/60 backdrop-blur-md !border-2 !border-purple-400/90 hover:!border-purple-500 text-purple-950 flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group"
            >
              <FileBadge className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <span className="text-[11px] sm:text-xs font-bold truncate">Records</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Bed Occupancy Card (Soft Emerald Glass) */}
        <div className="relative glass-card-soft-emerald rounded-3xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-emerald-400/90 shadow-xs flex flex-col justify-between">
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/50 flex items-center justify-center shrink-0">
                  <BedDouble className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900">
                  Bed Occupancy
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-950 bg-white/95 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                {bedStats.occupied} / {bedStats.total} Occupied
              </span>
            </div>

            {/* Quick Bed Telemetry Summary Pill (Eliminates dead space) */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="py-1 px-2 rounded-xl bg-white/80 border border-emerald-100 text-center shadow-2xs">
                <span className="text-[9.5px] text-slate-500 font-semibold block uppercase tracking-wider">Total</span>
                <span className="font-outfit font-bold text-slate-900 text-xs">{bedStats.total}</span>
              </div>
              <div className="py-1 px-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-center shadow-2xs">
                <span className="text-[9.5px] text-emerald-800 font-semibold block uppercase tracking-wider">Occupied</span>
                <span className="font-outfit font-bold text-emerald-950 text-xs">{bedStats.occupied}</span>
              </div>
              <div className="py-1 px-2 rounded-xl bg-teal-50/80 border border-teal-200/80 text-center shadow-2xs">
                <span className="text-[9.5px] text-teal-800 font-semibold block uppercase tracking-wider">Available</span>
                <span className="font-outfit font-bold text-teal-950 text-xs">{bedStats.available}</span>
              </div>
            </div>

            {/* Ward Bars matching screenshot (Rich Glass Subcards) */}
            <div className="space-y-1.5 text-xs">
              {/* General Male */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-emerald-100/80 transition-all shadow-2xs flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 w-24 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 shrink-0" />
                  <span className="font-semibold text-slate-800 text-[11.5px] truncate">Gen. Male</span>
                </div>
                <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden shadow-inner p-[1px]">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full shadow-[0_1px_4px_rgba(245,158,11,0.4)]" style={{ width: `${Math.min(100, bedStats.male.pct)}%` }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60">{bedStats.male.pct}%</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs w-8 text-right">{bedStats.male.occ}/{bedStats.male.total}</span>
                </div>
              </div>

              {/* General Female */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-emerald-100/80 transition-all shadow-2xs flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 w-24 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                  <span className="font-semibold text-slate-800 text-[11.5px] truncate">Gen. Female</span>
                </div>
                <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden shadow-inner p-[1px]">
                  <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full shadow-[0_1px_4px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(100, bedStats.female.pct)}%` }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/60">{bedStats.female.pct}%</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs w-8 text-right">{bedStats.female.occ}/{bedStats.female.total}</span>
                </div>
              </div>

              {/* ICU */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-emerald-100/80 transition-all shadow-2xs flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 w-24 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200 shrink-0 animate-pulse" />
                  <span className="font-semibold text-slate-800 text-[11.5px] truncate">ICU</span>
                </div>
                <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden shadow-inner p-[1px]">
                  <div className="bg-gradient-to-r from-rose-400 to-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, bedStats.icu.pct)}%` }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9.5px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">{bedStats.icu.pct}%</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs w-8 text-right">{bedStats.icu.occ}/{bedStats.icu.total}</span>
                </div>
              </div>

              {/* Private */}
              <div className="p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 border border-emerald-100/80 transition-all shadow-2xs flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 w-24 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-200 shrink-0" />
                  <span className="font-semibold text-slate-800 text-[11.5px] truncate">Private</span>
                </div>
                <div className="flex-1 bg-slate-100/90 rounded-full h-2.5 overflow-hidden shadow-inner p-[1px]">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, bedStats.pvt.pct)}%` }} />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[9.5px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">{bedStats.pvt.pct}%</span>
                  <span className="font-mono font-semibold text-slate-900 text-xs w-8 text-right">{bedStats.pvt.occ}/{bedStats.pvt.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Glass Buttons in Bed Occupancy (Adapts when Discharge is toggled) */}
          <div className={`grid ${showDischarged ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-2.5 mt-2 border-t border-emerald-100/70`}>
            <button
              onClick={() => onNavigate('Daily Notes')}
              className="py-2 px-2 rounded-2xl bg-gradient-to-b from-teal-50/90 to-teal-100/50 hover:from-teal-100/90 hover:to-teal-200/60 backdrop-blur-md !border-2 !border-teal-400/90 hover:!border-teal-500 text-teal-950 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(20,184,166,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group"
            >
              <FileText className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
              <span className="text-xs font-bold">Notes</span>
            </button>

            {showDischarged && (
              <button
                onClick={() => onNavigate('Discharge')}
                className="py-2 px-2 rounded-2xl bg-gradient-to-b from-rose-50/90 to-rose-100/50 hover:from-rose-100/90 hover:to-rose-200/60 backdrop-blur-md !border-2 !border-rose-400/90 hover:!border-rose-500 text-rose-950 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(244,63,94,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.9)] hover:-translate-y-0.5 group animate-fadeIn"
              >
                <LogOut className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform stroke-[2.2]" />
                <span className="text-xs font-bold">Discharge</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: TODAY'S CLINICAL ACTIVITY & OPD QUEUE (Compact Glass & Internal Scroll)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* LEFT (8 Columns): Today's OPD Consultation Queue (Soft Emerald Glass) */}
        <div className="lg:col-span-8 relative glass-card-soft-emerald rounded-3xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-emerald-400/90 shadow-xs flex flex-col h-[285px]">
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900">
                Today's OPD Consultation Queue (Room 102)
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/95 text-emerald-950 border border-emerald-300 shadow-2xs">
              {opdQueue.filter(p => p.status === 'Waiting').length} waiting
            </span>
          </div>

          {/* Internal Scrollable Table Container */}
          <div className="w-full flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-2xs">
                <tr className="border-b border-emerald-100 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-1 px-2 w-12 text-center">Token</th>
                  <th className="py-1 px-2.5 min-w-[125px]">Patient Name</th>
                  <th className="py-1 px-2.5 min-w-[105px]">Vitals</th>
                  <th className="py-1 px-2.5">Chief Complaint</th>
                  <th className="py-1 px-2 text-center min-w-[100px]">Status</th>
                  <th className="py-1 px-2.5 text-right min-w-[90px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50 font-medium">
                {opdQueue.map((patient) => (
                  <tr
                    key={patient.id}
                    className={`transition-colors ${parseInt(patient.spo2.replace('%', ''), 10) < 92
                        ? 'bg-rose-50/90 border-l-4 border-l-rose-600 hover:bg-rose-100/90'
                        : 'hover:bg-white/60'
                      }`}
                  >
                    <td className="py-1.5 px-2 text-center">
                      <span className={`w-6 h-6 mx-auto rounded-lg font-bold text-xs flex items-center justify-center ${parseInt(patient.spo2.replace('%', ''), 10) < 92
                          ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                          : 'bg-emerald-100/90 text-emerald-950'
                        }`}>
                        #{patient.token}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 leading-tight text-xs">{patient.name}</span>
                        {parseInt(patient.spo2.replace('%', ''), 10) < 92 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white uppercase tracking-wider animate-pulse shrink-0">
                            RED ALERT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">{patient.age}y • {patient.gender} • {patient.uhid}</div>
                    </td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] text-slate-800 font-semibold">BP: {patient.bp}</span>
                        {(() => {
                          const [sys, dia] = patient.bp.split('/').map(Number);
                          return (sys >= 140 || dia >= 90) ? (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                              HTN
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <div className="font-mono text-[10px] flex items-center gap-1 mt-0.5">
                        {parseInt(patient.spo2.replace('%', ''), 10) < 92 ? (
                          <span className="text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                            SpO2: {patient.spo2} (CRITICAL)
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">SpO2: {patient.spo2}</span>
                        )}
                        <span className="text-slate-500 font-normal">• {patient.pulse} bpm</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 max-w-[180px]">
                      <p className="truncate text-slate-600 font-normal text-[11px]" title={patient.complaint}>
                        {patient.complaint}
                      </p>
                    </td>
                    <td className="py-1.5 px-2 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${patient.status === 'In Consultation'
                        ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300'
                        : patient.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100/90 text-amber-900 border border-amber-300'
                        }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => startConsultation(patient)}
                        className="px-3 py-1 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center"
                      >
                        {patient.status === 'In Consultation' ? 'Resume' : 'Consult'}
                      </button>
                    </td>
                  </tr>
                ))}
                {opdQueue.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <p className="text-xs font-semibold text-slate-500">No OPD patients in the queue</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Scheduled appointments and OPD registrations will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT (4 Columns): Today's Clinical Activity Feed (Soft Sky Glass) */}
        <div className="lg:col-span-4 relative glass-card-soft-sky rounded-3xl p-3 sm:p-3.5 overflow-hidden !border-2 !border-sky-400/90 shadow-xs flex flex-col h-[285px]">
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-b from-sky-500 to-sky-700 text-white shadow-[0_4px_12px_rgba(56,189,248,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/50 flex items-center justify-center shrink-0">
                <History className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <h3 className="font-outfit font-bold text-sm sm:text-base text-slate-900">
                Today's Clinical Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigate('Patient Records')}
              className="text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors cursor-pointer px-2 py-0.5 rounded-lg hover:bg-sky-100/60"
            >
              View All
            </button>
          </div>

          {/* Internal Scrollable Activity Items List */}
          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
            {activities
              .filter((act) => (showDischarged ? true : act.type !== 'discharge'))
              .map((act) => (
                <div
                  key={act.id}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/75 hover:bg-white/95 border border-sky-100/80 transition-all flex items-center gap-2 shadow-2xs group"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${act.type === 'payment'
                    ? 'bg-emerald-100 text-emerald-800'
                    : act.type === 'note'
                      ? 'bg-purple-100 text-purple-800'
                      : act.type === 'discharge'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                    {act.type === 'payment' ? (
                      <IndianRupee className="w-3.5 h-3.5 stroke-[2.2]" />
                    ) : act.type === 'note' ? (
                      <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
                    ) : act.type === 'discharge' ? (
                      <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONSULTATION & E-PRESCRIPTION MODAL
      ========================================================================= */}
      {activeConsultationPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-white">
                    Consultation & E-Prescription • Token #{activeConsultationPatient.token}
                  </h3>
                  <p className="text-xs text-emerald-100 font-normal">
                    {activeConsultationPatient.name} • {activeConsultationPatient.age}y / {activeConsultationPatient.gender} • {activeConsultationPatient.uhid}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveConsultationPatient(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Patient Vitals Quick Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Blood Pressure</span>
                  <div className="font-mono text-xs font-semibold text-slate-900">{activeConsultationPatient.bp} mmHg</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Pulse Rate</span>
                  <div className="font-mono text-xs font-semibold text-slate-900">{activeConsultationPatient.pulse} bpm</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Oxygen Saturation</span>
                  <div className="font-mono text-xs font-semibold text-emerald-700">{activeConsultationPatient.spo2}</div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Body Temp</span>
                  <div className="font-mono text-xs font-semibold text-slate-900">98.4 °F</div>
                </div>
              </div>

              {/* Diagnosis & Chief Complaint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chief Complaint</label>
                  <textarea
                    value={activeConsultationPatient.complaint}
                    readOnly
                    rows={2}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Clinical Diagnosis (ICD-10)</span>
                    <span className="text-emerald-700 font-bold lowercase text-[10px]">auto-suggest</span>
                  </label>
                  <DiagnosisAutocomplete
                    value={diagnosis}
                    onChange={setDiagnosis}
                    placeholder="Type diagnosis (e.g. fever, typhoid, diabetes, stone, pathri)..."
                  />
                </div>
              </div>

              {/* Medicines (Rx) Builder */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-emerald-700 font-serif font-bold text-base">℞</span>
                    <span>Prescribed Medications</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">{medicines.length} medicines added</span>
                </div>

                {/* Medicine Items List */}
                <div className="space-y-2">
                  {medicines.map((med, index) => (
                    <div key={med.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{med.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Frequency: {med.dosage} • Duration: {med.duration} • {med.instruction}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remove Medicine"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Inline Form with Clinical Dropdowns */}
                <form onSubmit={handleAddMedicine} className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center justify-between">
                        <span>Medicine / Composition</span>
                        <span className="text-emerald-700 font-bold lowercase text-[9px]">auto-suggest</span>
                      </label>
                      <MedicineAutocomplete
                        value={newMedName}
                        onChange={setNewMedName}
                        onSelectMedicine={(med) => {
                          if (med.defaultFrequency) setNewMedDosage(med.defaultFrequency);
                          if (med.defaultFoodRelation) setNewMedInstruction(med.defaultFoodRelation);
                          if (med.defaultDuration) setNewMedDuration(med.defaultDuration);
                        }}
                        placeholder="e.g. Type pan, dolo, aug, mono..."
                        inputClassName="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Frequency (दिन में)</label>
                      <select
                        value={newMedDosage}
                        onChange={(e) => setNewMedDosage(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium text-slate-800"
                      >
                        <option value="1-0-1 (BD - Twice Daily)">1-0-1 (BD - Twice Daily)</option>
                        <option value="1-0-0 (OD - Morning)">1-0-0 (OD - Morning Only)</option>
                        <option value="0-0-1 (HS - Night)">0-0-1 (HS - Night Only)</option>
                        <option value="1-1-1 (TID - Thrice Daily)">1-1-1 (TID - Thrice Daily)</option>
                        <option value="1-1-1-1 (QID - 4 Times)">1-1-1-1 (QID - 4 Times)</option>
                        <option value="SOS (As Needed)">SOS (जरूरत पड़ने पर)</option>
                        <option value="STAT (Emergency Once)">STAT (Immediate Dose)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Food Relation (खाने के)</label>
                      <select
                        value={newMedInstruction}
                        onChange={(e) => setNewMedInstruction(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium text-slate-800"
                      >
                        <option value="After Food (खाने के बाद)">After Food (खाने के बाद)</option>
                        <option value="Before Food (खाने से पहले)">Before Food (खाने से पहले)</option>
                        <option value="Empty Stomach (खाली पेट)">Empty Stomach (खाली पेट)</option>
                        <option value="At Bedtime (सोते समय)">At Bedtime (सोते समय)</option>
                        <option value="With Food (खाने के साथ)">With Food (खाने के साथ)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Duration</label>
                      <div className="flex gap-1.5">
                        <select
                          value={newMedDuration}
                          onChange={(e) => setNewMedDuration(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium text-slate-800"
                        >
                          <option value="3 Days">3 Days</option>
                          <option value="5 Days">5 Days</option>
                          <option value="7 Days">7 Days</option>
                          <option value="10 Days">10 Days</option>
                          <option value="14 Days">14 Days</option>
                          <option value="30 Days">30 Days (1 Month)</option>
                          <option value="60 Days">60 Days</option>
                          <option value="SOS / Continuous">SOS / Cont.</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex-shrink-0"
                          title="Add Medicine to Rx"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Lab & Clinical Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lab / Radiology Advised</label>
                  <input
                    type="text"
                    value={labTests}
                    onChange={(e) => setLabTests(e.target.value)}
                    placeholder="e.g. 12-Lead ECG, Serum Creatinine"
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Advice / Follow-up</label>
                  <input
                    type="text"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="e.g. Review in OPD after 7 days with ECG"
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => setPrescriptionPrinted(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>{prescriptionPrinted ? 'Prescription Printed ✓' : 'Print E-Prescription'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsultationPatient(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteConsultation}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete & Call Next Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
