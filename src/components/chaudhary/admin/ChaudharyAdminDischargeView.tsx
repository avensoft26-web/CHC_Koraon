import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Printer, 
  BedDouble, 
  AlertTriangle, 
  Calendar,
  X,
  Plus,
  ArrowLeft,
  Pill,
  Check,
  Stethoscope,
  ChevronDown,
  Sparkles,
  Phone,
  ShieldCheck,
  User,
  HeartPulse,
  Activity,
  FileCheck2,
  Trash2,
  Users,
  Receipt,
  RotateCcw,
  Wallet
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { api } from '../../../services/api';
import { fetchHospitalDoctors } from '../../../utils/hospitalDoctors';
import { MedicineAutocomplete } from '../../common/MedicineAutocomplete';

export interface DischargePatientRecord {
  id: string;
  name: string;
  guardian: string;
  type: 'IPD' | 'OPD' | 'EMERGENCY';
  age: number;
  gender: 'Male' | 'Female';
  bedNo: string;
  ward: string;
  admissionDate: string;
  phone: string;
  condition: string;
  doctor: string;
  status: string;
  treatmentSummaryDefault: string;
  defaultMedicines: AdvisedMedicineRow[];
}

export interface AdvisedMedicineRow {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface DischargeCandidate {
  id: string;
  name: string;
  uhid: string;
  bed: string;
  ward: string;
  doctor: string;
  admittedDate: string;
  diagnosis: string;
  billingClearance: 'CLEARED' | 'PENDING';
  pharmacyClearance: 'CLEARED' | 'PENDING';
  doctorClearance: 'APPROVED' | 'AWAITING';
  dueAmount: number;
}

interface ChaudharyAdminDischargeViewProps {
  onBack?: () => void;
}

export const ChaudharyAdminDischargeView: React.FC<ChaudharyAdminDischargeViewProps> = ({
  onBack,
}) => {
  const [activeSubView, setActiveSubView] = useState<'form' | 'queue'>('form');

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedPatient, setSelectedPatient] = useState<DischargePatientRecord | null>(null);

