import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Pill, 
  Activity, 
  User, 
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Users,
  Search,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Filter,
  Building2,
  BookOpen,
  FileText
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuthUser } from '../../../hooks/useAuthUser';


export interface ObservationRecord {
  id: string;
  date: string;
  time: string;
  pulse: string;
  bp: string;
  temp: string;
  spo2: string;
  rbs: string;
  urine: string;
  drain: string;
  painScore: string;
  addedBy: string;
}

export interface MedicationScheduleRecord {
  id: string;
  scheduledDate: string;
  time: string;
  medication: string;
  type: string;
  dose: string;
  prescribedBy: string;
  status: 'GIVEN' | 'PENDING' | 'OVERDUE';
  action: string;
  doneBy?: string;
  doneTime?: string;
}

export interface PatientClinicalDetails {
  id: string;
  name: string;
  uhid?: string;
  gender: string;
  age: number | string;
  type: 'IPD' | 'OPD' | string;
  status: string;
  bedNo: string;
  ward: string;
  guardian?: string;
  doctor?: string;
  diagnosis?: string;
  observations: ObservationRecord[];
  medications: MedicationScheduleRecord[];
}

export interface StaffNotesViewProps {
  initialPatientName?: string;
  initialBedNo?: string;
  patient?: any | null;
  allPatients?: any[];
  onBack?: () => void;
}

// Module-level cache for instant Daily Notes viewing across tabs
let cachedRosterMemory: PatientClinicalDetails[] = [];

