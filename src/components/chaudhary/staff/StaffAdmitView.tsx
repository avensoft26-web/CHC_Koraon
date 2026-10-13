import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Stethoscope, 
  User, 
  Zap, 
  UserPlus, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Building2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { api } from '../../../services/api';
import { fetchHospitalDoctors } from '../../../utils/hospitalDoctors';
import { DiagnosisAutocomplete } from '../../common/DiagnosisAutocomplete';

export interface AdmittedPatientEntry {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  ward: string;
  bedNo: string;
  doctor: string;
  diagnosis: string;
  vitals: string;
  admittedAt: string;
  admittedBy: string;
  status: 'In ICU' | 'Admitted' | 'Emergency';
  guardian?: string;
  address?: string;
  deposit?: number;
}

interface StaffAdmitViewProps {
  onAdmitSuccess: (patient: AdmittedPatientEntry) => void;
  onViewPatients: () => void;
}

export const StaffAdmitView: React.FC<StaffAdmitViewProps> = ({
  onAdmitSuccess,
  onViewPatients,
}) => {
  // IPD Patient Identity & Residence Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [guardianName, setGuardianName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // IPD Ward Allocation & Clinical Fields
  const [bedNumber, setBedNumber] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [condition, setCondition] = useState('');
  // No prefilled deposit amount — a recorded advance must be what was actually
  // taken from the patient, never a built-in number.
  const [depositAmount, setDepositAmount] = useState('');

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Doctors + free beds loaded live from MongoDB (never hard-coded)
  const [doctorList, setDoctorList] = useState<{ name: string }[]>([]);
  const [availableBeds, setAvailableBeds] = useState<string[]>([]);
  const doctors = doctorList.map(d => d.name);

  // Available bed list based on gender
  const getAvailableBeds = () => {
    if (!gender) return [];
    if (gender === 'Male') return availableBeds.filter(b => b.startsWith('Male') || b.startsWith('ICU'));
    if (gender === 'Female') return availableBeds.filter(b => b.startsWith('Female') || b.startsWith('ICU'));
    return availableBeds;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [docs, bedRes] = await Promise.all([
        fetchHospitalDoctors().catch(() => []),
        api.patients.getAvailableBeds().catch(() => null),
      ]);
      if (!mounted) return;
      setDoctorList(docs);
      setAssignedDoctor(prev => (prev || docs[0]?.name || ''));
      if (bedRes?.success && Array.isArray(bedRes.beds)) setAvailableBeds(bedRes.beds);
    })();
    return () => { mounted = false; };
  }, []);

  // Reset Form
  const handleReset = () => {
    setFullName('');
    setAge('');
    setGender('');
    setGuardianName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setBedNumber('');
    setAssignedDoctor(doctorList[0]?.name ?? '');
    setCondition('');
    setDepositAmount('');
    setErrorMsg('');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter patient Full Name.');
      return;
    }
    if (!age || parseInt(age, 10) <= 0) {
      setErrorMsg('Please enter a valid Patient Age.');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select Patient Gender.');
      return;
    }
    if (!guardianName.trim()) {
      setErrorMsg('Please enter Guardian / Kin Name for IPD admission.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Please enter Contact Mobile Number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter Full Address.');
      return;
    }
    if (!bedNumber) {
      setErrorMsg('Please select Bed Number for IPD admission.');
      return;
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Generate unique ID
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const newUhid = `P-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${randomSeq}`;

    const wardName = bedNumber.includes('ICU')
      ? 'ICU' 
      : (gender === 'Female' ? 'Female Ward' : (gender === 'Male' ? 'Male Ward' : 'General Ward'));

    const newPatient: AdmittedPatientEntry = {
      id: `p-${Date.now()}`,
      uhid: newUhid,
      name: fullName.trim(),
      age: parseInt(age, 10),
      gender: gender as any,
      contact: mobile.trim(),
      ward: wardName,
      bedNo: bedNumber,
      doctor: assignedDoctor,
      diagnosis: condition.trim() || '',
      vitals: 'No vitals recorded',
      admittedAt: `${dateFormatted} ${timeFormatted}`,
      admittedBy: 'Staff',
      status: bedNumber.includes('ICU') ? 'In ICU' : 'Admitted',
      guardian: guardianName.trim(),
      address: address.trim(),
      deposit: parseInt(depositAmount || '0', 10) || 0,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onAdmitSuccess(newPatient);
      setIsSuccess(false);
      onViewPatients();
    }, 600);
  };

  const calculatedWard = bedNumber.includes('ICU') 
    ? 'ICU Critical' 
    : (gender === 'Female' ? 'Female Ward' : (gender === 'Male' ? 'Male Ward' : 'General Ward'));

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-1 px-1 sm:px-2 animate-fadeIn">
      
      {/* Unified Master Card with 3D Glassmorphism (Compact Screen Fit) */}
      <div className="relative glass-panel-3d overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.05),inset_0_1.5px_2px_rgba(255,255,255,1)] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 transition-all">

        {/* 1. MASTER CARD TOP HEADER BAR (Modernized, Line-Free Clinical Console) */}
        <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          {/* Title & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Bed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Patient Admission (IPD)
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs bg-teal-50 text-teal-800 border-teal-200/90 tracking-wide">
                  In-Patient Department
                </span>
              </div>
            </div>
          </div>

          {/* Right: Bed / Status Indicator + View Admitted Patients Button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 border border-emerald-200/90 rounded-lg text-xs font-semibold text-emerald-800 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>18 Free Beds Ready</span>
            </div>

            <button
              type="button"
              onClick={onViewPatients}
              className="group px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.4] text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>View Admitted Patients</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {isSuccess && (
          <div className="mx-4 mt-2 p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex items-center gap-2 shadow-2xs text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5] flex-shrink-0" />
            <span>Patient Admitted & Bed Allocated Successfully! Redirecting...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-rose-50/90 border border-rose-300 text-rose-950 flex items-center gap-2 shadow-2xs text-xs font-bold animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 stroke-[2.5] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2. FORM BODY (Compact, Zero-Scroll) */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-stretch">
              
              {/* Left Column: PATIENT IDENTITY & RESIDENCE */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col space-y-3.5">
                
                {/* Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs border border-white/40">
                      <User className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 tracking-tight">
                      Patient Identity & Demographics
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/70">
                    * Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Full Name <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Gov ID / Aadhaar</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter Full Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="130"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Enter Age"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Gender <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-xs text-emerald-600 font-bold">Routes Ward</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value as any);
                          setBedNumber('');
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer appearance-none shadow-2xs"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male (Male Ward / ICU)</option>
                        <option value="Female">Female (Female Ward / ICU)</option>
                        <option value="Other">Other (Special Suite)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Guardian Name */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Guardian / Kin <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Enter Guardian / Next of Kin Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      Mobile <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter 10-digit Mobile Number"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Email (Optional)
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Digital Invoices</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email Address"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Full Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      Residential Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter Residential Address"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                </div>

              </div>

              {/* Right Column: WARD ALLOCATION & CLINICAL INFO */}
              <div className="rounded-2xl p-4 sm:p-5 bg-white/90 border border-slate-200/90 shadow-sm flex flex-col space-y-3.5">
                
                {/* Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-teal-400 to-emerald-600 text-white flex items-center justify-center shadow-xs border border-white/40">
                      <Bed className="w-4 h-4 stroke-[2.4]" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 tracking-tight">
                      Ward Allocation & Clinical Routing
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                    Live Beds Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  
                  {/* Bed Number */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-teal-600" />
                        Bed Number <span className="text-rose-500">*</span>
                      </span>
                      {!gender && <span className="text-xs text-amber-600 font-bold">Pick Gender</span>}
                    </label>
                    <div className="relative">
                      <select
                        disabled={!gender}
                        value={bedNumber}
                        onChange={(e) => setBedNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white disabled:bg-slate-100/70 disabled:cursor-not-allowed border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer appearance-none shadow-2xs"
                      >
                        {!gender ? (
                          <option value="">Select Gender First</option>
                        ) : getAvailableBeds().length === 0 ? (
                          <option value="">No free beds available</option>
                        ) : (
                          <>
                            <option value="">Select Available Bed</option>
                            {getAvailableBeds().map((bed) => (
                              <option key={bed} value={bed}>{bed}</option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Assigned Ward Badge */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      Assigned Ward
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                      <span className="text-xs text-slate-500 font-bold">Ward:</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
                        bedNumber.includes('ICU')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}>
                        {calculatedWard}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Doctor */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                        Attending Doctor <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={assignedDoctor}
                        onChange={(e) => setAssignedDoctor(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer appearance-none shadow-2xs"
                      >
                        {doctors.length === 0 && (
                          <option value="" disabled>No doctors configured</option>
                        )}
                        {doctors.map(doc => (
                          <option key={doc} value={doc}>{doc}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Condition / Problem */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        Chief Complaint / Diagnosis
                      </span>
                      <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        ⚡ AI Auto-Suggest
                      </span>
                    </label>
                    <DiagnosisAutocomplete
                      value={condition}
                      onChange={setCondition}
                      placeholder="Enter Diagnosis / Chief Complaint"
                    />
                  </div>

                  {/* Admission Initial Deposit */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                        Advance Deposit (₹) <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        ₹{parseInt(depositAmount || '0', 10).toLocaleString('en-IN')}
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-slate-500 pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter Advance Deposit Amount"
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 rounded-xl text-sm font-bold text-slate-900 outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* 3. MASTER CARD DOCKED FOOTER (Compact, Refined Bar) */}
          <div className="px-5 sm:px-6 py-3 bg-gradient-to-r from-slate-50/95 via-white to-slate-50/95 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.02)]">
            
            {/* Live Preview Summary Pill */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-4.5 h-4.5 opacity-80" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  <span className="w-1.5 h-1.5 rounded-full inline-block bg-teal-500 animate-pulse" />
                  <span>Inpatient Admission Routing Preview</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {fullName || 'New Patient'} 
                  </span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200/80">
                    IPD Intake
                  </span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                    bedNumber 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {bedNumber ? `Bed: ${bedNumber}` : 'Bed Pending'}
                  </span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[190px]">
                    {assignedDoctor}
                  </span>
                  <span className="text-slate-300 font-bold">•</span>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Adv: ₹{parseInt(depositAmount || '0', 10).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0 ml-auto">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer active:scale-95 hover:scale-101 border border-emerald-400/30"
              >
                <UserPlus className="w-4.5 h-4.5 stroke-[2.8]" />
                <span>Admit Patient & Allocate Bed</span>
              </button>
            </div>

          </div>

        </form>

      </div>

    </div>
  );
};
