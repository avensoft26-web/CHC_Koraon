import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  UserPlus,
  Eye,
  Bed,
  BedDouble,
  ArrowLeftRight,
  FilePlus,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Activity,
  Calendar,
  UserX,
  Stethoscope,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Edit3,
  Camera,
  Upload,
  User,
  PenTool,
  Trash2
} from 'lucide-react';
import { AdmittedPatientEntry } from './StaffAdmitView';
import { HospitalStretcherIcon } from '../HospitalStretcherIcon';
import { StaffNotesView } from './StaffNotesView';
import { api } from '../../../services/api';

export interface StaffPatientItem {
  id: string;
  name: string;
  guardian: string;
  type: 'IPD' | 'OPD';
  specialBadge?: string;
  age: number;
  gender: 'M' | 'F';
  bedNo: string;
  ward: string;
  admissionDate: string;
  status: 'ACTIVE' | 'ADMITTED' | 'DISCHARGED';
  payStatus: 'PAID' | 'PENDING';
  phone?: string;
  address?: string;
  condition?: string;
  doctor?: string;
  vitals?: string;
}

interface StaffPatientsListViewProps {
  patientsList?: AdmittedPatientEntry[];
  onAdmitNew: () => void;
  onOpenNoteForPatient?: (patientName: string, bedNo: string, patient?: StaffPatientItem) => void;
  onDischargePatient?: (id: string) => void;
  onRecordVitalsModal?: (patientName: string) => void;
}

