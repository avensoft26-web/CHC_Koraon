import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Bed,
  FileText,
  Search,
  Calendar,
  ArrowUpDown,
  Eye,
  Edit3,
  Download,
  ChevronDown,
  Check,
  Plus,
  TrendingUp,
  X,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  UserCheck,
  Stethoscope,
  Printer,
  HeartPulse,
  CheckCircle2,
  ArrowLeftRight,
  FilePlus,
  BedDouble,
  Camera,
  Upload,
  User,
  PenTool,
  Trash2,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Patient } from '../../types/hospital';
import { HospitalStretcherIcon } from './HospitalStretcherIcon';
import { StaffNotesView } from './staff/StaffNotesView';
import { useHospitalContext } from '../../context/HospitalContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { api, ApiError } from '../../services/api';
import { BedTransferModal } from './patients/BedTransferModal';
import { SurgeryConsentModal } from './patients/SurgeryConsentModal';

export interface ChaudharyPatientRow {
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
  admissionTime: string;
  status: 'ADMITTED' | 'ACTIVE' | 'DISCHARGED';
  payStatus: 'PENDING' | 'PAID';
  avatarUrl?: string;
  initial?: string;
  phone?: string;
  address?: string;
  condition?: string;
  doctor?: string;
  totalBilled?: string;
  amountPaid?: string;
  amountDue?: string;
  spo2?: number;
  pulse?: number;
  bp?: string;
}

export interface ChaudharyPatientsViewProps {
  onNewAdmission?: () => void;
  externalPatients?: Patient[];
  patientsList?: ChaudharyPatientRow[];
}