export const StaffNotesView: React.FC<StaffNotesViewProps> = ({
  initialPatientName,
  initialBedNo,
  patient,
  allPatients,
  onBack,
}) => {
  // Master state of all patients — starts empty and is filled only with live DB records
  const currentUser = useAuthUser();
  const staffName = currentUser?.name?.trim() || '';
  const [patientsRoster, setPatientsRoster] = useState<PatientClinicalDetails[]>(() => {
    const activeCached = cachedRosterMemory.filter(p => String(p.status || '').toLowerCase() !== 'discharged');
    if (activeCached.length > 0) return activeCached;
    return (allPatients || [])
      .filter(ext => String(ext.status || '').toLowerCase() !== 'discharged')
      .map(ext => ({
        id: ext.id || `P-${Date.now()}`,
        name: ext.name,
        gender: ext.gender === 'F' ? 'F' : 'M',
        age: ext.age || 0,
        type: ext.type || 'IPD',
        status: ext.status || 'Admitted',
        bedNo: ext.bedNo || ext.bed || '—',
        ward: ext.ward || '—',
        guardian: ext.guardian || '',
        diagnosis: ext.condition || ext.diagnosis || '—',
        observations: [],
        medications: [],
      }));
  });
  const [isLoadingRoster, setIsLoadingRoster] = useState(() => cachedRosterMemory.length === 0 && (!allPatients || allPatients.length === 0));
  const [rosterError, setRosterError] = useState<string | null>(null);

  useEffect(() => {
    if (patientsRoster.length > 0) {
      cachedRosterMemory = patientsRoster;
    }
  }, [patientsRoster]);

  // Current view: 'list' (shows all patients) OR 'detail' (shows tapped patient's specific chart)
  const [activeView, setActiveView] = useState<'list' | 'detail'>(() => {
    // If specific patient is passed explicitly from parent, open detail view
    if (patient && (patient.id || patient.name)) {
      return 'detail';
    }
    return 'list'; // Default to list so user sees everyone first
  });

  // Currently selected patient ID (resolved once the live roster arrives)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patient?.id || '');

  // Fetch real patients from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    api.patients.getAll().then((res) => {
      if (!isMounted) return;
      if (!res?.success || !Array.isArray(res.patients)) {
        throw new Error('Unable to load patient roster');
      }

      // Daily Notes & Clinical Observations are strictly for currently active/admitted patients
      const activePatients = res.patients.filter((dbP: any) => {
        const s = String(dbP.status || '').toLowerCase().trim();
        return s !== 'discharged';
      });

      const loaded: PatientClinicalDetails[] = activePatients.map((dbP: any) => ({
        id: dbP.patient_id || dbP._id,
        name: dbP.name || 'Patient',
        gender: dbP.gender === 'Female' || dbP.gender === 'F' ? 'F' : 'M',
        age: dbP.age || 0,
        type: dbP.patient_type || dbP.type || 'IPD',
        status: dbP.status || 'Admitted',
        bedNo: dbP.bed_no || '—',
        ward: dbP.ward_type || '—',
        guardian: dbP.guardian_name || '',
        diagnosis: dbP.problem || dbP.diagnosis || '—',
        // Real observations / medication schedule arrive from the notes endpoint below
        observations: [],
        medications: [],
      }));

      setPatientsRoster(loaded);
      setRosterError(null);

      setSelectedPatientId(prevId => {
        if (prevId && loaded.some(p => p.id === prevId)) return prevId;
        if (patient?.name) {
          const byName = loaded.find(p => p.name.toLowerCase() === patient.name.toLowerCase());
          if (byName) return byName.id;
        }
        return loaded[0]?.id || '';
      });
    }).catch((err: any) => {
      if (!isMounted) return;
      setRosterError(err?.message || 'Unable to load patient roster');
    }).finally(() => {
      if (isMounted) setIsLoadingRoster(false);
    });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real clinical daily notes for active patient — these are the ONLY observations shown
  useEffect(() => {
    if (!selectedPatientId) return;
    api.notes.getByPatient(selectedPatientId).then(res => {
      if (!res?.success || !Array.isArray(res.notes)) return;

      const mappedObs: ObservationRecord[] = res.notes.map(n => ({
        id: n._id || n.id,
        date: n.date || new Date(n.createdAt || Date.now()).toISOString().slice(0, 10),
        time: n.time || '—',
        pulse: String(n.vitals?.pulse ?? n.pulse ?? '—'),
        bp: n.vitals?.bp || n.bp || '—',
        temp: String(n.vitals?.temp ?? n.temp ?? '—'),
        spo2: String(n.vitals?.spo2 ?? n.spo2 ?? '—'),
        rbs: String(n.rbs ?? '—'),
        urine: n.urine || '-',
        drain: n.drain || '-',
        painScore: n.painScore || '-',
        addedBy: n.addedBy || n.doctor_name || '—'
      }));

      setPatientsRoster(prev => prev.map(p => {
        if (p.id !== selectedPatientId) return p;
        // Keep entries the nurse just added in this session (not yet saved server-side)
        const pendingLocal = p.observations.filter(o => String(o.id).startsWith('obs-local'));
        return { ...p, observations: [...mappedObs, ...pendingLocal] };
      }));
    }).catch(() => {});
  }, [selectedPatientId]);

  // List view search & filter
  const [rosterSearch, setRosterSearch] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('All');

  // Detail view dropdown open state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  // Active patient object (undefined until the live roster arrives / when empty)
  const activePatient = patientsRoster.find(p => p.id === selectedPatientId) || patientsRoster[0];

  const patientName = activePatient?.name ?? '';
  const patientId = activePatient?.id ?? '';
  const patientGender = activePatient?.gender === 'F' ? 'Female' : 'Male';
  const patientAge = activePatient?.age ?? 0;
  const patientWard = activePatient?.ward ?? '';
  const patientBed = activePatient?.bedNo ?? '';
  const patientStatus = activePatient?.status ?? '';
  const initial = (patientName?.trim()[0] || '').toUpperCase();
  const showDetail = activeView === 'detail' && !!activePatient;

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [isAddObservationOpen, setIsAddObservationOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);

  // Add Observation Form State (vitals start blank so staff must enter real readings)
  const [obsDate, setObsDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [obsTime, setObsTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [obsPulse, setObsPulse] = useState('');
  const [obsBp, setObsBp] = useState('');
  const [obsTemp, setObsTemp] = useState('');
  const [obsSpo2, setObsSpo2] = useState('');
  const [obsRbs, setObsRbs] = useState('');
  const [obsUrine, setObsUrine] = useState('-');
  const [obsDrain, setObsDrain] = useState('-');
  const [obsPainScore, setObsPainScore] = useState('-');
  const [obsAddedBy, setObsAddedBy] = useState(staffName);

  // Add Medication Form State
  const [medDate, setMedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [medTime, setMedTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [medName, setMedName] = useState('');
  const [medType, setMedType] = useState('Injection');
  const [medDose, setMedDose] = useState('');
  const [medPrescribedBy, setMedPrescribedBy] = useState('');
  const [medStatus, setMedStatus] = useState<'GIVEN' | 'PENDING'>('GIVEN');
  const [medDoneBy, setMedDoneBy] = useState(staffName);

  // When patient prop changes from parent
  useEffect(() => {
    if (patient?.id) {
      setSelectedPatientId(patient.id);
      setActiveView('detail');
    } else if (patient?.name) {
      const match = patientsRoster.find(p => p.name.toLowerCase() === patient.name.toLowerCase());
      if (match) {
        setSelectedPatientId(match.id);
        setActiveView('detail');
      }
    }
  }, [patient]);

  // Handler to tap on a patient and show their specific details
  const handleSelectPatientForDetails = (pId: string) => {
    setSelectedPatientId(pId);
    setActiveView('detail');
    const p = patientsRoster.find(item => item.id === pId);
    if (p) {
      showToast(`${p.name} का क्लिनिकल चार्ट व नोट्स खोले गए`);
    }
  };

  // Submit Observation
  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsPulse || !obsBp) {
      showToast('कृपया Pulse और BP का मान दर्ज करें!');
      return;
    }

    const newObs: ObservationRecord = {
      id: `obs-local-${Date.now()}`,
      date: obsDate,
      time: obsTime,
      pulse: obsPulse,
      bp: obsBp,
      temp: obsTemp,
      spo2: obsSpo2,
      rbs: obsRbs,
      urine: obsUrine,
      drain: obsDrain,
      painScore: obsPainScore,
      addedBy: obsAddedBy.trim() || staffName || '—'
    };

    setPatientsRoster(prev =>
      prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            observations: [newObs, ...p.observations]
          };
        }
        return p;
      })
    );

    // Persist note to MongoDB Atlas backend
    api.notes.create(selectedPatientId, {
      patient_id: selectedPatientId,
      date: obsDate,
      time: obsTime,
      pulse: obsPulse,
      bp: obsBp,
      temp: obsTemp,
      spo2: obsSpo2,
      rbs: obsRbs,
      urine: obsUrine,
      drain: obsDrain,
      painScore: obsPainScore,
      addedBy: obsAddedBy.trim() || staffName || '—',
      note_type: 'Nursing Observation',
      content: `Vitals recorded: BP: ${obsBp}, Pulse: ${obsPulse}, Temp: ${obsTemp}°F, SpO2: ${obsSpo2}%, RBS: ${obsRbs}`,
      vitals: {
        bp: obsBp,
        pulse: Number(obsPulse) || 72,
        temp: Number(obsTemp) || 98.6,
        spo2: Number(obsSpo2) || 99
      }
    }).catch(err => {
      console.warn('Note backend save notice:', err?.message || err);
    });

    setIsAddObservationOpen(false);
    showToast(`${patientName} के लिए Observation सफलतापूर्वक दर्ज कर दिया गया!`);
  };

  // Submit Medication
  const handleSaveMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      showToast('कृपया दवाई का नाम दर्ज करें!');
      return;
    }

    const currentFormattedTime = `${medDate} ${medTime}`;
    const newMed: MedicationScheduleRecord = {
      id: `med-${Date.now()}`,
      scheduledDate: medDate,
      time: medTime,
      medication: medName,
      type: medType,
      dose: medDose || '1 Dose',
      prescribedBy: medPrescribedBy,
      status: medStatus,
      action: medStatus === 'GIVEN' ? 'Done' : 'Pending',
      doneBy: medStatus === 'GIVEN' ? (medDoneBy.trim() || staffName || '—') : undefined,
      doneTime: medStatus === 'GIVEN' ? currentFormattedTime : undefined
    };

    setPatientsRoster(prev =>
      prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            medications: [newMed, ...p.medications]
          };
        }
        return p;
      })
    );

    setIsAddMedicationOpen(false);
    setMedName('');
    setMedDose('');
    showToast(`${patientName} के लिए दवाई (${newMed.medication}) जोड़ दी गई!`);
  };

  // Toggle or Mark Medication as Given
  const handleToggleMedStatus = (medId: string) => {
    setPatientsRoster(prev =>
      prev.map(p => {
        if (p.id === selectedPatientId) {
          return {
            ...p,
            medications: p.medications.map(m => {
              if (m.id === medId && m.status === 'PENDING') {
                const now = new Date();
                const timeStr = `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                return {
                  ...m,
                  status: 'GIVEN',
                  action: 'Done',
                  doneBy: staffName || '—',
                  doneTime: timeStr
                };
              }
              return m;
            })
          };
        }
        return p;
      })
    );
    showToast('Medication status updated to GIVEN ✓');
  };

  // Filtered patients for list view
  const filteredRosterForList = useMemo(() => {
    return patientsRoster.filter(p => {
      const q = rosterSearch.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.bedNo.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q));

      const matchesWard = 
        selectedWardFilter === 'All' ||
        (selectedWardFilter === 'Male Ward' && p.ward.includes('Male')) ||
        (selectedWardFilter === 'Female Ward' && p.ward.includes('Female')) ||
        (selectedWardFilter === 'ICU' && (p.ward.includes('ICU') || p.status.includes('ICU'))) ||
        (selectedWardFilter === 'Emergency' && p.ward.includes('Emergency'));

      return matchesSearch && matchesWard;
    });
  }, [patientsRoster, rosterSearch, selectedWardFilter]);

  // Pagination State for Daily Notes List View (7 patients per screen, then Next button)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 7;

  // Reset pagination to page 1 whenever search query or ward filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rosterSearch, selectedWardFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRosterForList.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRosterForList.length);
  const paginatedRoster = filteredRosterForList.slice(startIndex, startIndex + pageSize);

  // Filtered patient list for dropdown search (active in-hospital only)
  const filteredRoster = patientsRoster
    .filter(p => String(p.status || '').toLowerCase() !== 'discharged')
    .filter(p =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.bedNo.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.ward.toLowerCase().includes(patientSearch.toLowerCase())
    );

  return (
    <div className="w-full space-y-4 pb-12 animate-fadeIn font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ALL PATIENTS LIST VIEW ("sabaki list dikhaye")                        */}
      {/* ========================================================================= */}
      {activeView === 'list' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Banner Header */}
          <div className="bg-white rounded-xl p-3.5 sm:px-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <HeartPulse className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Clinical Notes &amp; Observations
                  </h1>
                  <span className="px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                    {patientsRoster.length} Admitted Patients
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Back to main patients if prop passed */}
            {onBack && (
              <button
                onClick={onBack}
                className="self-start md:self-auto px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>

          {/* Search & Ward Filter Bar */}
          <div className="bg-white rounded-xl p-2.5 sm:px-3 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient by name, bed, ward or ID..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              {rosterSearch && (
                <button
                  onClick={() => setRosterSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ward Filter Pills in Segmented Tab Style */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 overflow-x-auto">
              {['All', 'Male Ward', 'Female Ward', 'ICU', 'Emergency'].map((ward) => (
                <button
                  key={ward}
                  onClick={() => setSelectedWardFilter(ward)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedWardFilter === ward
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {ward}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Roster Table — High-Density B2B SaaS Design */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4">PATIENT</th>
                    <th className="py-2.5 px-4">AGE / GENDER</th>
                    <th className="py-2.5 px-4">WARD &amp; BED</th>
                    <th className="py-2.5 px-4">DOCTOR</th>
                    <th className="py-2.5 px-4">STATUS</th>
                    <th className="py-2.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRoster.length > 0 ? (
                    paginatedRoster.map((p) => {
                      const initialLetter = (p.name.trim()[0] || 'P').toUpperCase();
                      const isAdmitted = p.status.toLowerCase().includes('admitted') || p.status.toLowerCase().includes('ipd');
                      const isICU = p.status.toLowerCase().includes('icu');
                      const isEmergency = p.status.toLowerCase().includes('emergency');

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* PATIENT column */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                                p.gender === 'F'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {initialLetter}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {p.name}
                                  </span>
                                  <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                                    p.type === 'IPD'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  }`}>
                                    {p.type}
                                  </span>
                                </div>
                                <span className="text-[10.5px] text-slate-400 font-mono font-medium block">
                                  {p.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* AGE / GENDER column */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className="text-xs font-semibold text-slate-700">
                              {p.age} yrs / {p.gender === 'F' ? 'Female' : 'Male'}
                            </span>
                          </td>

                          {/* WARD & BED column */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="text-xs font-semibold text-slate-800 block">
                                  {p.ward}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 mt-0.5 inline-block">
                                  Bed: {p.bedNo}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* DOCTOR column */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-slate-600">
                              {p.doctor || 'Duty Doctor'}
                            </span>
                          </td>

                          {/* STATUS column */}
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isICU
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : isEmergency
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isICU ? 'bg-rose-500' : isEmergency ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {isICU ? 'ICU' : isEmergency ? 'Emergency' : 'Admitted'}
                            </span>
                          </td>

                          {/* ACTIONS column */}
                          <td className="py-2.5 px-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPatientForDetails(p.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Open Notes</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className={`w-8 h-8 ${isLoadingRoster ? 'text-indigo-300 animate-pulse' : 'text-slate-300'}`} />
                          {isLoadingRoster ? (
                            <p className="text-slate-400 text-xs font-semibold">Loading patient roster from database...</p>
                          ) : rosterError ? (
                            <p className="text-rose-500 text-xs font-semibold">{rosterError}</p>
                          ) : patientsRoster.length === 0 ? (
                            <>
                              <p className="text-slate-400 text-xs font-semibold">No admitted patients in the database yet</p>
                              <p className="text-slate-300 text-[11px]">Admissions created at reception will show up here automatically.</p>
                            </>
                          ) : (
                            <p className="text-slate-400 text-xs font-semibold">No patients matching your search criteria.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination & Next Button */}
            <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <p>
                Showing <span className="font-bold text-slate-900">{filteredRosterForList.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{filteredRosterForList.length}</span> admitted patients
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className={`px-2.5 py-1 rounded-lg border font-bold text-xs transition-all shadow-2xs flex items-center gap-1 ${
                    safeCurrentPage === 1
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      safeCurrentPage === pageNum
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border font-bold text-xs transition-all shadow-2xs flex items-center gap-1 ${
                    safeCurrentPage === totalPages
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 cursor-pointer active:scale-95 shadow-xs'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 2. SPECIFIC PATIENT NOTES DETAIL VIEW ("jab tap kare tab specific dikhaye") */}
      {/* ========================================================================= */}
      {activeView === 'detail' && !activePatient && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xs text-center">
            {isLoadingRoster ? (
              <p className="text-slate-500 text-xs font-semibold">Loading patient chart from database...</p>
            ) : rosterError ? (
              <p className="text-rose-500 text-xs font-semibold">{rosterError}</p>
            ) : (
              <>
                <p className="text-slate-500 text-xs font-semibold">No patient selected</p>
              </>
            )}
            <button
              onClick={() => setActiveView('list')}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Back to Patients List
            </button>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="space-y-4 animate-fadeIn">
          {/* 1. TOP PATIENT HEADER BANNER (Clean, Professional Clinical Card) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Side: Back button + Avatar + Patient Info & Dropdown Switcher */}
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
              {/* Back Button to All Patients List */}
              <button
                onClick={() => setActiveView('list')}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold text-xs sm:text-sm transition-all cursor-pointer group bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Patients List (सभी मरीज)</span>
              </button>

              {/* Subtle Divider */}
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

              {/* Patient Avatar & Title Details */}
              <div className="flex items-center gap-3.5 relative">
                {/* Avatar Badge */}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-sm ring-2 ring-blue-100/80 shrink-0">
                  {initial}
                </div>

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {patientName}
                    </h2>

                    {/* Status Badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-emerald-200/80 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {patientStatus}
                    </span>

                    {/* Patient Switcher Dropdown Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200/90 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Click to switch patient"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>मरीज बदलें ({patientsRoster.length})</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 animate-fadeIn">
                          <div className="p-2 border-b border-slate-100">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search patient, bed or ID..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-semibold"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 p-1">
                            {filteredRoster.map((p) => {
                              const isCur = p.id === selectedPatientId;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatientId(p.id);
                                    setIsDropdownOpen(false);
                                    setPatientSearch('');
                                    showToast(`Switched to patient: ${p.name}`);
                                  }}
                                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                    isCur ? 'bg-blue-50/90 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                      isCur ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                      {(p.name[0] || 'P').toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                      <p className="text-xs font-bold truncate">{p.name}</p>
                                      <p className="text-[10px] text-slate-400 font-medium">Bed: {p.bedNo} • {p.ward}</p>
                                    </div>
                                  </div>

                                  {isCur && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitle Details: ID | Gender, Age yrs | Ward | Bed */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                    <span className="font-mono text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                      ID: {patientId}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{patientGender}, {patientAge} yrs</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {patientWard}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                      <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                      Bed: {patientBed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: + Add Observation Button */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                onClick={() => setIsAddObservationOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Observation</span>
              </button>
            </div>
          </div>

          {/* 2. SECTION 1: OBSERVATIONS / VITALS TABLE (Clean Clinical Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header Title Bar */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Vital Signs &amp; Daily Observations (दैनिक जाँच)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Recorded clinical assessments, pulse, blood pressure &amp; vitals
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
                {activePatient.observations?.length || 0} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Pulse</th>
                    <th className="py-3 px-4">BP</th>
                    <th className="py-3 px-4">Temp</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">RBS</th>
                    <th className="py-3 px-4">Urine (ml)</th>
                    <th className="py-3 px-4">Drain (ml)</th>
                    <th className="py-3 px-4">Pain Score</th>
                    <th className="py-3 px-5">Added By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {activePatient.observations && activePatient.observations.length > 0 ? (
                    activePatient.observations.map((obs) => (
                      <tr key={obs.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 whitespace-nowrap text-slate-900 font-semibold">{obs.date}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">{obs.time}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          <span className={Number(obs.pulse) > 100 ? "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200" : ""}>
                            {obs.pulse} bpm
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold font-mono text-slate-800">
                          <span className={obs.bp.startsWith('15') || obs.bp.startsWith('16') ? "text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200" : ""}>
                            {obs.bp}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 font-mono">{obs.temp}°F</td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700 font-mono">
                          <span className={Number(obs.spo2) < 95 ? "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200" : ""}>
                            {obs.spo2}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">{obs.rbs || '—'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">{obs.urine || '—'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">{obs.drain || '—'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono">{obs.painScore || '—'}</td>
                        <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-700">{obs.addedBy}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                            <Activity className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-600">No observations recorded yet for {patientName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;+ Add Observation&apos; above to record patient vitals.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. SECTION 2: MEDICATION SCHEDULE (Clean Clinical Card) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header Title Bar */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center">
                  <Pill className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Medication Schedule &amp; Nursing Chart (दवाइयों का शेड्यूल)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Scheduled medicine administration, prescribed dosages &amp; status tracking
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddMedicationOpen(true)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Medication</span>
              </button>
            </div>

            {/* Medication Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Scheduled Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Medication (Type)</th>
                    <th className="py-3 px-4">Dose</th>
                    <th className="py-3 px-4">Prescribed By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-5">Done Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                  {activePatient.medications && activePatient.medications.length > 0 ? (
                    activePatient.medications.map((med) => (
                      <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 whitespace-nowrap text-slate-900 font-semibold">
                          {med.scheduledDate}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                          {med.time}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-bold text-slate-900 block">{med.medication}</span>
                            <span className="text-[11px] text-slate-400 font-medium">({med.type})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800 font-mono">
                          {med.dose}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium">
                            {med.prescribedBy}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {med.status === 'GIVEN' ? (
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold tracking-wide border border-emerald-200/80 shadow-2xs">
                              GIVEN
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold tracking-wide border border-amber-200/80 shadow-2xs">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {med.status === 'GIVEN' ? (
                            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Done</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleMedStatus(med.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                            >
                              Give Now
                            </button>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap text-xs">
                          {med.doneBy ? (
                            <div>
                              <span className="font-semibold text-slate-800 block">{med.doneBy}</span>
                              <span className="text-slate-400 font-mono text-[11px] block">{med.doneTime}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                            <Pill className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-600">No medications scheduled yet for {patientName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;+ Add Medication&apos; to create a prescription dosage schedule.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD OBSERVATION & VITALS */}
      {isAddObservationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/70 animate-scaleUp max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Add Observation &amp; Vitals
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAddObservationOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveObservation} className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-xl font-semibold text-emerald-900 text-xs">
                Recording vitals observation for <strong>{patientName}</strong> (Bed: {patientBed} • {patientWard})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={obsDate}
                    onChange={(e) => setObsDate(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={obsTime}
                    onChange={(e) => setObsTime(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Pulse (bpm) *
                  </label>
                  <input
                    type="text"
                    value={obsPulse}
                    onChange={(e) => setObsPulse(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="89"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    BP (mmHg) *
                  </label>
                  <input
                    type="text"
                    value={obsBp}
                    onChange={(e) => setObsBp(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="120/89"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Temp (°F)
                  </label>
                  <input
                    type="text"
                    value={obsTemp}
                    onChange={(e) => setObsTemp(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="98.6"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    SpO2 (%)
                  </label>
                  <input
                    type="text"
                    value={obsSpo2}
                    onChange={(e) => setObsSpo2(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="89"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    RBS (mg/dL)
                  </label>
                  <input
                    type="text"
                    value={obsRbs}
                    onChange={(e) => setObsRbs(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="110"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Urine (ml)
                  </label>
                  <input
                    type="text"
                    value={obsUrine}
                    onChange={(e) => setObsUrine(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="-"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Drain (ml)
                  </label>
                  <input
                    type="text"
                    value={obsDrain}
                    onChange={(e) => setObsDrain(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="-"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Pain Score (0-10)
                  </label>
                  <input
                    type="text"
                    value={obsPainScore}
                    onChange={(e) => setObsPainScore(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="-"
                  />
                </div>
              </div>

              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                  Added By (Nurse / Staff Name) *
                </label>
                <input
                  type="text"
                  value={obsAddedBy}
                  onChange={(e) => setObsAddedBy(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder={staffName || 'Nurse / staff name'}
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddObservationOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Observation (सहेजें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MEDICATION TO SCHEDULE */}
      {isAddMedicationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/70 animate-scaleUp max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Pill className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Add Medication to Schedule
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMedicationOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMedication} className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="p-3 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl font-semibold text-blue-900 text-xs">
                Schedule dose for <strong>{patientName}</strong> (Bed: {patientBed})
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    value={medDate}
                    onChange={(e) => setMedDate(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="col-span-2 relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="e.g. Ceftriaxone or 45"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Type
                  </label>
                  <select
                    value={medType}
                    onChange={(e) => setMedType(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                  >
                    <option value="Injection">Injection</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Capsule">Capsule</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Dose (मात्रा) *
                  </label>
                  <input
                    type="text"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="e.g. 23 or 1g"
                    required
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Prescribed By
                  </label>
                  <input
                    type="text"
                    value={medPrescribedBy}
                    onChange={(e) => setMedPrescribedBy(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="Dr. Deepak Kumar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Status
                  </label>
                  <select
                    value={medStatus}
                    onChange={(e) => setMedStatus(e.target.value as any)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                  >
                    <option value="GIVEN">GIVEN (दिया गया)</option>
                    <option value="PENDING">PENDING (बाकी)</option>
                  </select>
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600">
                    Administered By
                  </label>
                  <input
                    type="text"
                    value={medDoneBy}
                    onChange={(e) => setMedDoneBy(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder={staffName || 'Nurse / staff name'}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMedicationOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Medication (शेड्यूल जोड़ें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