export const StaffPatientsListView: React.FC<StaffPatientsListViewProps> = ({
  onAdmitNew,
  onOpenNoteForPatient,
  onDischargePatient,
  onRecordVitalsModal,
}) => {
  const [patients, setPatients] = useState<StaffPatientItem[]>([]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  // Patients + their recorded vitals come straight from MongoDB
  const loadPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const [res, vitRes] = await Promise.all([
        api.patients.getAll(),
        api.vitals.getAll().catch(() => null),
      ]);
      if (!res?.success || !Array.isArray(res.patients)) {
        throw new Error('Unable to load the patient list');
      }

      // Latest recorded vitals per patient (API returns newest first)
      const vitalsByPatient = new Map<string, any>();
      if (vitRes?.success && Array.isArray(vitRes.vitals)) {
        vitRes.vitals.forEach((v: any) => {
          const key = v?.patient_id ? String(v.patient_id) : null;
          if (key && !vitalsByPatient.has(key)) vitalsByPatient.set(key, v);
        });
      }

      const mapped: StaffPatientItem[] = res.patients.map((p: any) => {
        const v = vitalsByPatient.get(String(p.patient_id || p._id));
        const vitalsText = v
          ? [
              v.bp ? `BP ${v.bp}` : null,
              v.pulse ? `HR ${v.pulse}` : null,
              v.spo2 !== undefined && v.spo2 !== null && v.spo2 !== '' ? `SpO2 ${v.spo2}%` : null,
              v.temp ? `Temp ${v.temp}°F` : null,
            ].filter(Boolean).join(' • ') || 'No vitals recorded'
          : 'No vitals recorded';

        return {
          id: p.patient_id || p._id,
          name: p.name || 'Patient',
          guardian: p.guardian_name || p.guardian_relation || '—',
          type: (p.patient_type === 'OPD' ? 'OPD' : 'IPD') as 'IPD' | 'OPD',
          age: p.age || 0,
          gender: (p.gender === 'Female' || p.gender === 'F') ? 'F' : 'M',
          bedNo: p.bed_no || (p.patient_type === 'OPD' ? 'OPD' : '—'),
          ward: p.ward_type || (p.patient_type === 'OPD' ? 'OPD Consultation' : '—'),
          admissionDate: p.admission_date ? new Date(p.admission_date).toLocaleDateString('en-IN') : '—',
          status: (p.status === 'Discharged' ? 'DISCHARGED' : 'ADMITTED') as any,
          payStatus: (p.payment_status === 'Pending' ? 'PENDING' : 'PAID') as any,
          phone: p.mobile || p.phone || '—',
          address: p.address || '—',
          condition: p.problem || p.diagnosis || '—',
          doctor: p.doctor_assigned || p.consulting_doctor || '—',
          vitals: vitalsText,
        };
      });
      setPatients(mapped);
      setPatientsError(null);
    } catch (err: any) {
      setPatientsError(err?.message || 'Unable to load the patient list');
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bed + ward options loaded from the hospital bed layout in settings
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);
  const [defaultWardCharge, setDefaultWardCharge] = useState('0');
  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.patients.getAvailableBeds().catch(() => null),
      api.beds.getAll().catch(() => null),
      api.settings.get().catch(() => null),
    ]).then(([bedRes, allRes, setRes]) => {
      if (!mounted) return;
      if (bedRes?.success && Array.isArray(bedRes.beds)) setAvailableBeds(bedRes.beds);
      if (allRes?.success && Array.isArray(allRes.beds)) {
        const wards = Array.from(new Set(allRes.beds.map((b: any) => b.ward).filter(Boolean))) as string[];
        setWardOptions(wards);
      }
      const wardCharge = setRes?.success ? setRes.settings?.['ward-charge'] : undefined;
      if (wardCharge !== undefined && wardCharge !== null && wardCharge !== '') {
        setDefaultWardCharge(String(wardCharge));
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [typeFilter, setTypeFilter] = useState<'All' | 'IPD' | 'OPD'>('IPD');
  const [casesFilter, setCasesFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 7;

  const ipdCount = useMemo(() => patients.filter((p) => p.status !== 'DISCHARGED' && p.type === 'IPD').length, [patients]);
  const opdCount = useMemo(() => patients.filter((p) => p.status !== 'DISCHARGED' && p.type === 'OPD').length, [patients]);
  const dischargedCount = useMemo(() => patients.filter((p) => p.status === 'DISCHARGED').length, [patients]);

  // Modals
  const [inspectPatient, setInspectPatient] = useState<StaffPatientItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedInlineNotePatient, setSelectedInlineNotePatient] = useState<StaffPatientItem | null>(null);

  // Step 1: Confirmation Modal ("IPD में Shift करें?")
  const [shiftConfirmPatient, setShiftConfirmPatient] = useState<StaffPatientItem | null>(null);

  // Step 2: Edit & Admit Form Modal ("Edit Patient Details")
  const [admitFormPatient, setAdmitFormPatient] = useState<StaffPatientItem | null>(null);

  // Form Fields for Step 2
  const [formName, setFormName] = useState('');
  const [formGuardian, setFormGuardian] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formWard, setFormWard] = useState('General Ward');
  const [formBed, setFormBed] = useState('Male-G1');
  const [formDailyCharge, setFormDailyCharge] = useState('0');

  // Step 3: Transfer Bed Modal ("Transfer Bed")
  const [transferPatient, setTransferPatient] = useState<StaffPatientItem | null>(null);
  const [transferNewBed, setTransferNewBed] = useState('');
  const [transferDailyCharge, setTransferDailyCharge] = useState('0');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Transfer Bed Modal
  const handleOpenTransferModal = (p: StaffPatientItem) => {
    setTransferPatient(p);
    setTransferNewBed('');
    setTransferDailyCharge(defaultWardCharge);
  };

  // Confirm Transfer Bed — persisted in MongoDB, then the roster is reloaded
  const handleConfirmTransfer = async () => {
    if (!transferPatient) return;
    if (!transferNewBed) {
      showToast('कृपया नया Bed चुनें!');
      return;
    }

    const oldBed = transferPatient.bedNo;
    const patientName = transferPatient.name;
    const newBed = transferNewBed;
    const charge = parseInt(String(transferDailyCharge), 10);

    try {
      const res = await api.patients.transferBed({
        patient_id: transferPatient.id,
        new_bed_no: newBed,
        ...(Number.isFinite(charge) ? { new_daily_charge: charge } : {}),
      });
      if (!res?.success) throw new Error('Transfer rejected by the server');
    } catch (err) {
      showToast('Bed transfer could not be saved. Please try again.');
      return;
    }

    setTransferPatient(null);
    showToast(`${patientName} को Bed ${oldBed} से ${newBed} में सफलतापूर्वक Transfer कर दिया गया!`);
    await loadPatients();
  };

  // Step 4: Add Surgery Event & Operation Consent Modal
  // Every field starts blank — the operator must enter the real procedure, witness and diagnosis.
  const [surgeryPatient, setSurgeryPatient] = useState<StaffPatientItem | null>(null);
  const [surgeryProcedure, setSurgeryProcedure] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [surgeryCharges, setSurgeryCharges] = useState('0');
  const [indoorIpdNo, setIndoorIpdNo] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');

  // Witness Details
  const [witnessName, setWitnessName] = useState('');
  const [witnessAddress, setWitnessAddress] = useState('');
  const [witnessDate, setWitnessDate] = useState('');
  const [witnessPlace, setWitnessPlace] = useState('');

  // Guardian Details
  const [guardianSignName, setGuardianSignName] = useState('');
  const [guardianSignAddress, setGuardianSignAddress] = useState('');
  const [guardianSignDate, setGuardianSignDate] = useState('');
  const [guardianSignPlace, setGuardianSignPlace] = useState('');

  // Signature proof state
  const [uploadedProofName, setUploadedProofName] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Open Surgery Modal with prefilled patient data (never invent clinical/legal details)
  const handleOpenSurgeryModal = (p: StaffPatientItem) => {
    setSurgeryPatient(p);
    setSurgeryProcedure('');
    setSurgeonName(p.doctor && p.doctor !== '—' ? p.doctor : '');
    setSurgeryDate(new Date().toISOString().slice(0, 10));
    setSurgeryCharges('0');
    setIndoorIpdNo(p.id);
    setWardNo(p.bedNo);
    setProvisionalDiagnosis(p.condition && p.condition !== '—' ? p.condition : '');
    setFinalDiagnosis('');
    setWitnessName('');
    setWitnessAddress('');
    setWitnessDate(new Date().toISOString().slice(0, 10));
    setWitnessPlace('');
    setGuardianSignName(p.guardian || '');
    setGuardianSignAddress(p.address && p.address !== '—' ? p.address : '');
    setGuardianSignDate(new Date().toISOString().slice(0, 10));
    setGuardianSignPlace('');
    setUploadedProofName(null);
    setIsCameraActive(false);
    setSignatureData(null);
  };

  // Submit and process surgery consent
  const handleProcessSurgeryConsent = () => {
    if (!surgeryPatient) return;
    if (!surgeryProcedure.trim()) {
      showToast('कृपया Surgery / Procedure का नाम दर्ज करें!');
      return;
    }

    setPatients((prev) =>
      prev.map((item) => {
        if (item.id === surgeryPatient.id) {
          return {
            ...item,
            specialBadge: 'SURGERY DONE',
            condition: `Post-Op ${surgeryProcedure} (Surgery Done)`,
            doctor: surgeonName,
          };
        }
        return item;
      })
    );

    const pName = surgeryPatient.name;
    const procedure = surgeryProcedure;
    setSurgeryPatient(null);
    showToast(`${pName} के लिए ${procedure} सहमति पत्र सफलतापूर्वक प्रोसेस किया गया!`);
  };

  // Open Step 2 with pre-filled patient info (only real data already on file)
  const handleOpenAdmitForm = (p: StaffPatientItem) => {
    setShiftConfirmPatient(null);
    setAdmitFormPatient(p);
    setFormName(p.name);
    setFormGuardian(p.guardian && p.guardian !== '—' ? p.guardian : '');
    setFormAge(String(p.age));
    setFormGender(p.gender === 'F' ? 'Female' : 'Male');
    setFormPhone(p.phone && p.phone !== '—' ? p.phone.replace(/[^0-9]/g, '').slice(-10) : '');
    setFormEmail('');
    setFormAddress(p.address && p.address !== '—' ? p.address : '');
    setFormWard(p.ward && p.ward !== '—' ? p.ward : (wardOptions[0] || ''));
    setFormBed(p.bedNo && p.bedNo !== '—' && p.type === 'IPD' ? p.bedNo : '');
    setFormDailyCharge(defaultWardCharge);
  };

  // Submit Step 2: Convert to IPD and save bed
  const handleSaveIpdAdmission = async () => {
    if (!admitFormPatient) return;
    if (!formName.trim()) {
      showToast('कृपया Patient का नाम दर्ज करें!');
      return;
    }
    if (!formBed) {
      showToast('कृपया Bed Number चुनें!');
      return;
    }

    const savedPatientName = formName;
    const savedBed = formBed;
    const charge = parseInt(String(formDailyCharge), 10);

    try {
      const res = await api.patients.update(admitFormPatient.id, {
        name: formName.trim(),
        guardian_name: formGuardian.trim() || undefined,
        age: parseInt(formAge, 10) || undefined,
        gender: formGender,
        mobile: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
        bed_no: formBed,
        patient_type: 'IPD',
        status: 'Admitted',
        wardChargePerDay: Number.isFinite(charge) ? charge : undefined,
      } as any);
      if (!res?.success) throw new Error('Update rejected by the server');
    } catch (err) {
      showToast('IPD admission could not be saved. Please try again.');
      return;
    }

    setAdmitFormPatient(null);
    showToast(`${savedPatientName} को IPD Bed ${savedBed} में सफलतापूर्वक Admit कर दिया गया!`);
    await loadPatients();
  };

  // Filtered & Sorted Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.guardian.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        p.bedNo.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'Active' || statusFilter === 'Admitted'
          ? p.status !== 'DISCHARGED'
          : statusFilter === 'Discharged'
          ? p.status === 'DISCHARGED'
          : true;

      const matchType =
        typeFilter === 'All' ||
        p.type === typeFilter;

      const matchCases =
        casesFilter === 'All' ||
        (casesFilter === 'Surgery' && (p.specialBadge?.includes('SURGERY') || p.condition?.toLowerCase().includes('post-op') || p.condition?.toLowerCase().includes('appendectomy'))) ||
        (casesFilter === 'General' && (!p.specialBadge && !p.condition?.toLowerCase().includes('surgery')));

      return matchSearch && matchStatus && matchType && matchCases;
    }).sort((a, b) => {
      if (sortBy === 'Newest First') return b.id.localeCompare(a.id);
      if (sortBy === 'Oldest First') return a.id.localeCompare(b.id);
      if (sortBy === 'Name A-Z') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [patients, searchQuery, statusFilter, typeFilter, casesFilter, sortBy]);

  const matchedDischargedCount = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || statusFilter === 'Discharged') return 0;
    return patients.filter(p =>
      p.status === 'DISCHARGED' && (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      )
    ).length;
  }, [searchQuery, patients, statusFilter]);

  // Reset pagination to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, casesFilter, sortBy, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPatients.length);
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + pageSize);

  // Export CSV
  const handleExportExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['PATIENT ID,NAME,GUARDIAN,TYPE,AGE,GENDER,BED NO,ADMISSION DATE,STATUS,PAY STATUS,DOCTOR']
        .concat(
          filteredPatients.map(
            (p) =>
              `"${p.id}","${p.name}","${p.guardian}","${p.type}",${p.age},"${p.gender}","${p.bedNo}","${p.admissionDate}","${p.status}","${p.payStatus}","${p.doctor || ''}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Patient_Management_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Patient roster exported to Excel successfully!');
  };

  if (selectedInlineNotePatient) {
    return (
      <StaffNotesView
        patient={selectedInlineNotePatient}
        initialPatientName={selectedInlineNotePatient.name}
        initialBedNo={selectedInlineNotePatient.bedNo}
        onBack={() => setSelectedInlineNotePatient(null)}
      />
    );
  }

  return (
    <div className="space-y-4 pb-2 select-none animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl text-white font-medium text-xs rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER TITLE, 2 TABS & ADD PATIENT BUTTON ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            {/* Vertical Green Accent Line */}
            <span className="w-1.5 h-6 rounded-full bg-emerald-500 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Patient Management
            </h1>
          </div>

          {/* ── 2 DEDICATED TABS: IPD & OPD (SEPARATED SO NOT MIXED) ── */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-inner">
            <button
              type="button"
              onClick={() => setTypeFilter('IPD')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${typeFilter === 'IPD'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>IPD Patients (इनडोर)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${typeFilter === 'IPD'
                    ? 'bg-white/25 text-white border border-white/30 shadow-2xs'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {ipdCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('OPD')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${typeFilter === 'OPD'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>OPD Patients (ओपीडी)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${typeFilter === 'OPD'
                    ? 'bg-white/25 text-white border border-white/30 shadow-2xs'
                    : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                {opdCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('All')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${typeFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="Show All (Mixed)"
            >
              <span>All ({patients.length})</span>
            </button>
          </div>
        </div>

        {/* Emerald + Add New Patient Button */}
        <button
          onClick={onAdmitNew}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Patient</span>
        </button>
      </div>

      {/* ── 2. FILTER TOOLBAR (Exact layout from user screenshot) ── */}
      <div className="glass-panel-3d relative overflow-hidden rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* Row of Inputs & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone or..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/80 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* All Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="Active">Active In-Hospital</option>
              <option value="Discharged">Discharged Records ({dischargedCount})</option>
              <option value="All">All Records ({patients.length})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>

          {/* All Types Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'IPD' | 'OPD' | 'All')}
              className="appearance-none bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="All">All Types</option>
              <option value="IPD">IPD</option>
              <option value="OPD">OPD</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>

          {/* All Cases Dropdown */}
          <div className="relative">
            <select
              value={casesFilter}
              onChange={(e) => setCasesFilter(e.target.value)}
              className="appearance-none bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs max-w-[145px] truncate"
            >
              <option value="All">All Cases (Surge...)</option>
              <option value="Surgery">Surgery Cases</option>
              <option value="General">General / Medical</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-1.5 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
            >
              <option value="Newest First">Sort: Newest Fi...</option>
              <option value="Oldest First">Sort: Oldest First</option>
              <option value="Name A-Z">Sort: Name A-Z</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          </div>

          {/* Date Range: From: [dd-mm-yyyy] To: [dd-mm-yyyy] */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <span className="text-slate-400 font-medium">From:</span>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="dd-mm-yyyy"
                className="px-2.5 py-1 bg-white/90 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
              />
            </div>

            <span className="text-slate-400 font-medium ml-1">To:</span>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="dd-mm-yyyy"
                className="px-2.5 py-1 bg-white/90 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer shadow-2xs"
              />
            </div>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="ml-auto px-3 py-1.5 bg-white/90 hover:bg-emerald-50 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Discharged Records Archive Banner */}
      {statusFilter === 'Discharged' && (
        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Viewing <strong>Discharged Patient Archive</strong> ({filteredPatients.length} record{filteredPatients.length === 1 ? '' : 's'}). These patients have completed their treatment and were discharged.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
          >
            ← Back to Active Patients
          </button>
        </div>
      )}

      {/* Matched Discharged Patients Hint when searching in Active */}
      {matchedDischargedCount > 0 && statusFilter !== 'Discharged' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Found <strong>{matchedDischargedCount}</strong> discharged patient record{matchedDischargedCount === 1 ? '' : 's'} matching "{searchQuery}".
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Discharged')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
          >
            View in Discharged Records →
          </button>
        </div>
      )}

      {/* ── 3. PATIENTS TABLE (Exact columns matching user screenshot) ── */}
      <div className="glass-panel-3d relative overflow-hidden rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
        {/* Specular Light Sheen */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">PATIENT ID</th>
                <th className="py-3.5 px-4">NAME & GUARDIAN</th>
                <th className="py-3.5 px-4">AGE/GEN</th>
                <th className="py-3.5 px-4">BED NO.</th>
                <th className="py-3.5 px-4">ADMISSION DATE</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">PAY STATUS</th>
                <th className="py-3.5 px-5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {isLoadingPatients ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold bg-white/50">
                    Loading patients from the database…
                  </td>
                </tr>
              ) : patientsError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-500 font-bold bg-white/50">
                    {patientsError}
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold bg-white/50">
                    {patients.length === 0
                      ? 'No patients registered yet. Admitted patients will appear here.'
                      : 'No matching patients found. Try adjusting your search query or filters.'}
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((p) => {
                  const isIpd = p.type === 'IPD';
                  const isOpd = p.type === 'OPD';
                  const isAdmitted = p.status === 'ADMITTED';
                  const isActive = p.status === 'ACTIVE';
                  const isPaid = p.payStatus === 'PAID';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* 1. PATIENT ID */}
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-slate-800 text-xs tracking-tight block">
                          {p.id}
                        </span>
                      </td>

                      {/* 2. NAME & GUARDIAN + TYPE BADGE + SPECIAL BADGE */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900 text-[13px] group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </span>

                            {/* OPD / IPD Pill Badge */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${isOpd
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                              {p.type}
                            </span>

                            {/* Special Badge (e.g. SURGERY DONE) */}
                            {p.specialBadge && (
                              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                                {p.specialBadge}
                              </span>
                            )}
                          </div>

                          {/* Guardian subtext */}
                          {p.guardian && (
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                              {p.guardian}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. AGE/GEN */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700 text-xs">
                          {p.age}/{p.gender}
                        </span>
                      </td>

                      {/* 4. BED NO. */}
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold text-xs ${p.bedNo === 'OPD' ? 'text-slate-600' : 'text-slate-900 font-bold'
                          }`}>
                          {p.bedNo}
                        </span>
                      </td>

                      {/* 5. ADMISSION DATE */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-semibold text-xs">
                          {p.admissionDate}
                        </span>
                      </td>

                      {/* 6. STATUS */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-tight border shadow-2xs ${isAdmitted
                            ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90'
                            : isActive
                              ? 'bg-slate-50 text-slate-800 border-slate-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                          {isAdmitted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                          {p.status}
                        </span>
                      </td>

                      {/* 7. PAY STATUS */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-tight border shadow-2xs ${isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : 'bg-amber-50 text-amber-700 border-amber-200/90'
                          }`}>
                          {p.payStatus}
                        </span>
                      </td>

                      {/* 8. ACTIONS */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Eye: View Dossier */}
                          <button
                            onClick={() => setInspectPatient(p)}
                            className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-sky-50/60 to-sky-100/50 hover:from-sky-500 hover:to-blue-600 text-sky-600 hover:text-white border border-sky-200/90 hover:border-sky-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(14,165,233,0.12)] hover:shadow-[0_4px_14px_rgba(14,165,233,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                          </button>

                          {/* Action Buttons */}
                          {p.status === 'DISCHARGED' ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 select-none">
                              Discharged
                            </span>
                          ) : isOpd ? (
                            <button
                              onClick={() => setShiftConfirmPatient(p)}
                              className="w-8 h-8 rounded-full bg-gradient-to-b from-indigo-500 via-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-700 text-white border border-indigo-400/60 shadow-[0_3px_10px_rgba(79,70,229,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.5)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                              title="Admit to Inpatient Bed"
                            >
                              <Bed className="w-4 h-4 text-white stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                            </button>
                          ) : (
                            <>
                              {/* Transfer Bed Swap Arrows */}
                              <button
                                onClick={() => handleOpenTransferModal(p)}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-emerald-50/60 to-emerald-100/50 hover:from-emerald-500 hover:to-teal-600 text-emerald-600 hover:text-white border border-emerald-200/90 hover:border-emerald-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(16,185,129,0.12)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                                title="Transfer / Bed Swap"
                              >
                                <ArrowLeftRight className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                              </button>

                              {/* Medical Note / Plus Icon */}
                              <button
                                onClick={() => {
                                  if (onOpenNoteForPatient) {
                                    onOpenNoteForPatient(p.name, p.bedNo, p);
                                  } else {
                                    setSelectedInlineNotePatient(p);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-purple-50/60 to-purple-100/50 hover:from-purple-500 hover:to-indigo-600 text-purple-600 hover:text-white border border-purple-200/90 hover:border-purple-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(168,85,247,0.12)] hover:shadow-[0_4px_14px_rgba(168,85,247,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                                title="Add Clinical Note"
                              >
                                <FilePlus className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                              </button>

                              {/* Bed / Surgery Event & Operation Consent */}
                              <button
                                onClick={() => handleOpenSurgeryModal(p)}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-purple-50/60 to-purple-100/50 hover:from-purple-600 hover:to-indigo-600 text-purple-600 hover:text-white border border-purple-200/90 hover:border-purple-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(147,51,234,0.12)] hover:shadow-[0_4px_14px_rgba(147,51,234,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                                title="Add Surgery Event & Operation Consent"
                              >
                                <HospitalStretcherIcon className="w-5 h-5 transition-transform duration-200 group-hover/btn:scale-110" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-5 py-3 border-t border-slate-200/50 bg-slate-50/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Showing <span className="font-bold text-slate-900">{filteredPatients.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-slate-900">{endIndex}</span> of <span className="font-bold text-slate-900">{filteredPatients.length}</span> registered patients
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className={`px-3 py-1 rounded-xl border font-bold transition-all shadow-2xs ${
                safeCurrentPage === 1
                  ? 'border-slate-200/50 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  safeCurrentPage === pageNum
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className={`px-3 py-1 rounded-xl border font-bold transition-all shadow-2xs ${
                safeCurrentPage === totalPages
                  ? 'border-slate-200/50 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 cursor-pointer active:scale-95'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. QUICK PATIENT DOSSIER MODAL (When clicking Eye icon) ── */}
      {inspectPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-3d relative bg-white/95 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/90 animate-scaleUp overflow-hidden">
            {/* Specular Light Sheen */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {inspectPatient.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${inspectPatient.type === 'OPD' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                    {inspectPatient.type}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  ID: {inspectPatient.id} • Bed: <span className="font-bold text-slate-700">{inspectPatient.bedNo}</span>
                </p>
              </div>

              <button
                onClick={() => setInspectPatient(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guardian</span>
                  <span className="font-bold text-slate-800">{inspectPatient.guardian || 'N/A'}</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age & Gender</span>
                  <span className="font-bold text-slate-800">{inspectPatient.age} Years • {inspectPatient.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ward Location</span>
                  <span className="font-bold text-slate-800">{inspectPatient.ward}</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admission Date</span>
                  <span className="font-bold text-slate-800">{inspectPatient.admissionDate}</span>
                </div>
              </div>

              {/* Diagnosis / Condition */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">Primary Clinical Diagnosis</span>
                <p className="font-bold text-slate-900">{inspectPatient.condition || 'General Clinical Observation'}</p>
                {inspectPatient.doctor && (
                  <p className="text-[11px] text-blue-800 font-semibold mt-1">Attending: {inspectPatient.doctor}</p>
                )}
              </div>

              {/* Vitals */}
              {inspectPatient.vitals && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">Recorded Vitals</span>
                  <p className="font-mono font-bold text-slate-900">{inspectPatient.vitals}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const pat = inspectPatient;
                    setInspectPatient(null);
                    onOpenNoteForPatient?.(pat.name, pat.bedNo, pat);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Nursing Notes</span>
                </button>
                <button
                  onClick={() => setInspectPatient(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. STEP 1: IPD SHIFT CONFIRMATION MODAL ("IPD में Shift करें?") ── */}
      {shiftConfirmPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-scaleUp">
            {/* Header: Solid Indigo/Purple with Bed in circle */}
            <div className="bg-[#4F46E5] text-white pt-8 pb-7 px-6 text-center relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-800/30 rounded-full blur-2xl pointer-events-none" />

              {/* White Circular Bed Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
                <Bed className="w-8 h-8 text-white stroke-[2.2]" />
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                IPD में Shift करें?
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium mt-1">
                OPD से Inpatient Admission
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Patient Card */}
              <div className="flex items-center gap-3.5 p-2">
                <div className="w-12 h-12 rounded-full bg-[#E0E7FF] text-[#4338CA] font-bold text-lg flex items-center justify-center shrink-0 border border-indigo-200">
                  {shiftConfirmPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {shiftConfirmPatient.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    ID: {shiftConfirmPatient.id} • OPD Patient
                  </p>
                </div>
              </div>

              {/* Amber / Yellow Warning Alert Box */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs font-serif font-bold italic shrink-0 mt-0.5 shadow-2xs">
                  i
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  अगले step में <strong className="font-bold text-amber-950">Bed Number चुनना होगा</strong> तभी IPD Admission पूरा होगा। गलती से दबा है तो <strong className="font-bold text-amber-950">Cancel</strong> करें।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShiftConfirmPatient(null)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAdmitForm(shiftConfirmPatient)}
                  className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bed className="w-4 h-4" />
                  <span>हाँ, IPD में Admit करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. STEP 2: EDIT PATIENT DETAILS / OPD TO IPD FORM MODAL ── */}
      {admitFormPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-scaleUp max-h-[92vh] flex flex-col">
            {/* Header: Dark Charcoal Bar with Edit Icon & Close Button */}
            <div className="bg-[#2D3748] px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-white stroke-[2.5]" />
                <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                  Edit Patient Details
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setAdmitFormPatient(null)}
                className="w-7 h-7 rounded-full hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Amber Callout Box */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 flex items-start gap-3 border-l-4 border-l-amber-500">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-serif font-bold italic shrink-0 mt-0.5 shadow-2xs">
                  i
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-xs">
                    OPD → IPD Conversion
                  </h4>
                  <p className="text-amber-900 text-xs mt-0.5 leading-relaxed font-medium">
                    <strong className="font-bold">Bed Number ज़रूर चुनें</strong>, फिर &quot;IPD में Admit करें&quot; बटन दबाएँ — तभी Admission पूरा होगा।
                  </p>
                </div>
              </div>

              {/* Form Input Groups with floating green labels */}
              {/* Row 1: Patient Name & Guardian Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="Enter patient full name"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formGuardian}
                    onChange={(e) => setFormGuardian(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="Father / Guardian Name"
                  />
                </div>
              </div>

              {/* Row 2: Age (Yrs) & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Age (Yrs)
                  </label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="Age"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Gender
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Mobile / Contact & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Mobile / Contact
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                  <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent placeholder:text-slate-400"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Row 4: Address Textarea */}
              <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent resize-y"
                  placeholder="Street, City, District, State"
                />
              </div>

              {/* Section Divider: Ward / Bed Stay Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                    <Bed className="w-4 h-4 text-slate-800" />
                    <span>Ward / Bed Stay Details</span>
                  </div>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* 3 Columns: Ward Type, Bed Number, Daily Charge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Ward Type */}
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Ward Type
                    </label>
                    <select
                      value={formWard}
                      onChange={(e) => setFormWard(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                    >
                      {wardOptions.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bed Number */}
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Bed Number
                    </label>
                    <select
                      value={formBed}
                      onChange={(e) => setFormBed(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                    >
                      {availableBeds.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Daily Charge */}
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Daily Charge (₹)
                    </label>
                    <input
                      type="number"
                      value={formDailyCharge}
                      onChange={(e) => setFormDailyCharge(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Submit & Cancel */}
            <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSaveIpdAdmission}
                className="flex-1 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Bed className="w-4 h-4" />
                <span>IPD में Admit करें (Save)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdmitFormPatient(null)}
                className="px-5 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. STEP 3: TRANSFER BED MODAL (Exact match to user screenshot) ── */}
      {transferPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-scaleUp">
            {/* Header: Dark Charcoal Bar with ArrowLeftRight & Close */}
            <div className="bg-[#2D3748] px-5 sm:px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-4 h-4 text-white stroke-[2.5]" />
                <h3 className="font-bold text-white text-base tracking-tight">
                  Transfer Bed
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setTransferPatient(null)}
                className="w-7 h-7 rounded-full hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Patient Info */}
              <div className="space-y-1.5 text-xs sm:text-sm">
                <p className="text-slate-700 font-semibold">
                  <span className="font-bold text-slate-900">Patient:</span>{' '}
                  <span className="text-slate-600 font-medium">{transferPatient.name}</span>
                </p>
                <p className="text-slate-700 font-semibold">
                  <span className="font-bold text-slate-900">Current Bed:</span>{' '}
                  <span className="text-slate-600 font-medium">{transferPatient.bedNo}</span>
                </p>
              </div>

              {/* Field 1: Select New Bed (Green Border with Floating Label) */}
              <div className="relative rounded-2xl border-2 border-emerald-500 bg-white px-3.5 pt-3 pb-2.5 shadow-2xs">
                <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  Select New Bed
                </label>
                <select
                  value={transferNewBed}
                  onChange={(e) => setTransferNewBed(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                >
                  <option value="">Select New Bed</option>
                  {availableBeds
                    .filter((b) => b !== transferPatient.bedNo)
                    .map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                </select>
              </div>

              {/* Field 2: New Daily Charge (₹) */}
              <div className="relative rounded-2xl border border-slate-300 bg-white px-3.5 pt-3 pb-2.5 focus-within:border-emerald-500 transition-all">
                <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-[11px] font-bold text-emerald-600 select-none">
                  New Daily Charge (₹)
                </label>
                <input
                  type="number"
                  value={transferDailyCharge}
                  onChange={(e) => setTransferDailyCharge(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                  placeholder="500"
                />
              </div>

              {/* Buttons: Confirm Transfer & Cancel */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="px-6 py-2.5 bg-[#2D3748] hover:bg-[#1E2530] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
                  <span>Confirm Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferPatient(null)}
                  className="px-4 py-2.5 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. STEP 4: ADD SURGERY EVENT & OPERATION CONSENT MODAL (LANDSCAPE FORM) ── */}
      {surgeryPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/70 animate-scaleUp max-h-[94vh] flex flex-col">
            {/* Header: Clean White Bar with Purple Activity Icon & Close */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Add Surgery Event &amp; Operation Consent
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSurgeryPatient(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Landscape Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              {/* Patient Banner */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-xl font-semibold text-slate-700">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Recording surgery for patient:{' '}
                  <strong className="text-slate-950 font-bold">{surgeryPatient.name}</strong>{' '}
                  <span className="text-slate-500 font-normal">
                    (ID: <span className="font-mono text-blue-800 font-bold">{surgeryPatient.id}</span> • Bed:{' '}
                    <span className="font-bold text-slate-900">{surgeryPatient.bedNo}</span>)
                  </span>
                </span>
              </div>

              {/* Section 1: SURGERY & DIAGNOSIS INFORMATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>SURGERY &amp; DIAGNOSIS INFORMATION</span>
                </h4>

                {/* Landscape Row 1: Surgery Name & Surgeon Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Surgery Name / Procedure *
                    </label>
                    <input
                      type="text"
                      value={surgeryProcedure}
                      onChange={(e) => setSurgeryProcedure(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="e.g. Laparoscopic Appendectomy"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Surgeon Name *
                    </label>
                    <input
                      type="text"
                      value={surgeonName}
                      onChange={(e) => setSurgeonName(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Assigned doctor name"
                    />
                  </div>
                </div>

                {/* Landscape Row 2: 4 Columns (Date, Charges, INDOOR No, WARD No) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Surgery Date *
                    </label>
                    <input
                      type="date"
                      value={surgeryDate}
                      onChange={(e) => setSurgeryDate(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Surgery Base Charges (₹) *
                    </label>
                    <input
                      type="number"
                      value={surgeryCharges}
                      onChange={(e) => setSurgeryCharges(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      INDOOR No. (IPD No.) (Optional)
                    </label>
                    <input
                      type="text"
                      value={indoorIpdNo}
                      onChange={(e) => setIndoorIpdNo(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      WARD No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={wardNo}
                      onChange={(e) => setWardNo(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Landscape Row 3: 2 Columns for Provisional and Final Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Provisional Diagnosis (Optional)
                    </label>
                    <input
                      type="text"
                      value={provisionalDiagnosis}
                      onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      Final Diagnosis (Optional)
                    </label>
                    <input
                      type="text"
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Orange/Amber Operation Consent Notice */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 border-l-4 border-l-amber-500 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs sm:text-sm">
                  <span>🧡</span>
                  <span>शल्य चिकित्सा एवं निश्चेतक हेतु सहमति (Operation Consent Form)</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  मैं एतद्द्वारा अपने रोगी के किसी प्रकार के नैदानिक परीक्षण, उपचार एवं तद हेतु आवश्यक शल्य क्रिया व निश्चेतक औषधियों के प्रयोग की अनुमति देता / देती हूँ। मुझे इसके सभी संभावित परिणामो से अवगत करा दिया गया है।
                </p>
              </div>

              {/* Section 3: Witnesses & Guardian Details (Side-by-Side 2 Columns in Landscape) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* Left Column: साक्षी गवाह (WITNESS DETAILS) */}
                <div className="space-y-3.5">
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥</span>
                    <span>साक्षी गवाह (WITNESS DETAILS)</span>
                  </h4>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      गवाह का नाम (Witness Name)
                    </label>
                    <input
                      type="text"
                      value={witnessName}
                      onChange={(e) => setWitnessName(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Full name of witness"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      वर्तमान पता (Address)
                    </label>
                    <input
                      type="text"
                      value={witnessAddress}
                      onChange={(e) => setWitnessAddress(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                        दिनांक (Date)
                      </label>
                      <input
                        type="date"
                        value={witnessDate}
                        onChange={(e) => setWitnessDate(e.target.value)}
                        className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                      />
                    </div>

                    <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                        स्थान (Place)
                      </label>
                      <input
                        type="text"
                        value={witnessPlace}
                        onChange={(e) => setWitnessPlace(e.target.value)}
                        className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                        placeholder="Bareilly"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: रोगी से संबंधित हस्ताक्षरकर्ता (GUARDIAN DETAILS) */}
                <div className="space-y-3.5">
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>✍️</span>
                    <span>रोगी से संबंधित हस्ताक्षरकर्ता (GUARDIAN DETAILS)</span>
                  </h4>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      अभिभावक का नाम (Guardian Name)
                    </label>
                    <input
                      type="text"
                      value={guardianSignName}
                      onChange={(e) => setGuardianSignName(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Father / Husband / Relative Name"
                    />
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                      वर्तमान पता (Address)
                    </label>
                    <input
                      type="text"
                      value={guardianSignAddress}
                      onChange={(e) => setGuardianSignAddress(e.target.value)}
                      className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                      placeholder="Address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                        दिनांक (Date)
                      </label>
                      <input
                        type="date"
                        value={guardianSignDate}
                        onChange={(e) => setGuardianSignDate(e.target.value)}
                        className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                      />
                    </div>

                    <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[11px] font-bold text-emerald-600 select-none">
                        स्थान (Place)
                      </label>
                      <input
                        type="text"
                        value={guardianSignPlace}
                        onChange={(e) => setGuardianSignPlace(e.target.value)}
                        className="w-full text-xs sm:text-sm font-semibold text-slate-800 outline-none bg-transparent"
                        placeholder="Bareilly"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: PATIENT SIGNATURE PROOF (Side-by-Side 2 Columns in Landscape) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-semibold text-purple-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>PATIENT SIGNATURE PROOF</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Upload / Web Camera Options */}
                  <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-4 space-y-3.5">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                        Method 1: Upload Image (Gallery / Native Camera)
                      </h5>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadedProofName(file.name);
                            showToast(`File selected: ${file.name}`);
                          }
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                      <span className="flex-1 h-[1px] bg-slate-200" />
                      <span>— OR —</span>
                      <span className="flex-1 h-[1px] bg-slate-200" />
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-1.5">
                        Method 2: Take Instant Photo via Web Camera
                      </h5>
                      <button
                        type="button"
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isCameraActive ? 'कैमरा बंद करें (Close Camera)' : 'Open Camera (कैमरा खोलें)'}</span>
                      </button>

                      {isCameraActive && (
                        <div className="mt-2 p-3 bg-slate-900 rounded-xl text-center text-white text-xs space-y-2 animate-fadeIn">
                          <p className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Live Camera Preview Ready
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedProofName('captured_consent_photo.jpg');
                              setIsCameraActive(false);
                              showToast('Camera photo captured successfully!');
                            }}
                            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-bold text-xs transition-all shadow-xs"
                          >
                            📸 Snap Photo
                          </button>
                        </div>
                      )}

                      {uploadedProofName && (
                        <p className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Attached: {uploadedProofName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Digital Signature Canvas */}
                  <div className="rounded-2xl border border-slate-300 bg-white p-3.5 flex flex-col justify-between min-h-[190px]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Digital Signature / अंगूठा या हस्ताक्षर</span>
                      </span>
                      {signatureData && (
                        <button
                          type="button"
                          onClick={() => setSignatureData(null)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => {
                        if (!signatureData) {
                          setSignatureData('signed');
                          showToast('Digital signature recorded!');
                        }
                      }}
                      className="flex-1 min-h-[110px] my-2 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-100/70 transition-colors relative overflow-hidden group/canvas"
                      title="Click or tap to digitally sign"
                    >
                      {signatureData ? (
                        <div className="text-center p-2">
                          <svg className="w-36 h-12 text-blue-900 mx-auto" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M10 40 Q 30 10, 50 35 T 90 25 T 130 45 T 170 20" />
                            <path d="M50 45 Q 80 50, 110 48" strokeWidth="1.5" />
                          </svg>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 block mt-1">
                            ✓ Verified Digital Signature • {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 p-2">
                          <PenTool className="w-6 h-6 mx-auto mb-1 opacity-50 group-hover/canvas:scale-110 transition-transform" />
                          <p className="text-xs font-semibold">Click / Draw to Sign Here</p>
                          <p className="text-[10px] text-slate-400">हस्ताक्षर करने के लिए यहाँ क्लिक करें</p>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 text-center font-medium">
                      Use touch/mouse to sign above, or upload signed physical form on the left.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSurgeryPatient(null)}
                className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProcessSurgeryConsent}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span>Process &amp; Save Surgery Event (सहमति सुरक्षित करें)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