  // Attending doctor / hospital helpline come from the database, never hard-coded
  const [doctorName, setDoctorName] = useState('');
  const [hospitalContact, setHospitalContact] = useState('');
  const [dischargeDate, setDischargeDate] = useState(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  });
  const [dischargeTime, setDischargeTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  });
  const [dischargeType, setDischargeType] = useState<'Normal' | 'LAMA' | 'Transfer'>('Normal');
  const [treatmentSummary, setTreatmentSummary] = useState('');
  
  // Optional medicines section state - starts empty so user can add one by one
  const [includeMedicines, setIncludeMedicines] = useState(true);
  const [medicines, setMedicines] = useState<AdvisedMedicineRow[]>([]);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dischargePatients, setDischargePatients] = useState<DischargePatientRecord[]>([]);
  const [alreadyDischargedList, setAlreadyDischargedList] = useState<any[]>([]);
  const [billingEstimate, setBillingEstimate] = useState<any>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);
  const [isDischarging, setIsDischarging] = useState<boolean>(false);

  // Quick payment collection modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Discharge success celebration modal states
  const [isDischargeSuccessModalOpen, setIsDischargeSuccessModalOpen] = useState(false);
  const [dischargeSuccessData, setDischargeSuccessData] = useState<any>(null);

  const loadEstimate = async (patientId: string) => {
    setIsLoadingEstimate(true);
    try {
      const res = await api.discharge.getEstimate(patientId);
      if (res?.success && res.estimate) {
        setBillingEstimate(res.estimate);
        if (res.estimate.pendingAmount > 0) {
          setPaymentAmount(res.estimate.pendingAmount);
        }
      }
    } catch (err) {
      console.warn('Failed to load discharge bill estimate:', err);
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [docs, setRes] = await Promise.all([
        fetchHospitalDoctors().catch(() => []),
        api.settings.get().catch(() => null),
      ]);
      if (!mounted) return;
      if (docs.length > 0) setDoctorName(docs[0].name);
      const info = setRes?.success ? setRes.settings?.hospitalInfo : null;
      if (info?.contact) setHospitalContact(String(info.contact));
    })();
    return () => { mounted = false; };
  }, []);

  const filteredPatients = dischargePatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const matchedDischargedPatients = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    return alreadyDischargedList.filter((p: any) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.patient_id && p.patient_id.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q))
    );
  }, [searchQuery, alreadyDischargedList]);

  const formatNiceDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch {
      // fallback
    }
    return isoString;
  };

  const handleSelectPatient = (patient: DischargePatientRecord) => {
    setSelectedPatient(patient);
    setSearchQuery(`${patient.name} | ${patient.id}`);
    setTreatmentSummary(patient.treatmentSummaryDefault);
    // Keep medicines empty so user can add one by one with nothing pre-filled!
    setMedicines([]);
    setIncludeMedicines(true);
    setIsDropdownOpen(false);
    loadEstimate(patient.id);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setSearchQuery('');
    setTreatmentSummary('');
    setMedicines([]);
    setBillingEstimate(null);
  };

  const handleAddMedicineRow = () => {
    const newRow: AdvisedMedicineRow = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name: '',
      dose: '',
      frequency: '',
      duration: '',
    };
    setMedicines((prev) => [...prev, newRow]);
    setIncludeMedicines(true);
  };

  const handleRemoveMedicineRow = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMedicineRow = (id: string, field: keyof AdvisedMedicineRow, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleGenerateDischargeSummary = async () => {
    if (!selectedPatient) {
      setToastMessage('⚠️ Please search and select a patient before generating the discharge summary.');
      setTimeout(() => setToastMessage(null), 3500);
      if (searchInputRef.current) searchInputRef.current.focus();
      return;
    }

    if (selectedPatient.status === 'Discharged') {
      setToastMessage(`⚠️ Patient ${selectedPatient.name} is already discharged!`);
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // Strict payment check
    const pendingDue = Math.max(0, Math.round(Number(billingEstimate?.pendingAmount || 0)));
    if (pendingDue > 0) {
      setToastMessage(`⚠️ भुगतान बाकी है (₹${pendingDue.toLocaleString('en-IN')})! डिस्चार्ज से पहले बिल का भुगतान अनिवार्य है।`);
      setPaymentAmount(pendingDue);
      setIsPaymentModalOpen(true);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    if (!treatmentSummary.trim() && !selectedPatient.treatmentSummaryDefault) {
      setToastMessage('⚠️ Please write the hospital course summary before generating the discharge summary.');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIsDischarging(true);
    try {
      // 1. Finalize discharge & release bed in backend
      const res = await api.discharge.create({
        patientId: selectedPatient.id,
        doctorName: selectedPatient.doctor || doctorName || '',
        dischargeDate: new Date(),
        dischargeTime: dischargeTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosis: selectedPatient.condition || 'Discharged in stable condition',
        summary: treatmentSummary.trim() || selectedPatient.treatmentSummaryDefault || '',
        advisedMedicines: medicines.filter(m => m.name.trim() !== ''),
        dischargedBy: doctorName || 'Authorized Medical Officer'
      });

      if (!res?.success) {
        throw new Error((res as any)?.message || 'Discharge process failed');
      }

      // 2. Fetch finalized bill estimate
      const estRes = await api.discharge.getEstimate(selectedPatient.id).catch(() => null);
      if (estRes?.success && estRes.estimate) {
        setBillingEstimate(estRes.estimate);
      }

      setDischargeSuccessData({
        patientName: selectedPatient.name,
        patientId: selectedPatient.id,
        ward: selectedPatient.ward,
        bedNo: selectedPatient.bedNo,
        doctor: selectedPatient.doctor || doctorName || 'Attending Doctor',
        dischargeDate: dischargeDate,
        dischargeTime: dischargeTime,
        grandTotal: estRes?.estimate?.grandTotal || billingEstimate?.grandTotal || 0,
        totalPaid: estRes?.estimate?.totalPaid || billingEstimate?.totalPaid || 0,
      });

      setIsDischargeSuccessModalOpen(true);
      setToastMessage(`🎉 मरीज ${selectedPatient.name} का डिस्चार्ज सफलतापूर्वक संपन्न हुआ! (Bed ${selectedPatient.bedNo} Released)`);

      // Broadcast changes so beds and patient lists across tabs update
      try {
        window.dispatchEvent(new Event('chaudhary_patients_updated'));
        window.dispatchEvent(new Event('chaudhary_beds_updated'));
      } catch {}

      reloadPatients();
    } catch (err: any) {
      console.error('Discharge processing error:', err);
      const errRes = err?.response?.data;
      const errMsg = errRes?.message || err?.message || 'Discharge process failed';
      setToastMessage(`⚠️ ${errMsg}`);

      if (errRes?.code === 'PAYMENT_PENDING' || (errRes?.pendingAmount && errRes.pendingAmount > 0)) {
        setPaymentAmount(errRes.pendingAmount || pendingDue);
        setIsPaymentModalOpen(true);
      }
    } finally {
      setIsDischarging(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleRecordPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPatient) return;

    if (!paymentAmount || paymentAmount <= 0) {
      setToastMessage('⚠️ कृपया वैध राशि (Valid Amount) दर्ज करें।');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await api.billing.addPayment(selectedPatient.id, {
        amount: Number(paymentAmount),
        mode: paymentMode,
        notes: paymentNotes || `Discharge clearance payment (${paymentMode})`
      });

      if (res?.success) {
        setToastMessage(`✅ ₹${Number(paymentAmount).toLocaleString('en-IN')} का भुगतान सफलतापूर्वक दर्ज किया गया!`);
        setIsPaymentModalOpen(false);
        setPaymentNotes('');
        await loadEstimate(selectedPatient.id);
        reloadPatients();
        try {
          window.dispatchEvent(new Event('chaudhary_billing_updated'));
          window.dispatchEvent(new Event('chaudhary_patients_updated'));
        } catch {}
      } else {
        throw new Error((res as any)?.message || 'Payment recording failed');
      }
    } catch (err: any) {
      console.error('Payment record error:', err);
      setToastMessage(`⚠️ भुगतान दर्ज करने में त्रुटि: ${err?.response?.data?.message || err?.message || 'Server error'}`);
    } finally {
      setIsSubmittingPayment(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const [candidates, setCandidates] = useState<DischargeCandidate[]>([]);

  const reloadPatients = async () => {
    try {
      const [patRes, billRes] = await Promise.all([
        api.patients.getAll().catch(() => null),
        api.billing.getAll().catch(() => null),
      ]);
      if (patRes?.success && Array.isArray(patRes.patients)) {
        // 1. Separate currently active/admitted patients from already discharged patients
        const activePatients = patRes.patients.filter((p: any) => {
          const s = String(p.status || '').toLowerCase().trim();
          return s !== 'discharged';
        });

        const dischargedOnly = patRes.patients.filter((p: any) => {
          const s = String(p.status || '').toLowerCase().trim();
          return s === 'discharged';
        });
        setAlreadyDischargedList(dischargedOnly);

        // 2. Only active admitted patients are candidates for discharge
        const livePatients: DischargePatientRecord[] = activePatients.map((p: any) => ({
          id: p.patient_id || p._id,
          name: p.name || 'Patient',
          guardian: p.guardian_name || '—',
          type: (p.patient_type || (p.bed_no && p.bed_no !== '-' ? 'IPD' : 'OPD')) as 'IPD' | 'OPD' | 'EMERGENCY',
          age: p.age || 0,
          gender: (p.gender === 'Female' || p.gender === 'F') ? 'Female' : 'Male',
          bedNo: p.bed_no || '-',
          ward: p.ward_type || 'General Ward',
          admissionDate: p.admission_date || new Date().toISOString(),
          phone: p.mobile || '—',
          condition: p.problem || '—',
          doctor: p.doctor_assigned || '—',
          status: p.status || 'Admitted',
          treatmentSummaryDefault: '',
          defaultMedicines: []
        }));
        setDischargePatients(livePatients);

        const inpatients = activePatients.filter((p: any) => p.bed_no && p.bed_no !== '-');
        const billings = billRes?.success && Array.isArray(billRes.billings) ? billRes.billings : [];

        if (inpatients.length > 0) {
          const liveCandidates: DischargeCandidate[] = inpatients.slice(0, 10).map((p: any, idx: number) => {
            const bill = billings.find((b: any) => b.patient_id === p.patient_id || b.uhid === p.patient_id);
            const due = bill ? Math.max(0, (bill.total_amount || 0) - (bill.paid_amount || 0)) : 0;
            return {
              id: `live-dc-${idx + 1}`,
              name: p.name || 'Patient',
              uhid: p.patient_id || '—',
              bed: p.bed_no || '—',
              ward: p.ward_type || 'General Ward',
              doctor: p.doctor_assigned || '—',
              admittedDate: p.admission_date ? new Date(p.admission_date).toLocaleDateString('en-IN') : '—',
              diagnosis: p.problem || '—',
              billingClearance: due <= 0 ? 'CLEARED' : 'PENDING',
              pharmacyClearance: 'PENDING',
              doctorClearance: 'APPROVED',
              dueAmount: due,
            };
          });
          setCandidates(liveCandidates);
        } else {
          setCandidates([]);
        }
      }
    } catch (err) {
      console.warn('Failed to load patients in discharge view:', err);
    }
  };

  React.useEffect(() => {
    reloadPatients();
  }, []);

  return (
    <div className="w-full space-y-3 pb-6 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-800 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-emerald-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Main Container Card - Full Width (Zero wasted left/right margins) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative w-full">
        {/* Header Bar - Compact & Refined */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Patient Discharge Center
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Switcher Pills */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveSubView('form')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubView === 'form' 
                    ? 'bg-white text-emerald-700 shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Discharge Form
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView('queue')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubView === 'queue' 
                    ? 'bg-white text-emerald-700 shadow-xs font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Queue ({candidates.length})
              </button>
            </div>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer group px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>

        {activeSubView === 'queue' ? (
          /* Queue Table */
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bed Clearance & Active Queue</h3>
              </div>
              <button
                onClick={() => setActiveSubView('form')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Discharge Slip</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-black border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Patient / UHID</th>
                    <th className="py-3 px-4">Ward & Bed</th>
                    <th className="py-3 px-4">Doctor Sign-Off</th>
                    <th className="py-3 px-4">Billing Settlement</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                        <p className="font-mono text-xs text-slate-500">{c.uhid}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 text-sm">{c.bed}</span>
                        <p className="text-xs text-slate-500">{c.ward}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {c.billingClearance === 'CLEARED' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cleared (₹0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Due ₹{c.dueAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const p = dischargePatients.find(x => x.name === c.name || x.id === c.uhid) || dischargePatients[0];
                            if (p) {
                              handleSelectPatient(p);
                              setActiveSubView('form');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold cursor-pointer shadow-xs"
                        >
                          Discharge Summary
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* SLEEK & BEAUTIFULLY PROPORTIONED FORM */
          <div className="mt-4 space-y-4">
            {/* 1. PATIENT SEARCH BAR */}
            <div className="relative w-full">
              <div className="relative rounded-xl border border-slate-300 bg-white px-4 pt-3 pb-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs">
                <label className="absolute -top-2.5 left-3.5 px-1.5 bg-white text-xs font-bold text-emerald-700 select-none">
                  Search Patient by Name or UHID *
                </label>
                <div className="flex items-center justify-between">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) handleClearPatient();
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Type patient name or ID to select..."
                    className="w-full text-sm sm:text-base font-semibold text-slate-800 outline-none bg-transparent placeholder:text-slate-400 py-0.5"
                  />
                  {selectedPatient ? (
                    <button
                      type="button"
                      onClick={handleClearPatient}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Clear patient"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (filteredPatients.length > 0 || matchedDischargedPatients.length > 0) && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {/* Active Admitted Patients (Eligible for Discharge) */}
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-900 text-sm">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            <span className="font-mono text-emerald-700 font-bold">{p.id}</span>
                            {' • '}
                            <span>{p.ward} {p.bedNo && p.bedNo !== '-' ? `(Bed: ${p.bedNo})` : ''}</span>
                          </p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200">
                          {p.bedNo && p.bedNo !== '-' ? p.bedNo : 'Admitted'}
                        </span>
                      </button>
                    ))}

                    {/* Helpful notice if search matches an already discharged patient */}
                    {matchedDischargedPatients.length > 0 && (
                      <div className="p-3 bg-amber-50/90 border-t border-amber-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pehle se Discharge ho chuke Patients ({matchedDischargedPatients.length}):</span>
                        </div>
                        <div className="space-y-1">
                          {matchedDischargedPatients.slice(0, 3).map((dp: any) => (
                            <div key={dp.patient_id || dp._id} className="text-[11px] text-amber-800 flex items-center justify-between">
                              <span className="font-semibold">{dp.name} ({dp.patient_id})</span>
                              <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                Discharged {dp.discharge_date ? `on ${new Date(dp.discharge_date).toLocaleDateString('en-IN')}` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          ℹ️ In patients ka discharge pehle hi ho chuka hai. Inka record "Patient Records" me surakshit hai.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 2. REFINED PATIENT DOSSIER CARD (OR EMPTY PLACEHOLDER) */}
            {selectedPatient ? (
              <div className="rounded-xl bg-gradient-to-r from-emerald-50/50 via-slate-50/30 to-teal-50/30 border border-emerald-200/90 p-4 shadow-2xs space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-200/60">
                  {/* Left: Avatar + Identity */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-xs flex-shrink-0">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          {selectedPatient.name}
                        </h2>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-md border border-emerald-300">
                          {selectedPatient.id}
                        </span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {selectedPatient.type}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-600 font-medium">
                          • <span className="font-semibold text-slate-700">Diagnosis:</span> {selectedPatient.condition}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Admission date & change */}
                  <div className="flex items-center gap-2.5 self-start sm:self-auto text-xs sm:text-sm">
                    <span className="text-xs sm:text-sm text-slate-600">
                      Admitted: <strong className="text-slate-800 font-bold">{formatNiceDate(selectedPatient.admissionDate)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleClearPatient}
                      className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* 4 Metrics in a Clean Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white/90 px-3 py-2 rounded-lg border border-emerald-100/80 shadow-2xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Age & Gender</p>
                    <p className="font-bold text-slate-800 mt-1 text-sm sm:text-base">
                      {selectedPatient.age} Yrs • {selectedPatient.gender}
                    </p>
                  </div>

                  <div className="bg-white/90 px-3 py-2 rounded-lg border border-emerald-100/80 shadow-2xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ward & Bed No.</p>
                    <p className="font-bold text-slate-800 mt-1 text-sm sm:text-base truncate" title={`${selectedPatient.ward} (${selectedPatient.bedNo})`}>
                      {selectedPatient.bedNo} • <span className="text-slate-600 font-medium">{selectedPatient.ward}</span>
                    </p>
                  </div>

                  <div className="bg-white/90 px-3 py-2 rounded-lg border border-emerald-100/80 shadow-2xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Guardian / Kin</p>
                    <p className="font-bold text-slate-800 mt-1 text-sm sm:text-base truncate" title={selectedPatient.guardian}>
                      {selectedPatient.guardian || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white/90 px-3 py-2 rounded-lg border border-emerald-100/80 shadow-2xs">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contact Phone</p>
                    <p className="font-bold text-slate-800 mt-1 text-sm sm:text-base font-mono truncate" title={selectedPatient.phone}>
                      {selectedPatient.phone}
                    </p>
                  </div>
                </div>

                {/* ── AUTO-CALCULATED FINAL BILL SUMMARY CARD (Stay Days × Bed Rate) ── */}
                <div className="mt-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 border border-slate-700/80 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700/80 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            ऑटो-कैलकुलेटेड फाइनल बिल (Stay Days × Bed Rate)
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                            NABH Instant Calc
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          (भर्ती के दिन × वार्ड चार्ज) + डॉक्टर विजिट + सर्जरी/सेवाएं - एडवांस जमा
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => selectedPatient && loadEstimate(selectedPatient.id)}
                        disabled={isLoadingEstimate}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-600 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="ताज़ा गणना करें"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isLoadingEstimate ? 'animate-spin' : ''}`} />
                        <span>Recalculate</span>
                      </button>
                      <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full border ${
                        (billingEstimate?.pendingAmount || 0) <= 0
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {(billingEstimate?.pendingAmount || 0) <= 0
                          ? '✓ No Dues (Cleared)'
                          : `Due: ₹${(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  </div>

                  {/* 4 Calculation Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                    <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                      <span className="text-xs text-slate-300 uppercase font-bold block">1. Stay Tariff (दिन × रेट)</span>
                      <p className="font-mono font-bold text-white text-sm sm:text-base mt-1">
                        ₹{(billingEstimate?.items || [])
                          .filter((i: any) => i.name?.startsWith('Bed Charge'))
                          .reduce((sum: number, i: any) => sum + ((i.fee || 0) * (i.days || 1)), 0)
                          .toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-emerald-400 block mt-1 truncate">
                        {(billingEstimate?.items || []).find((i: any) => i.name?.startsWith('Bed Charge'))?.days || 1} Days @ ₹{(billingEstimate?.dailyCharge || 0)}/day
                      </span>
                    </div>

                    <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                      <span className="text-xs text-slate-300 uppercase font-bold block">2. Doctor & OT Charges</span>
                      <p className="font-mono font-bold text-white text-sm sm:text-base mt-1">
                        ₹{(billingEstimate?.items || [])
                          .filter((i: any) => i.name?.startsWith('Doctor') || i.name?.startsWith('Surgery'))
                          .reduce((sum: number, i: any) => sum + ((i.fee || 0) * (i.days || 1)), 0)
                          .toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-slate-400 block mt-1 truncate">
                        Consultations & Procedures
                      </span>
                    </div>

                    <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">
                      <span className="text-xs text-slate-300 uppercase font-bold block">3. Advance Deposited (- जमा)</span>
                      <p className="font-mono font-bold text-emerald-400 text-sm sm:text-base mt-1">
                        -₹{(billingEstimate?.totalPaid || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-slate-400 block mt-1 truncate">
                        {(billingEstimate?.payments || []).length} Receipts logged
                      </span>
                    </div>

                    <div className={`p-3 rounded-lg border ${
                      (billingEstimate?.pendingAmount || 0) <= 0
                        ? 'bg-emerald-950/40 border-emerald-700/60'
                        : 'bg-rose-950/40 border-rose-700/60'
                    }`}>
                      <span className="text-xs text-slate-200 uppercase font-bold block">4. Net Due Payable (शेष)</span>
                      <p className={`font-mono font-black text-base sm:text-lg mt-1 ${
                        (billingEstimate?.pendingAmount || 0) <= 0 ? 'text-emerald-300' : 'text-rose-400'
                      }`}>
                        ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-slate-300 block mt-1 truncate">
                        Gross Total: ₹{(billingEstimate?.grandTotal || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── REAL-TIME FINANCIAL CLEARANCE STATUS / BLOCKED BANNER ── */}
                {(billingEstimate?.pendingAmount || 0) > 0 ? (
                  <div className="mt-3 bg-gradient-to-r from-rose-50 via-amber-50/70 to-rose-50 border-2 border-rose-300 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-black text-rose-950 tracking-tight">
                            भुगतान बाकी है (Payment Pending: ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')})
                          </h4>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                            Discharge Blocked
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-rose-800 font-medium mt-0.5">
                          मरीज का ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')} का बिल बकाया है। हॉस्पिटल नियमानुसार पेमेंट पूरा होने के बाद ही डिस्चार्ज संभव है।
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentAmount(billingEstimate?.pendingAmount || 0);
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all shrink-0 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 stroke-[2.5]" />
                      <span>₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')} जमा करें (Pay & Clear)</span>
                    </button>
                  </div>
                ) : (
                  billingEstimate && (
                    <div className="mt-3 bg-emerald-50/90 border border-emerald-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-emerald-950 animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
                        <span className="text-xs sm:text-sm font-bold">
                          अस्पताल बिल 100% चुकता (₹0 Due) — मरीज डिस्चार्ज प्रक्रिया के लिए अधिकृत है।
                        </span>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 bg-emerald-600 text-white rounded-full self-start sm:self-auto">
                        Financial Clearance: CLEARED ✓
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50/80 border border-dashed border-slate-300 p-4 text-center flex items-center justify-center gap-2.5">
                <User className="w-5 h-5 text-slate-400 stroke-[2]" />
                <p className="text-sm font-bold text-slate-500">No Patient Selected</p>
              </div>
            )}

            {/* 3. BALANCED 2-COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
              {/* Left Column: Doctor & Schedule (5 cols) */}
              <div className="lg:col-span-5 space-y-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  Authorization & Timings
                </h3>

                {/* Doctor Name */}
                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-2.5 pb-2">
                  <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-xs font-bold text-emerald-700 select-none">
                    Attending Physician *
                  </label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm sm:text-base font-bold text-slate-900 py-0.5">{selectedPatient?.doctor || doctorName || '—'}</p>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Treating Doctor
                    </span>
                  </div>
                </div>

                {/* Discharge Date & Time (2 Cols) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative rounded-xl border border-slate-300 bg-white px-3 pt-2.5 pb-2 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-xs font-bold text-emerald-700 select-none">
                      Discharge Date *
                    </label>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={dischargeDate}
                        onChange={(e) => setDischargeDate(e.target.value)}
                        className="w-full text-sm sm:text-base font-bold text-slate-800 outline-none bg-transparent py-0.5"
                        placeholder="DD-MM-YYYY"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-slate-300 bg-white px-3 pt-2.5 pb-2 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-xs font-bold text-emerald-700 select-none">
                      Discharge Time *
                    </label>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={dischargeTime}
                        onChange={(e) => setDischargeTime(e.target.value)}
                        className="w-full text-sm sm:text-base font-bold text-slate-800 outline-none bg-transparent py-0.5"
                        placeholder="HH:MM"
                      />
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Classification Pills */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Classification
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Normal', 'LAMA', 'Transfer'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDischargeType(type)}
                        className={`py-2 px-1 rounded-xl font-bold text-center border text-xs sm:text-sm transition-all cursor-pointer ${
                          dischargeType === type
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-extrabold'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {type === 'Normal' ? 'Normal (Cured)' : type === 'LAMA' ? 'LAMA' : 'Transfer'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Treatment Summary (7 cols) */}
              <div className="lg:col-span-7 space-y-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Treatment Summary & Hospital Course
                  </h3>
                </div>

                <div className="relative rounded-xl border border-slate-300 bg-white px-3.5 pt-3 pb-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all flex-1 flex flex-col">
                  <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-xs font-bold text-emerald-700 select-none">
                    Clinical Notes / Discharge Abstract *
                  </label>
                  <textarea
                    value={treatmentSummary}
                    onChange={(e) => setTreatmentSummary(e.target.value)}
                    rows={4}
                    placeholder="Describe clinical progress, therapeutic interventions, response to medication..."
                    className="w-full text-sm sm:text-base font-medium text-slate-800 outline-none bg-transparent resize-y placeholder:text-slate-400 leading-relaxed min-h-[110px]"
                  />
                </div>
              </div>
            </div>

            {/* 4. ADVISED MEDICINES PRESCRIPTION CARD (OPTIONAL WITH HIDE/REMOVE TOGGLE) */}
            <div className="bg-slate-50/40 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3 transition-all">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider">
                    Advised Discharge Medications (Rx)
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Optional
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {includeMedicines ? (
                    <>
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Add Medicine</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncludeMedicines(false)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-rose-200 transition-all"
                        title="Remove advised medicines section"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                        <span>Remove / Skip</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIncludeMedicines(true);
                        if (medicines.length === 0) {
                          setMedicines([{ id: '1', name: '', dose: '', frequency: '', duration: '' }]);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Add Discharge Medications</span>
                    </button>
                  )}
                </div>
              </div>

              {includeMedicines ? (
                /* Compact Prescription Table */
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/80 text-slate-700 uppercase text-xs font-black border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-[36%]">Medicine Name</th>
                        <th className="py-2.5 px-3 w-[20%]">Dose</th>
                        <th className="py-2.5 px-3 w-[24%]">Frequency</th>
                        <th className="py-2.5 px-3 w-[14%]">Duration</th>
                        <th className="py-2.5 px-2 text-center w-[6%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medicines.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-4 text-center bg-slate-50/50">
                            <div className="flex flex-col items-center justify-center gap-2.5">
                              <p className="text-sm text-slate-600 font-medium">
                                No discharge medications prescribed yet.
                              </p>
                              <button
                                type="button"
                                onClick={handleAddMedicineRow}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>+ Add Medicine</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        medicines.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <MedicineAutocomplete
                                value={row.name}
                                onChange={(val) => handleUpdateMedicineRow(row.id, 'name', val)}
                                onSelectMedicine={(med) => {
                                  handleUpdateMedicineRow(row.id, 'name', med.name);
                                  if (!row.dose) {
                                    handleUpdateMedicineRow(
                                      row.id,
                                      'dose',
                                      med.type === 'Tablet' ? '1 Tab' : med.type === 'Capsule' ? '1 Cap' : med.type === 'Injection' ? '1 Amp' : '1 Dose'
                                    );
                                  }
                                  if (!row.frequency) {
                                    handleUpdateMedicineRow(
                                      row.id,
                                      'frequency',
                                      med.defaultFrequency.split(' ')[0] || '1-0-1'
                                    );
                                  }
                                  if (!row.duration) {
                                    handleUpdateMedicineRow(row.id, 'duration', med.defaultDuration || '5 Days');
                                  }
                                }}
                                placeholder="Type medicine name..."
                                inputClassName="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-600 font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:normal"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.dose}
                                onChange={(e) => handleUpdateMedicineRow(row.id, 'dose', e.target.value)}
                                placeholder="Dose (e.g. 1 Tab)"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-600 font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:normal"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.frequency}
                                onChange={(e) => handleUpdateMedicineRow(row.id, 'frequency', e.target.value)}
                                placeholder="Frequency (e.g. BD)"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-600 font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:normal"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.duration}
                                onChange={(e) => handleUpdateMedicineRow(row.id, 'duration', e.target.value)}
                                placeholder="Duration (e.g. 5 Days)"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-600 font-semibold text-slate-900 bg-white placeholder:text-slate-400 placeholder:normal"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedicineRow(row.id)}
                                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-200 flex items-center justify-center mx-auto transition-all cursor-pointer"
                                title="Remove medicine"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {medicines.length > 0 && (
                    <div className="p-2.5 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 hover:border-emerald-500 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>+ Add Another Medicine</span>
                      </button>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">
                        Total {medicines.length} medicine{medicines.length > 1 ? 's' : ''} added
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Collapsed / Skipped State */
                <div className="bg-white/80 border border-dashed border-slate-300 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-600 font-medium">
                    No home medications prescribed (Section skipped). Patient will be discharged without prescription schedule.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIncludeMedicines(true);
                      if (medicines.length === 0) {
                        setMedicines([{ id: '1', name: '', dose: '', frequency: '', duration: '' }]);
                      }
                    }}
                    className="mt-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Click here to add advised medicines
                  </button>
                </div>
              )}
            </div>

            {/* 5. BOTTOM ACTIONS */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Digitally signed & verified by Chaudhary Hospital HMIS.</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleClearPatient}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Reset Form
                </button>

                <button
                  type="button"
                  onClick={handleGenerateDischargeSummary}
                  disabled={isDischarging}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                    (billingEstimate?.pendingAmount || 0) > 0
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 active:scale-98'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20 active:scale-98'
                  }`}
                >
                  {(billingEstimate?.pendingAmount || 0) > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                      <span>Payment Due (₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}) — Pay to Discharge</span>
                    </>
                  ) : isDischarging ? (
                    <>
                      <RotateCcw className="w-4 h-4 stroke-[2.5] animate-spin" />
                      <span>Processing Discharge...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Complete Discharge & Release Bed (मरीज डिस्चार्ज करें)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINTABLE DISCHARGE SUMMARY LETTERHEAD MODAL */}
      {isSummaryModalOpen && selectedPatient && (
        <Modal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          title="Hospital Discharge Summary Slip"
          maxWidth="2xl"
        >
          <div className="p-4 sm:p-6 space-y-4 bg-white text-slate-900">
            {/* Header Letterhead */}
            <div className="border-b-2 border-emerald-600 pb-3 text-center relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                  C
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  CHAUDHARY HOSPITAL & RESEARCH INSTITUTE
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                NABH Accredited Tertiary Care Center • 24x7 Emergency, Trauma & Critical Care
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Civil Lines Road, Opp. District Court, Gorakhpur (U.P.) • Tel: 0551-220011
              </p>
              <div className="mt-2.5 inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                Official Inpatient Discharge Summary
              </div>
            </div>

            {/* Patient & Admission Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Patient Name</p>
                <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                  {selectedPatient.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">UHID / Patient ID</p>
                <p className="font-mono font-bold text-emerald-700 text-sm mt-0.5">
                  {selectedPatient.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Age / Gender</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {selectedPatient.age} Yrs / {selectedPatient.gender}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Ward & Bed No.</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {selectedPatient.ward} • {selectedPatient.bedNo}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Date of Admission</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {formatNiceDate(selectedPatient.admissionDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Date & Time of Discharge</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {dischargeDate} at {dischargeTime}
                </p>
              </div>
            </div>

            {/* Consultant Doctor */}
            <div className="flex items-center justify-between text-xs sm:text-sm px-1 font-medium">
              <div>
                <span className="text-slate-500">Treating Consultant: </span>
                <span className="font-bold text-slate-900">{selectedPatient?.doctor || doctorName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500">Classification: </span>
                <span className="font-bold text-emerald-800">{dischargeType} Discharge</span>
              </div>
            </div>

            {/* Clinical Diagnosis & Summary */}
            <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs sm:text-sm text-emerald-800">
                1. Diagnosis & Hospital Course Summary
              </h4>
              <p className="text-slate-700 font-normal leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm">
                {treatmentSummary.trim() || selectedPatient?.treatmentSummaryDefault
                  ? (treatmentSummary || selectedPatient?.treatmentSummaryDefault)
                  : <span className="italic text-slate-400">No hospital course summary has been written yet — fill it in before generating the discharge summary.</span>}
              </p>
            </div>

            {/* Advised Discharge Medicines (Optional) */}
            <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs sm:text-sm text-emerald-800">
                2. Advised Discharge Medications (Rx)
              </h4>
              {includeMedicines && medicines.filter(m => m.name.trim() !== '').length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Medicine Name</th>
                        <th className="py-2 px-3">Dose</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {medicines.filter(m => m.name.trim() !== '').map((med, index) => (
                        <tr key={med.id || index} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono text-slate-400">{index + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{med.name}</td>
                          <td className="py-2 px-3 text-slate-700">{med.dose || '-'}</td>
                          <td className="py-2 px-3 text-slate-700">{med.frequency || '-'}</td>
                          <td className="py-2 px-3 text-slate-700">{med.duration || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 italic text-xs sm:text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                  No home medications prescribed (Routine discharge without medication schedule).
                </p>
              )}
            </div>

            {/* Follow-up & Red Flags */}
            <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs sm:text-sm text-slate-600">
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs sm:text-sm text-emerald-800">
                3. Follow-up & Home Care Instructions
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Review in OPD with {selectedPatient?.doctor || doctorName || 'your treating consultant'} after 5 days.</li>
                <li>Normal light diet with plenty of oral fluids. Avoid strenuous exertion.</li>
                <li>In case of emergency, contact the hospital helpline: {hospitalContact || '—'}.</li>
              </ul>
            </div>

            {/* 4. Financial Clearance & Discharge Bill Breakdown */}
            <div className="space-y-2 border-t border-slate-200 pt-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs sm:text-sm text-emerald-800">
                  4. Financial Settlement & Discharge Clearance (अंतिम बिल व भुगतान विवरण)
                </h4>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  (billingEstimate?.pendingAmount || 0) <= 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {(billingEstimate?.pendingAmount || 0) <= 0
                    ? '✓ FULLY SETTLED (PAID)'
                    : `DUE BALANCE: ₹${(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}`}
                </span>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Service / Tariff Head</th>
                      <th className="py-2 px-3 text-center">Days/Qty</th>
                      <th className="py-2 px-3 text-right">Daily Rate</th>
                      <th className="py-2 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(billingEstimate?.items || []).length > 0 ? (
                      (billingEstimate?.items || []).map((it: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{it.name}</td>
                          <td className="py-2 px-3 text-center text-slate-700">{it.days || 1}</td>
                          <td className="py-2 px-3 text-right text-slate-700 font-mono">₹{(it.fee || 0).toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                            ₹{((it.fee || 0) * (it.days || 1)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-2 px-3 text-center text-slate-500 italic">
                          Standard bed and physician tariff applied.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Amount Breakdown Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-sans uppercase">Gross Total</span>
                  <strong className="text-slate-900 text-sm sm:text-base">₹{(billingEstimate?.grandTotal || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-sans uppercase">Discount</span>
                  <strong className="text-slate-700 text-sm sm:text-base">₹{(billingEstimate?.discount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-sans uppercase">Advance Deposit</span>
                  <strong className="text-emerald-700 text-sm sm:text-base">-₹{(billingEstimate?.totalPaid || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-sans uppercase">Net Due (देय)</span>
                  <strong className={(billingEstimate?.pendingAmount || 0) <= 0 ? 'text-emerald-700 text-base sm:text-lg' : 'text-rose-600 text-base sm:text-lg'}>
                    ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs sm:text-sm">
              <div>
                <div className="font-serif italic font-bold text-slate-800 text-sm sm:text-base">
                  Hospital Cashier / Billing Desk
                </div>
                <div className="border-t border-slate-300 pt-0.5 mt-0.5 font-bold text-xs text-slate-500 uppercase">
                  Accounts &amp; Clearance Officer
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Verification: CH-{Date.now().toString().slice(-6)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-emerald-800 text-sm sm:text-base">
                  {selectedPatient?.doctor || doctorName || '—'}
                </div>
                <div className="border-t border-slate-300 pt-0.5 mt-0.5 font-bold text-xs text-slate-600 uppercase">
                  Authorized Medical Officer &amp; Seal
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Chaudhary Hospital HMIS Cloud
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Discharge Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── QUICK PAYMENT COLLECTION MODAL ── */}
      {isPaymentModalOpen && selectedPatient && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="मरीज बिल भुगतान संग्रह (Collect Patient Payment)"
          maxWidth="md"
        >
          <div className="p-4 sm:p-5 space-y-4 bg-white text-slate-900">
            {/* Patient Header Mini Dossier */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm sm:text-base">{selectedPatient.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedPatient.id} • {selectedPatient.bedNo} ({selectedPatient.ward})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block uppercase font-bold">बकाया राशि (Due)</span>
                <span className="font-mono font-black text-rose-600 text-base sm:text-lg">
                  ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Bill Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-100/70 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-medium">Gross Bill</span>
                <strong className="text-slate-800 font-mono text-sm">
                  ₹{(billingEstimate?.grandTotal || 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block font-medium">Paid So Far</span>
                <strong className="text-emerald-700 font-mono text-sm">
                  ₹{(billingEstimate?.totalPaid || 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                <span className="text-rose-700 block font-medium">Balance Due</span>
                <strong className="text-rose-700 font-mono text-sm">
                  ₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Payment Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                भुगतान राशि (Payment Amount ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-base">₹</span>
                <input
                  type="number"
                  min="1"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Enter amount to pay"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-lg text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(billingEstimate?.pendingAmount || 0)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Full Due (₹{(billingEstimate?.pendingAmount || 0).toLocaleString('en-IN')})
                </button>
                {(billingEstimate?.pendingAmount || 0) > 1000 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round((billingEstimate?.pendingAmount || 0) / 2))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    50% (₹{Math.round((billingEstimate?.pendingAmount || 0) / 2).toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>

            {/* Payment Mode Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                भुगतान का माध्यम (Payment Mode) *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Cash', 'UPI', 'Card', 'NetBanking'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-1 rounded-xl text-xs font-black text-center border transition-all cursor-pointer ${
                      paymentMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {mode === 'Cash' ? '💵 Cash' : mode === 'UPI' ? '📱 UPI' : mode === 'Card' ? '💳 Card' : '🏦 NetBank'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Receipt remarks */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                रसीद विवरण / नोट (Receipt Reference / Notes)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Counter Cash / GPay UTR #12345"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                disabled={isSubmittingPayment || paymentAmount <= 0}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPayment ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>भुगतान जमा करें (Collect ₹{paymentAmount.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DISCHARGE SUCCESS CELEBRATION MODAL ── */}
      {isDischargeSuccessModalOpen && dischargeSuccessData && (
        <Modal
          isOpen={isDischargeSuccessModalOpen}
          onClose={() => setIsDischargeSuccessModalOpen(false)}
          title="मरीज डिस्चार्ज सफलता (Discharge Successful)"
          maxWidth="md"
        >
          <div className="p-5 sm:p-6 space-y-5 bg-white text-slate-900 text-center">
            {/* Animated Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official Discharge Complete
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {dischargeSuccessData.patientName} डिस्चार्ज हो गए हैं!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                UHID: <strong className="font-mono text-slate-800">{dischargeSuccessData.patientId}</strong> • डॉ. {dischargeSuccessData.doctor}
              </p>
            </div>

            {/* Bed Release Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-emerald-600" />
                  वार्ड व बेड स्थिति (Bed Released)
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  NOW VACANT
                </span>
              </div>
              <p className="text-sm font-black text-slate-900">
                {dischargeSuccessData.bedNo} • {dischargeSuccessData.ward}
              </p>
              <p className="text-xs text-emerald-800">
                ✓ बेड सफलतापूर्वक खाली कर दिया गया है और अब नए मरीज के लिए उपलब्ध है।
              </p>
            </div>

            {/* Clearance & Bill Card */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 grid grid-cols-2 gap-2 text-left text-xs">
              <div>
                <span className="text-slate-500 block">कुल बिल (Total Bill)</span>
                <strong className="font-mono text-slate-900 text-sm">
                  ₹{dischargeSuccessData.grandTotal?.toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">बकाया राशि (Due)</span>
                <strong className="font-mono text-emerald-700 text-sm flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> ₹0 (चुकता)
                </strong>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDischargeSuccessModalOpen(false);
                  setIsSummaryModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>डिस्चार्ज स्लिप प्रिंट करें (Print Discharge Summary)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDischargeSuccessModalOpen(false);
                  handleClearPatient();
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                मरीज सूची पर वापस जाएं (Back to Patients)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