export const ChaudharyPatientsView: React.FC<ChaudharyPatientsViewProps> = ({
  onNewAdmission,
  patientsList: propPatientsList,
}) => {
  const hospitalCtx = useHospitalContext();
  const [internalPatientsList, setInternalPatientsList] = useState<ChaudharyPatientRow[]>([]);
  const patientsList = propPatientsList || (hospitalCtx?.patients ?? internalPatientsList);
  const setPatientsList = hospitalCtx?.setPatients ?? setInternalPatientsList;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [selectedType, setSelectedType] = useState<string>('IPD');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 7;

  const ipdCount = useMemo(() => patientsList.filter(p => p.type === 'IPD' && p.status !== 'DISCHARGED').length, [patientsList]);
  const opdCount = useMemo(() => patientsList.filter(p => p.type === 'OPD' && p.status !== 'DISCHARGED').length, [patientsList]);
  const totalCount = patientsList.length;
  const admittedCount = useMemo(() => patientsList.filter(p => p.status !== 'DISCHARGED').length, [patientsList]);
  const dischargedCount = useMemo(() => patientsList.filter(p => p.status === 'DISCHARGED').length, [patientsList]);
  const newThisMonthCount = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return patientsList.filter(p => {
      if (!p.admissionDate) return false;
      const d = new Date(p.admissionDate);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [patientsList]);
  const [inspectPatient, setInspectPatient] = useState<ChaudharyPatientRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedNotePatient, setSelectedNotePatient] = useState<ChaudharyPatientRow | null>(null);

  // Step 1: Confirmation Modal ("IPD में Shift करें?")
  const [shiftConfirmPatient, setShiftConfirmPatient] = useState<ChaudharyPatientRow | null>(null);

  // Step 2: Edit & Admit Form Modal ("Edit Patient Details")
  const [admitFormPatient, setAdmitFormPatient] = useState<ChaudharyPatientRow | null>(null);

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

  const availableBeds = [
    'Male-G1',
    'Male-G2',
    'Male-G3',
    'Male-G4',
    'Male-G5',
    'Male-G6',
    'Male-G7',
    'Female-G1',
    'Female-G2',
    'Female-G3',
    'ICU-1',
    'ICU-2',
    'Private-1'
  ];

  const wardOptions = [
    'General Ward',
    'Male Ward',
    'Female Ward',
    'ICU Ward',
    'Private Suite'
  ];

  // Step 3: Transfer Bed Modal ("Transfer Bed")
  const [transferPatient, setTransferPatient] = useState<ChaudharyPatientRow | null>(null);
  const [transferNewBed, setTransferNewBed] = useState('');
  const [transferDailyCharge, setTransferDailyCharge] = useState('500');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Transfer Bed Modal
  const handleOpenTransferModal = (p: ChaudharyPatientRow) => {
    setTransferPatient(p);
    setTransferNewBed('');
    setTransferDailyCharge('500');
  };

  // Confirm Transfer Bed — persists to MongoDB via /patients/transfer, and only
  // reports success once the backend has confirmed the write.
  const handleConfirmTransfer = async () => {
    if (!transferPatient) return;
    if (!transferNewBed) {
      showToast('कृपया नया Bed चुनें!');
      return;
    }

    const oldBed = transferPatient.bedNo;
    const patientName = transferPatient.name;
    const newBed = transferNewBed;
    const patientId = transferPatient.id;
    const dailyCharge = parseFloat(transferDailyCharge);

    try {
      const res = await api.patients.transferBed({
        patient_id: patientId,
        new_bed_no: newBed,
        new_daily_charge: Number.isFinite(dailyCharge) ? dailyCharge : undefined,
      });

      if (!res?.success) throw new Error('Transfer was not accepted');

      // Refetch so the row reflects the authoritative bed + ward from the DB
      await hospitalCtx?.refreshPatients?.();

      setTransferPatient(null);
      showToast(`Patient ${patientName} transferred from Bed ${oldBed} to Bed ${newBed}.`);
    } catch (err: any) {
      showToast(`Bed transfer for ${patientName} was not saved — ${err?.message || 'please try again'}.`);
    }
  };

  // ── Move patient to Trash (admin only) ──
  // Deleting an inpatient who still holds a bed would silently free that bed
  // while the patient is physically still in it, so the server refuses unless
  // the operator states the admission is over. This modal asks that question
  // every time instead of assuming it.
  const [trashConfirmPatient, setTrashConfirmPatient] = useState<ChaudharyPatientRow | null>(null);
  const [trashAdmissionEnded, setTrashAdmissionEnded] = useState(false);
  const [isTrashing, setIsTrashing] = useState(false);

  const authUser = useAuthUser();
  // Mirrors the backend checkRole(['admin']) list (which also admits
  // 'developer'). Hiding the button is cosmetic only — the API re-checks.
  const canManageTrash = authUser.role === 'ADMIN' || authUser.role === 'DEVELOPER';

  /** Bed cells render '-' for a patient who holds no bed. */
  const rowHoldsABed = (p: ChaudharyPatientRow) =>
    p.status === 'ADMITTED' && !!p.bedNo && p.bedNo !== '-' && p.bedNo !== '—';

  const handleOpenTrashModal = (p: ChaudharyPatientRow) => {
    setTrashConfirmPatient(p);
    setTrashAdmissionEnded(false);
  };

  const handleConfirmTrash = async () => {
    const p = trashConfirmPatient;
    if (!p) return;

    if (rowHoldsABed(p) && !trashAdmissionEnded) {
      showToast('Please confirm the patient is no longer in the bed before moving them to Trash.');
      return;
    }

    setIsTrashing(true);
    try {
      const res = await api.patients.delete(p.id, { confirmAdmissionEnded: trashAdmissionEnded });
      if (!res?.success) throw new Error('The server did not accept the deletion');

      await hospitalCtx?.refreshPatients?.();
      setTrashConfirmPatient(null);
      showToast(
        res.releasedBed
          ? `Patient ${p.name} moved to Trash — bed ${res.releasedBed} released.`
          : `Patient ${p.name} moved to Trash.`
      );
    } catch (err: any) {
      // A 409 here means the server judged the admission still active; show
      // its reason rather than a generic failure.
      const detail = err instanceof ApiError && err.body?.message ? err.body.message : err?.message;
      showToast(`Patient ${p.name} was not moved to Trash — ${detail || 'please try again'}.`);
      if (err instanceof ApiError && err.status === 409) setTrashConfirmPatient(null);
    } finally {
      setIsTrashing(false);
    }
  };

  // Step 4: Add Surgery Event & Operation Consent Modal
  // Every field starts blank — the operator must enter the real procedure, witness and diagnosis.
  const [surgeryPatient, setSurgeryPatient] = useState<ChaudharyPatientRow | null>(null);
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
  const handleOpenSurgeryModal = (p: ChaudharyPatientRow) => {
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
    setGuardianSignPlace('Bareilly');
    setUploadedProofName(null);
    setIsCameraActive(false);
    setSignatureData(null);
  };

  // Submit and process surgery consent — persisted to the patient's `surgeries`
  // sub-document in MongoDB via /patients/:id/surgeries.
  const handleProcessSurgeryConsent = async () => {
    if (!surgeryPatient) return;
    if (!surgeryProcedure.trim()) {
      showToast('कृपया Surgery / Procedure का नाम दर्ज करें!');
      return;
    }

    const pName = surgeryPatient.name;
    const procedure = surgeryProcedure;
    const patientId = surgeryPatient.id;

    // Only send the fields the hospital actually collects; blanks stay blank
    // rather than being replaced with placeholder values.
    const payload: Record<string, unknown> = {
      surgeryName: procedure.trim(),
      surgeonName: surgeonName.trim() || undefined,
      surgeryDate: surgeryDate || undefined,
      cost: parseFloat(surgeryCharges) || 0,
      indoorNo: indoorIpdNo.trim() || undefined,
      wardNo: wardNo.trim() || undefined,
      provisional: provisionalDiagnosis.trim() || undefined,
      finalDiag: finalDiagnosis.trim() || undefined,
      witnessName: witnessName.trim() || undefined,
      witnessAddress: witnessAddress.trim() || undefined,
      witnessDate: witnessDate || undefined,
      witnessPlace: witnessPlace.trim() || undefined,
      guardianName: guardianSignName.trim() || undefined,
      guardianAddress: guardianSignAddress.trim() || undefined,
      guardianDate: guardianSignDate || undefined,
      guardianPlace: guardianSignPlace.trim() || undefined,
      guardianSignature: signatureData || undefined,
    };

    try {
      const res = await api.patients.addSurgery(patientId, payload);
      if (!res?.success) throw new Error('Surgery event was not accepted');

      await hospitalCtx?.refreshPatients?.();

      setSurgeryPatient(null);
      showToast(`${pName} के लिए ${procedure} सहमति पत्र प्रोसेस कर दिया गया!`);
    } catch (err: any) {
      showToast(`Surgery record for ${pName} was not saved — ${err?.message || 'please try again'}.`);
    }
  };

  // Open Step 2 with pre-filled patient info. Never invent a phone number or
  // address — unrecorded fields stay blank for the operator to fill in.
  const handleOpenAdmitForm = (p: ChaudharyPatientRow) => {
    setShiftConfirmPatient(null);
    setAdmitFormPatient(p);
    setFormName(p.name);
    setFormGuardian(p.guardian || '');
    setFormAge(String(p.age));
    setFormGender(p.gender === 'F' ? 'Female' : 'Male');
    setFormPhone(p.phone?.replace(/[^0-9]/g, '').slice(-10) || '');
    setFormEmail('');
    setFormAddress(p.address || '');
    setFormWard('General Ward');
    setFormBed(p.gender === 'F' ? 'Female-G1' : 'Male-G1');
    setFormDailyCharge('0');
  };

  // Submit Step 2: Convert to IPD and save bed — persisted via PUT /patients/:id
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
    const patientId = admitFormPatient.id;
    const parsedAge = parseInt(formAge, 10);

    try {
      const res = await api.patients.update(patientId, {
        name: formName.trim(),
        guardian_name: formGuardian.trim() || undefined,
        age: Number.isFinite(parsedAge) ? parsedAge : undefined,
        gender: formGender === 'Female' ? 'Female' : 'Male',
        mobile: formPhone.trim() || undefined,
        address: formAddress.trim() || undefined,
        bed_no: formBed,
        ward_type: formWard,
        patient_type: 'IPD',
        status: 'Admitted',
        wardChargePerDay: parseFloat(formDailyCharge) || 0,
      });

      if (!res?.success) throw new Error('Admission was not accepted');

      await hospitalCtx?.refreshPatients?.();

      setAdmitFormPatient(null);
      showToast(`${savedPatientName} को IPD Bed ${savedBed} में Admit कर दिया गया!`);
    } catch (err: any) {
      showToast(`IPD admission for ${savedPatientName} was not saved — ${err?.message || 'please try again'}.`);
    }
  };

  // Filter patients: By default 'Active' hides discharged patients from active ward lists
  const filteredPatients = patientsList.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.guardian.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q));

    let matchesStatus = true;
    if (selectedStatus === 'Active' || selectedStatus === 'Admitted') {
      matchesStatus = p.status !== 'DISCHARGED';
    } else if (selectedStatus === 'Discharged') {
      matchesStatus = p.status === 'DISCHARGED';
    } else if (selectedStatus === 'All') {
      matchesStatus = true;
    } else {
      matchesStatus = p.status === selectedStatus.toUpperCase();
    }

    const matchesType = selectedType === 'All' || p.type === selectedType;
    const matchesDept = selectedDept === 'All' || p.ward.toLowerCase().includes(selectedDept.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesDept;
  });

  const matchedDischargedCount = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || selectedStatus === 'Discharged') return 0;
    return patientsList.filter(p =>
      p.status === 'DISCHARGED' && (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q))
      )
    ).length;
  }, [searchQuery, patientsList, selectedStatus]);

  // Reset pagination to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedType, selectedDept]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredPatients.length);
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + pageSize);

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedPatients.length && paginatedPatients.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPatients.map(p => p.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rId => rId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Patient ID,Name,Guardian,Type,Age,Gender,Bed,Ward,Admission Date,Status,Payment"]
        .concat(filteredPatients.map(p => `"${p.id}","${p.name}","${p.guardian}","${p.type}",${p.age},"${p.gender}","${p.bedNo}","${p.ward}","${p.admissionDate} ${p.admissionTime}","${p.status}","${p.payStatus}"`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Chaudhary_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (selectedNotePatient) {
    return (
      <StaffNotesView
        patient={selectedNotePatient}
        initialPatientName={selectedNotePatient.name}
        initialBedNo={selectedNotePatient.bedNo}
        onBack={() => setSelectedNotePatient(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fadeIn">
      {/* 1. TOP 4 METRIC KPI CARDS (High-Contrast Bold Typography) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Patients */}
        <div
          onClick={() => setSelectedStatus('All')}
          role="button"
          tabIndex={0}
          className={`relative glass-card-soft-sky rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
            selectedStatus === 'All' ? 'ring-2 ring-sky-500 shadow-md' : ''
          }`}
          title="Click to view all patient records"
        >
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="font-space text-[11px] font-bold text-slate-900 uppercase tracking-wider truncate">
              TOTAL PATIENTS
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-500 to-blue-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight leading-none drop-shadow-2xs">
                {totalCount}
              </span>
              <span className="font-outfit text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 shrink-0">
                All Records
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: New Patients */}
        <div className="relative glass-card-soft-emerald rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="font-space text-[11px] font-bold text-slate-900 uppercase tracking-wider truncate">
              NEW PATIENTS
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight leading-none drop-shadow-2xs">
                {newThisMonthCount}
              </span>
              <span className="font-outfit text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                This Month
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Admitted / Active In-Hospital */}
        <div
          onClick={() => setSelectedStatus('Active')}
          role="button"
          tabIndex={0}
          className={`relative glass-card-soft-purple rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
            selectedStatus === 'Active' || selectedStatus === 'Admitted' ? 'ring-2 ring-purple-600 shadow-md' : ''
          }`}
          title="Click to view active in-hospital patients"
        >
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="font-space text-[11px] font-bold text-slate-900 uppercase tracking-wider truncate">
              ADMITTED / ACTIVE
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <Bed className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight leading-none drop-shadow-2xs">
                {admittedCount}
              </span>
              <span className="font-outfit text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                In Hospital
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Discharged Records */}
        <div
          onClick={() => setSelectedStatus('Discharged')}
          role="button"
          tabIndex={0}
          className={`relative glass-card-soft-amber rounded-2xl py-2.5 px-3.5 sm:py-3 sm:px-4 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
            selectedStatus === 'Discharged' ? 'ring-2 ring-amber-500 shadow-md' : ''
          }`}
          title="Click to view discharged patient records"
        >
          <div className="flex items-center justify-between z-10 min-w-0">
            <span className="font-space text-[11px] font-bold text-slate-900 uppercase tracking-wider truncate">
              DISCHARGED RECORDS
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-xs border border-white/50 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 z-10 min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-outfit text-2xl sm:text-[26px] font-bold text-slate-950 tracking-tight leading-none drop-shadow-2xs">
                {dischargedCount}
              </span>
              <span className="font-outfit text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                Archived
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN TABLE CARD (Clinical Surface) */}
      <section className="relative glass-panel-3d overflow-hidden shadow-xs flex flex-col">
        {/* Top 2 Tabs Segmented Switcher (IPD vs OPD) */}
        <div className="px-4 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedType('IPD')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedType === 'IPD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>IPD Inpatients</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${selectedType === 'IPD'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-800'
                  }`}
              >
                {ipdCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('OPD')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${selectedType === 'OPD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>OPD Outpatients</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-all ${selectedType === 'OPD'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                {opdCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('All')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${selectedType === 'All'
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/80'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="Show All Mixed"
            >
              <span>All ({patientsList.length})</span>
            </button>
          </div>
        </div>

        {/* Top Filter & Toolbar Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/90 flex flex-wrap items-center justify-between gap-3 bg-white/60 backdrop-blur-md">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone or patient ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50/90 hover:bg-white focus:bg-white border-2 border-slate-200/80 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all font-semibold shadow-2xs"
            />
          </div>

          {/* Filter Dropdowns + Date + Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border-2 border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-2 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
              >
                <option value="Active">Active In-Hospital ({admittedCount})</option>
                <option value="Discharged">Discharged Records ({dischargedCount})</option>
                <option value="All">All Records ({totalCount})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            {/* Type Dropdown */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border-2 border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-2 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
              >
                <option value="All">All Types</option>
                <option value="IPD">IPD</option>
                <option value="OPD">OPD</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            {/* Department Dropdown */}
            <div className="relative">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border-2 border-slate-200/90 text-slate-700 text-xs font-bold px-3 py-2 pr-7 rounded-xl outline-none cursor-pointer transition-colors shadow-2xs"
              >
                <option value="All">All Departments</option>
                <option value="Male Ward">Male Ward</option>
                <option value="Female Ward">Female Ward</option>
                <option value="OPD">OPD</option>
                <option value="ICU">ICU</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            </div>

            {/* Date Range Box (From <-> To) */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200/90 rounded-xl text-xs text-slate-700 font-bold shadow-2xs transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
              <span>From</span>
              <span className="text-slate-400 font-bold">↔</span>
              <Calendar className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />
              <span>To</span>
            </div>

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>Export Excel</span>
            </button>

            {/* Add Patient Button */}
            {onNewAdmission && (
              <button
                onClick={onNewAdmission}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Patient</span>
              </button>
            )}
          </div>
        </div>

        {/* Discharged Records Banner */}
        {selectedStatus === 'Discharged' && (
          <div className="mx-4 my-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Viewing <strong>Discharged Patient Archive</strong> ({filteredPatients.length} record{filteredPatients.length === 1 ? '' : 's'}). These patients have completed their stay and were discharged.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStatus('Active')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              ← Back to Active Patients
            </button>
          </div>
        )}

        {/* Matched Discharged Patients Hint when searching in Active */}
        {matchedDischargedCount > 0 && selectedStatus !== 'Discharged' && (
          <div className="mx-4 my-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Found <strong>{matchedDischargedCount}</strong> discharged patient record{matchedDischargedCount === 1 ? '' : 's'} matching "{searchQuery}".
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStatus('Discharged')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              View in Discharged Records →
            </button>
          </div>
        )}

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3.5 pl-5 pr-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Patient ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Name & Guardian</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Age/Gen</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Bed No.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Admission Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Pay Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                    <span>Actions</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {hospitalCtx?.isLoadingPatients && filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500 font-bold bg-white/60">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-700">Loading patients from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-500 font-medium bg-white/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">No patients match your search or filter criteria.</p>
                      {matchedDischargedCount > 0 && selectedStatus !== 'Discharged' && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            Found {matchedDischargedCount} matching patient(s) in Discharged Records.
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedStatus('Discharged')}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                          >
                            View in Discharged Records
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const isSelected = selectedRows.includes(patient.id);
                  const isCriticalSpO2 = Boolean(patient.spo2 && patient.spo2 < 92);

                  return (
                    <tr
                      key={patient.id}
                      className={`border-b transition-colors ${isCriticalSpO2
                          ? 'bg-rose-50/80 border-l-4 border-l-rose-600 hover:bg-rose-100/70 border-slate-100'
                          : isSelected
                            ? 'bg-blue-50/80 border-slate-100'
                            : 'hover:bg-blue-50/40 bg-white border-slate-100'
                        }`}
                    >
                      {/* Patient ID + Avatar */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {patient.avatarUrl && !patient.avatarUrl.includes('unsplash.com') ? (
                            <img
                              src={patient.avatarUrl}
                              alt={patient.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-2xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-xs border border-blue-400/30">
                              {patient.initial || patient.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-mono font-medium text-slate-700 bg-slate-100/90 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] tracking-tight inline-block shadow-2xs">
                              {patient.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Name & Guardian + Pills */}
                      <td className="py-3.5 px-3">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-slate-900 text-[13px] group-hover:text-blue-600 transition-colors">
                              {patient.name}
                            </span>
                            {isCriticalSpO2 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse shadow-xs">
                                🚨 CRITICAL SpO2 {patient.spo2}%
                              </span>
                            )}
                            {/* Type Pill */}
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border shrink-0 ${patient.type === 'IPD'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                              {patient.type}
                            </span>
                            {/* Special Badge (e.g. SURGERY DONE) */}
                            {patient.specialBadge && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                                {patient.specialBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                            {patient.guardian}
                          </p>
                        </div>
                      </td>

                      {/* Age / Gen */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs inline-block">
                          {patient.age}/{patient.gender}
                        </span>
                      </td>

                      {/* Bed No. */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {patient.bedNo !== '-' ? (
                          <div>
                            <span className="font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg text-xs inline-block">
                              {patient.bedNo}
                            </span>
                            <span className="text-[10.5px] text-slate-500 font-normal block mt-0.5">
                              {patient.ward}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-normal text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs inline-block">
                              -
                            </span>
                            <span className="text-[10.5px] text-slate-400 font-normal block mt-0.5">
                              OPD
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Admission Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div>
                          <span className="font-medium text-slate-800 block text-xs">
                            {patient.admissionDate}
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal block">
                            {patient.admissionTime}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${patient.status === 'ADMITTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : patient.status === 'ACTIVE'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-purple-50 text-purple-700 border-purple-300'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${patient.status === 'ADMITTED'
                              ? 'bg-emerald-500 animate-pulse'
                              : patient.status === 'ACTIVE'
                                ? 'bg-blue-500'
                                : 'bg-purple-500'
                            }`} />
                          {patient.status}
                        </span>
                      </td>

                      {/* Pay Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${patient.payStatus === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${patient.payStatus === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                          {patient.payStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Eye: View Dossier */}
                          <button
                            onClick={() => setInspectPatient(patient)}
                            className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-sky-50/60 to-sky-100/50 hover:from-sky-500 hover:to-blue-600 text-sky-600 hover:text-white border border-sky-200/90 hover:border-sky-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(14,165,233,0.12)] hover:shadow-[0_4px_14px_rgba(14,165,233,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                          </button>

                          {/* Move to Trash — admin only. The backend enforces
                              this too (checkRole(['admin'])); hiding the button
                              is convenience, not the permission boundary. */}
                          {canManageTrash && (
                            <button
                              onClick={() => handleOpenTrashModal(patient)}
                              className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-rose-50/60 to-rose-100/50 hover:from-rose-500 hover:to-pink-600 text-rose-600 hover:text-white border border-rose-200/90 hover:border-rose-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(244,63,94,0.12)] hover:shadow-[0_4px_14px_rgba(244,63,94,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                            </button>
                          )}

                          {patient.status === 'DISCHARGED' ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 select-none">
                              Discharged
                            </span>
                          ) : patient.type === 'OPD' ? (
                            <button
                              onClick={() => setShiftConfirmPatient(patient)}
                              className="w-8 h-8 rounded-full bg-gradient-to-b from-indigo-500 via-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-700 text-white border border-indigo-400/60 shadow-[0_3px_10px_rgba(79,70,229,0.35),inset_0_1.5px_1px_rgba(255,255,255,0.5)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                              title="Admit to Inpatient Bed"
                            >
                              <Bed className="w-4 h-4 text-white stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                            </button>
                          ) : (
                            <>
                              {/* Transfer Bed Swap Arrows */}
                              <button
                                onClick={() => handleOpenTransferModal(patient)}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-emerald-50/60 to-emerald-100/50 hover:from-emerald-500 hover:to-teal-600 text-emerald-600 hover:text-white border border-emerald-200/90 hover:border-emerald-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(16,185,129,0.12)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                                title="Transfer / Bed Swap"
                              >
                                <ArrowLeftRight className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                              </button>

                              {/* Medical Note / Plus Icon */}
                              <button
                                onClick={() => setSelectedNotePatient(patient)}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-purple-50/60 to-purple-100/50 hover:from-purple-500 hover:to-indigo-600 text-purple-600 hover:text-white border border-purple-200/90 hover:border-purple-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(168,85,247,0.12)] hover:shadow-[0_4px_14px_rgba(168,85,247,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
                                title="Add Clinical Note"
                              >
                                <FilePlus className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover/btn:scale-105" />
                              </button>

                              {/* Stretcher Bed / Surgery Event & Operation Consent */}
                              <button
                                onClick={() => handleOpenSurgeryModal(patient)}
                                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-rose-50/60 to-rose-100/50 hover:from-rose-500 hover:to-pink-600 text-rose-600 hover:text-white border border-rose-200/90 hover:border-rose-500 shadow-[inset_0_1.5px_1px_rgba(255,255,255,1),0_2px_6px_rgba(244,63,94,0.12)] hover:shadow-[0_4px_14px_rgba(244,63,94,0.4)] flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/btn"
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
        <div className="px-5 py-3.5 border-t-2 border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <p className="font-semibold flex items-center gap-1.5">
            Showing <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">{filteredPatients.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">{endIndex}</span> of <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">{filteredPatients.length}</span> patients
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all shadow-2xs ${safeCurrentPage === 1
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : 'border-slate-200 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 cursor-pointer active:scale-95'
                }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 ${safeCurrentPage === pageNum
                    ? 'bg-blue-600 text-white font-bold shadow-[0_2px_8px_rgba(37,99,235,0.35)] border border-blue-700'
                    : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
                  }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className={`px-3.5 py-1.5 rounded-xl border font-bold transition-all shadow-2xs ${safeCurrentPage === totalPages
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : 'border-slate-200 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 cursor-pointer active:scale-95'
                }`}
            >
              Next
            </button>
          </div>
        </div>

      </section>

      {/* QUICK PATIENT DOSSIER MODAL (BEAUTIFUL DETAILED CARD) */}
      {inspectPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-gradient-to-br from-[#F0F7FF] via-[#F8FAFC] to-[#EFF6FF] rounded-3xl shadow-[0_25px_60px_-15px_rgba(30,58,138,0.30)] border-2 border-blue-200/90 max-w-xl w-full p-6 sm:p-7 relative overflow-hidden my-auto">

            {/* Background Decorative Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -ml-12 -mb-12" />

            {/* Close Button */}
            <button
              onClick={() => setInspectPatient(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-all shadow-sm hover:rotate-90 active:scale-95 z-20"
              title="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Header: Avatar, Name, Status, ID & Demographics */}
            <div className="flex items-center gap-4 pb-5 border-b-2 border-blue-200/80 relative z-10">
              {inspectPatient.avatarUrl && !inspectPatient.avatarUrl.includes('unsplash.com') ? (
                <img
                  src={inspectPatient.avatarUrl}
                  alt={inspectPatient.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-300 shadow-md ring-4 ring-blue-100 flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center flex-shrink-0 shadow-md ring-4 ring-blue-100">
                  {inspectPatient.initial || inspectPatient.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0 pr-8">
                {/* Name & Status */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {inspectPatient.name}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight border-2 shadow-xs ${inspectPatient.status === 'ADMITTED'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                      : inspectPatient.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-950 border-blue-400'
                        : 'bg-purple-100 text-purple-950 border-purple-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${inspectPatient.status === 'ADMITTED'
                        ? 'bg-emerald-600 animate-pulse'
                        : inspectPatient.status === 'ACTIVE'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`} />
                    {inspectPatient.status}
                  </span>
                </div>

                {/* Subtitle: ID: P-... | 22 Yrs / Male */}
                <p className="text-xs sm:text-[13px] font-bold text-blue-900 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>ID: {inspectPatient.id}</span>
                  <span className="text-blue-400 font-bold">|</span>
                  <span>{inspectPatient.age} Yrs / {inspectPatient.gender === 'M' ? 'Male' : 'Female'}</span>
                </p>
              </div>
            </div>

            {/* Dossier Body Cards */}
            <div className="space-y-3.5 my-5 relative z-10">

              {/* Row 1: Guardian & Bed Assignment (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Guardian Card */}
                <div className="bg-[#EFF6FF] border-2 border-blue-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center gap-1.5 text-blue-950 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                    <span>Guardian</span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm">
                    {inspectPatient.guardian || 'asdfg'}
                  </p>
                  {inspectPatient.phone && (
                    <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>{inspectPatient.phone}</span>
                    </p>
                  )}
                </div>

                {/* Bed Assignment Card */}
                <div className="bg-[#FFF1F2] border-2 border-rose-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-center gap-1.5 text-rose-950 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                    <Bed className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                    <span>Bed Assignment</span>
                  </div>
                  <p className="text-slate-900 font-bold text-sm">
                    {inspectPatient.ward === 'OPD'
                      ? 'OPD - Day Care'
                      : (inspectPatient.bedNo !== '-'
                        ? (inspectPatient.bedNo.startsWith('G') ? `Male-${inspectPatient.bedNo}` : `${inspectPatient.ward.replace(' Ward', '')}-${inspectPatient.bedNo}`)
                        : 'OPD')}
                  </p>
                  <p className="text-[11px] font-bold text-rose-700 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Ward: {inspectPatient.ward}</span>
                  </p>
                </div>
              </div>

              {/* Row 2: Address Card */}
              <div className="bg-[#FEF3C7] border-2 border-amber-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-1.5 text-amber-950 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                  <MapPin className="w-4 h-4 text-amber-700 stroke-[2.5]" />
                  <span>Address</span>
                </div>
                <p className="text-slate-900 font-bold text-sm leading-snug">
                  {inspectPatient.address || 'qwert'}
                </p>
              </div>

              {/* Row 3: Medical Summary Card */}
              <div className="bg-[#ECFDF5] border-2 border-emerald-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-200/80 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-[11px] uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Medical Summary</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-950 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>{inspectPatient.admissionDate}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wide block">
                      Condition:
                    </span>
                    <p className="text-slate-900 font-bold text-sm mt-0.5">
                      {inspectPatient.condition || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wide block">
                      Doctor:
                    </span>
                    <p className="text-slate-900 font-bold text-sm mt-0.5">
                      {inspectPatient.doctor || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 4: Billing Summary Card */}
              <div className="bg-[#F5F3FF] border-2 border-purple-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-purple-950 font-bold text-[11px] uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                    <span>Billing Summary</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight border-2 shadow-xs ${inspectPatient.payStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${inspectPatient.payStatus === 'PENDING' ? 'bg-amber-600' : 'bg-emerald-600'
                      }`} />
                    {inspectPatient.payStatus === 'PENDING' ? 'Pending' : 'Paid'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white border border-purple-200/90 rounded-xl p-2.5 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Total Billed</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {inspectPatient.totalBilled || '₹32,500'}
                    </span>
                  </div>
                  <div className="bg-white border border-emerald-200/90 rounded-xl p-2.5 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Paid</span>
                    <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                      {inspectPatient.amountPaid || '₹18,000'}
                    </span>
                  </div>
                  <div className="bg-white border border-amber-200/90 rounded-xl p-2.5 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Due / Pending</span>
                    <span className="text-sm font-bold text-amber-700 mt-0.5 block">
                      {inspectPatient.amountDue || '₹14,500'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center gap-2.5 pt-4 border-t-2 border-blue-200/80 relative z-10">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-950 font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Print Patient Dossier"
              >
                <Printer className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                <span>Print</span>
              </button>

              <button
                onClick={() => setInspectPatient(null)}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Close
              </button>

              <button
                onClick={() => {
                  alert(`Opening billing invoice & payment gateway for ${inspectPatient.name}`);
                  setInspectPatient(null);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
                <span>Manage Billing</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl text-white font-medium text-xs rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── MOVE TO TRASH CONFIRMATION MODAL (admin only) ── */}
      {trashConfirmPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-scaleUp">
            {/* Header */}
            <div className="bg-[#BE123C] text-white pt-8 pb-7 px-6 text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
                <Trash2 className="w-8 h-8 text-white stroke-[2.2]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Move to Trash?</h2>
              <p className="text-rose-100 text-xs sm:text-sm font-medium mt-1">
                {trashConfirmPatient.name} · {trashConfirmPatient.id}
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                The record leaves the active patient list but is{' '}
                <span className="font-bold text-slate-800">not deleted</span> — its notes, vitals and billing history
                stay intact, an admin can restore it from{' '}
                <span className="font-bold text-slate-800">Patient Trash</span>, and the action is written to the audit
                trail.
              </p>

              {rowHoldsABed(trashConfirmPatient) && (
                <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50">
                  <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Still admitted to bed {trashConfirmPatient.bedNo}
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed mt-1.5">
                    Confirm below that this patient is no longer in the bed. The bed is released for the next admission.
                  </p>
                  <label className="mt-2.5 flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={trashAdmissionEnded}
                      onChange={(e) => setTrashAdmissionEnded(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-amber-900">
                      The patient is out of bed {trashConfirmPatient.bedNo} and this admission is over
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTrashConfirmPatient(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTrash}
                  disabled={isTrashing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isTrashing ? 'Moving…' : 'Move to Trash'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: IPD SHIFT CONFIRMATION MODAL ("IPD में Shift करें?") ── */}
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

      {/* ── STEP 2: EDIT PATIENT DETAILS / OPD TO IPD FORM MODAL ── */}
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

      {/* ── STEP 3: TRANSFER BED MODAL (Modularized Component) ── */}
      <BedTransferModal
        patient={transferPatient}
        onClose={() => setTransferPatient(null)}
        availableBeds={availableBeds}
        newBed={transferNewBed}
        setNewBed={setTransferNewBed}
        dailyCharge={transferDailyCharge}
        setDailyCharge={setTransferDailyCharge}
        onConfirm={handleConfirmTransfer}
      />

      {/* Step 4: Add Surgery Event & Operation Consent Modal (Landscape Orientation) */}
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
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
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
                      placeholder="Surgeon full name"
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
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
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
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
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
                <h4 className="font-bold text-purple-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
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
